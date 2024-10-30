import es from '../utils/elasticsearchClient.js';
import { User } from '../models/user.models.js';

export const fetchMatchingJobs = async (commonId, userId) => {
    if (!commonId || !userId) {
        throw new Error('commonId and userId are required');
    }

    try {
        // Fetch the resume embeddings from resume_index
        const resumeResult = await es.search({
            index: 'resume_index',
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

        console.log('Resume result:', resumeResult);

        if (!resumeResult.hits.hits.length) {
            return { message: 'Resume not found for the provided commonId and userId' };
        }

        const resumeEmbeddings = resumeResult.hits.hits[0]._source.embeddings;
        if (!Array.isArray(resumeEmbeddings) || resumeEmbeddings.length === 0) {
            return { message: 'Resume embeddings are invalid' };
        }

        // Fetch job description embeddings from job_description_index
        const jobResult = await es.search({
            index: 'job_description_index',
            body: {
                query: {
                    match: {
                        common_id: commonId
                    }
                }
            }
        });

        console.log('Job result:', jobResult);

        const matchedJobs = jobResult.hits.hits
            .map((job) => {
                const jobEmbeddings = job._source.embeddings;
                if (!Array.isArray(jobEmbeddings) || jobEmbeddings.length === 0) {
                    return null; // Skip invalid job embeddings
                }

                const similarity = cosineSimilarity(resumeEmbeddings, jobEmbeddings);
                return {
                    id: job._id,
                    title: job._source.title || job._source.file_name,
                    location: job._source.location,
                    userId: job._source.user_id,
                    similarity: similarity,
                    status: job._source.status,
                    cloudinaryUrl: job._source.cloudinary_url // Fetching the Cloudinary URL from Elasticsearch
                };
            })
            .filter(job => job && job.similarity > 0.5);

        console.log('Matched jobs:', matchedJobs);

        if (!matchedJobs.length) {
            return { message: 'No matching jobs found' };
        }

        // Fetch status from MongoDB for each matched job
        const finalResults = await Promise.all(
            matchedJobs.map(async (job) => {
                const jobInfo = await User.findById(job.userId).select('email fullname');
                return {
                    id: job.id,
                    title: job.title,
                    location: job.location,
                    cloudinaryUrl: job.cloudinaryUrl, // Use the Cloudinary URL fetched from Elasticsearch
                    status: job.status,
                    email: jobInfo ? jobInfo.email : 'Unknown',
                    fullname: jobInfo ? jobInfo.fullname : 'Unknown'

                };
            })
        ).then(results => results.filter(Boolean)); 

        return finalResults;

    } catch (error) {
        console.error('Error fetching matching jobs:', error);
        throw new Error('Error fetching matching jobs: ' + error.message);
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
