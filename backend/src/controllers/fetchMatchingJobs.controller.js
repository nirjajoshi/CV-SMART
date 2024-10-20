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

        // Log the resume result for debugging
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

        // Log the job result for debugging
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
                    similarity: similarity
                };
            })
            .filter(job => job && job.similarity > 0.5); // Lower threshold to 0.5 for testing

        // Log the matched jobs for debugging
        console.log('Matched jobs:', matchedJobs);

        if (!matchedJobs.length) {
            return { message: 'No matching jobs found' };
        }

        // Fetch status from MongoDB for each matched job
        const finalResults = await Promise.all(
            matchedJobs.map(async (job) => {
                const jobStatus = await User.findById(job.userId).select('status');
                return {
                    id: job.id,
                    title: job.title,
                    location: job.location,
                    fileUrl: `http://localhost:8000/uploads/job_descriptions/${encodeURIComponent(job.title)}`,
                    status: jobStatus ? jobStatus.status : 'Unknown'
                };
            })
        ).then(results => results.filter(Boolean)); // Filter out any null results

        return finalResults;

    } catch (error) {
        console.error('Error fetching matching jobs:', error);
        throw new Error('Error fetching matching jobs: ' + error.message);
    }
};

// Cosine similarity calculation
const cosineSimilarity = (vecA, vecB) => {
    if (vecA.length !== vecB.length) {
        throw new Error("Vectors must be of the same length");
    }
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0; // Avoid division by zero
    }

    return dotProduct / (magnitudeA * magnitudeB);
};
