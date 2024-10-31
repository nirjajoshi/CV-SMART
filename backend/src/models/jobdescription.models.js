import mongoose from 'mongoose';

// Define the job description schema
const jobDescriptionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Reference to the User model
    },
    file_name: {
        type: String,
        required: true // Required field for the file name
    },
    file_url: {
        type: String,
        required: true // Required field for the file URL
    },
    location: {
        type: String,
        required: false // Optional field for location
    },
    posted_date: {
        type: Date,
        default: Date.now // Default value for posted date
    },
    status: {
        type: String,
        required: false // Optional field for status
    },
    embeddings: {
        type: Array,
        required: true // Required field for embeddings
    },
    cloudinary_url: {
        type: String,
        required: true // Required field for Cloudinary URL
    },
    common_id: {
        type: String, // Type can be changed based on your requirement
        required: false // Optional field for common ID
    }
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
});

// Create the JobDescription model
const JobDescription = mongoose.model('JobDescription', jobDescriptionSchema);

// Export the model for use in other parts of the application
export default JobDescription;
