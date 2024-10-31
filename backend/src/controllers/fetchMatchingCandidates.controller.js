import { User } from '../models/user.models.js';
import JobDescription  from '../models/jobdescription.models.js'; // Assuming you have a JobDescription model
import { Resume } from '../models/resume.models.js'; // Import the Resume model

export const fetchMatchingCandidates = async (commonId, userId) => {
    if (!commonId || !userId) {
        throw new Error('commonId and userId are required');
    }

    try {
        // Fetch the job description embeddings from MongoDB
        const jobResult = await JobDescription.findOne({
            common_id: commonId,
            user_id: userId
        });

        console.log('Job result:', jobResult);

        if (!jobResult) {
            return { message: 'Job description not found for the provided commonId and userId' };
        }

        const jobEmbeddings = jobResult.embeddings;
        if (!Array.isArray(jobEmbeddings) || jobEmbeddings.length === 0) {
            return { message: 'Job description embeddings are invalid' };
        }

        // Fetch resumes from MongoDB
        const resumeResults = await Resume.find({});

        console.log('Resume results:', resumeResults);

        const matchedCandidates = resumeResults
            .map((resume) => {
                const resumeEmbeddings = resume.embeddings;
                if (!Array.isArray(resumeEmbeddings) || resumeEmbeddings.length === 0) {
                    return null; // Skip invalid resume embeddings
                }

                const similarity = cosineSimilarity(jobEmbeddings, resumeEmbeddings);
                return {
                    id: resume._id,
                    userId: resume.user_id,
                    similarity: similarity,
                    cloudinaryUrl: resume.cloudinary_url // Fetching the Cloudinary URL from MongoDB
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
