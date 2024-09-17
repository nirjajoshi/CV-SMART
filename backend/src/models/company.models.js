import mongoose,{Schema} from 'mongoose';
const companySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    companyName: { 
        type: String, 
        required: true 
    },
    information: { 
        type: Object,  // Can define this if there's specific structure
        required: true 
    },
    jobDescriptionUrl: { 
        type: String, // The URL for the uploaded job description in S3 or storage
        required: true 
    },
    embeddings: { 
        type: [Number], // Dense vector for matching job descriptions
        default: [] 
    },
    location: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['hiring', 'not_hiring'], 
        default: 'hiring' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

export const Company = mongoose.model('Company', companySchema)

