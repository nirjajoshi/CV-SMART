// models/Candidate.js
import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    parsedResume: {
        PI: {
            FirstName: String,
            MiddleName: String,
            LastName: String,
            Name: String,
            Dob: String,
            Gender: String,
            Gender_Code: String,
            Email: String,
            "Mobile No": String,
            Address: String,
            City: String,
            State: String,
            State_Code: String,
            Country: String,
            "Linkedin/GitHub/Portfolio": String,
            "Pin Code": String,
            Nationality: String,
            Nationality_Code: String,
            Religion: String
        },
        Education: [
            {
                Education: String,
                Institute: String,
                Marks: String,
                Duration: String
            }
        ],
        skills: [String],
        "Softwares/Tools": [String],
        Certifications: [String],
        Experience: {
            Total_Experience: String,
            "Companies Worked AT": [
                {
                    Company: String,
                    Designation: String
                }
            ]
        },
        "Competitive Exams": [String],
        "Competitive Score": [String],
        "Publications/Patents": [String],
        "Awards/Achievements": [String],
        References: [String],
        Others: {
            "Languages Known": [String],
            "Matrial Status": String,
            Hobbies: [String]
        }
    },
    resumeUrl: { 
        type: String, 
        required: true 
    },
    embeddings: { 
        type: [Number], 
        default: [] 
    },
    location: { 
        type: String, 
        required: true 
    },
}, {
    timestamps: true 
});

const Candidate = mongoose.model("Candidate", candidateSchema);
export { Candidate };
