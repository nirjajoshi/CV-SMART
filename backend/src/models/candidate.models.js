import mongoose,{Schema} from 'mongoose';

const candidateSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    information: { 
        type: Object,  // You can specify the structure of the JSON if needed
        required: true 
    },
    resumeUrl: { 
        type: String, // This would be the URL to the resume in S3 or other storage
        required: true 
    },
    embeddings: { 
        type: [Number], // Dense vector for matching
        default: [] 
    },
    location: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true ,
        unique: true,
        lowercase: true
    },
    status: { 
        type: String, 
        enum: ['open_to_network', 'not_open_to_network'], 
        default: 'open_to_network' 
    },
},{
        timestamps:true 
    }
);

export const Candidate = mongoose.model("Candidate", candidateSchema)

