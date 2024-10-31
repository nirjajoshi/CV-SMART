import { User } from '../models/user.models.js'; // Import User model
import JobDescription from '../models/jobdescription.models.js'; // JobDescription model
import { Resume } from '../models/resume.models.js'; // Resume model

export const fetchJobsForCandidate = async (commonId, userId) => {
    if (!commonId || !userId) {
        throw new Error('commonId and userId are required');
    }

    try {
        // Fetch the resume associated with the user
        const resume = await Resume.findOne({ common_id: commonId, user_id: userId });
        if (!resume) {
            return { message: 'Resume not found for the provided commonId and userId' };
        }

        const resumeEmbeddings = resume.embeddings;
        if (!Array.isArray(resumeEmbeddings) || resumeEmbeddings.length === 0) {
            return { message: 'Resume embeddings are invalid' };
        }

        // Fetch job descriptions that are related to the commonId
        const jobDescriptions = await JobDescription.find({ common_id: commonId });
        if (!jobDescriptions.length) {
            return { message: 'No job descriptions found for the provided commonId' };
        }

        const matchedJobs = [];

        for (const job of jobDescriptions) {
            const jobEmbeddings = job.embeddings;
            if (!Array.isArray(jobEmbeddings) || jobEmbeddings.length === 0) {
                continue; // Skip invalid job embeddings
            }

            const similarity = cosineSimilarity(resumeEmbeddings, jobEmbeddings);
            if (similarity > 0.5) {
                // Fetch the user associated with this job description
                const jobUser = await User.findById(job.user_id); // Assuming job.user_id is the ID of the user who posted the job

                if (jobUser) {
                    matchedJobs.push({
                        id: job._id,
                        title: job.title || job.file_name,
                        location: job.location,
                        userId: job.user_id, // User ID from job
                        similarity: similarity,
                        status: job.status, // Fetching status directly from the job description
                        cloudinaryUrl: job.cloudinary_url, // Cloudinary URL fetched from job description
                        email: jobUser.email,     // Add email from the job's user
                        fullname: jobUser.fullname // Add fullname from the job's user
                    });
                }
            }
        }

        console.log('Matched jobs for candidate:', matchedJobs);

        if (!matchedJobs.length) {
            return { message: 'No matching jobs found' };
        }

        // Return final results
        const finalResults = matchedJobs.map((job) => ({
            id: job.id,
            title: job.title,
            location: job.location,
            cloudinaryUrl: job.cloudinaryUrl, // Use the Cloudinary URL fetched from the job description
            status: job.status,
            email: job.email,         // Include the user's email
            fullname: job.fullname,   // Include the user's fullname
        }));

        return finalResults;

    } catch (error) {
        console.error('Error fetching matching jobs for candidate:', error);
        throw new Error('Error fetching matching jobs for candidate: ' + error.message);
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
