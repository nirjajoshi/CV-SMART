import mongoose,{Schema} from 'mongoose';
const dashboardSchema = new mongoose.Schema({
    companyId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Company', 
        required: true 
    },
    candidateId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Candidate', 
        required: true 
    },
    hiredAt: { 
        type: Date, 
        default: Date.now 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Ensure that the same candidate is not hired by the same company twice
dashboardSchema.index({ companyId: 1, candidateId: 1 }, { unique: true });

export const Dashboard = mongoose.model('Dashboard', dashboardSchema)

