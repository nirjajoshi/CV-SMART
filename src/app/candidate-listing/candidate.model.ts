export interface Candidate {
    id: string;         // Candidate's unique ID
    fullName: string;   // Candidate's full name
    email: string;      // Candidate's email address
    status: string;     // Candidate's status (e.g., available, hired)
    cloudinaryUrl: string; // URL to the candidate's resume on Cloudinary
  }
  