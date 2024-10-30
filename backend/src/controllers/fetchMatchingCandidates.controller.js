import es from '../utils/elasticsearchClient.js';
import { User } from '../models/user.models.js';

export const fetchMatchingCandidates = async (commonId, userId) => {
    if (!commonId || !userId) {
        throw new Error('commonId and userId are required');
    }

    try {
        // Fetch the job description embeddings from job_description_index
        const jobResult = await es.search({
            index: 'job_description_index',
            body: {
                query: {
                    bool: {
                        must: [
                            { match: { common_id: commonId } },
                            { match: { user_id: userId } }
                        ]
                    }
                }
            }
        });

        console.log('Job result:', jobResult);

        if (!jobResult.hits.hits.length) {
            return { message: 'Job description not found for the provided commonId and userId' };
        }

        const jobEmbeddings = jobResult.hits.hits[0]._source.embeddings;
        if (!Array.isArray(jobEmbeddings) || jobEmbeddings.length === 0) {
            return { message: 'Job description embeddings are invalid' };
        }

        // Fetch resumes and their embeddings from resume_index
        const resumeResult = await es.search({
            index: 'resume_index',
            body: {
                query: {
                    match_all: {}
                }
            }
        });

        console.log('Resume result:', resumeResult);

        const matchedCandidates = resumeResult.hits.hits
            .map((resume) => {
                const resumeEmbeddings = resume._source.embeddings;
                if (!Array.isArray(resumeEmbeddings) || resumeEmbeddings.length === 0) {
                    return null; // Skip invalid resume embeddings
                }

                const similarity = cosineSimilarity(jobEmbeddings, resumeEmbeddings);
                return {
                    id: resume._id,
                    userId: resume._source.user_id,
                    similarity: similarity,
                    cloudinaryUrl: resume._source.cloudinary_url // Fetching the Cloudinary URL from Elasticsearch
                };
            })
            .filter(candidate => candidate && candidate.similarity > 0.5);

        console.log('Matched candidates:', matchedCandidates);

        if (!matchedCandidates.length) {
            return { message: 'No matching candidates found' };
        }

        // Fetch status, email, and full name from MongoDB for each matched candidate
        const finalResults = await Promise.all(
            matchedCandidates.map(async (candidate) => {
                const candidateInfo = await User.findById(candidate.userId).select('status email fullname');
                
                // Log the candidate info
                console.log('Candidate ID:', candidate.userId, 'Info:', candidateInfo);

                return {
                    id: candidate.id,
                    cloudinaryUrl: candidate.cloudinaryUrl,
                    status: candidateInfo ? candidateInfo.status : 'Unknown',
                    email: candidateInfo ? candidateInfo.email : 'Unknown',
                    fullName: candidateInfo ? candidateInfo.fullname : 'Unknown' // Change to 'fullname' to match your model
                };
            })
        ).then(results => results.filter(Boolean));

        // Log final results
        console.log('Final Results:', finalResults);
        return finalResults;

    } catch (error) {
        console.error('Error fetching matching candidates:', error);
        throw new Error('Error fetching matching candidates: ' + error.message);
    }
};

// Cosine similarity calculation remains the same
const cosineSimilarity = (vecA, vecB) => {
    if (vecA.length !== vecB.length) {
        throw new Error("Vectors must be of the same length");
    }
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
};
