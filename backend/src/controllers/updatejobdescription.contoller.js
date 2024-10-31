import JobDescription  from '../models/jobdescription.models.js'; // Import JobDescription model

// Fetch all job descriptions
export const getJobs = async (req, res) => {
    try {
        const jobs = await JobDescription.find({}).limit(1000); // Fetch all jobs with a limit

        const formattedJobs = jobs.map(job => ({
            id: job._id,
            title: job.file_name || 'No title available', // Adjust based on your actual field name
            status: job.status || 'Unknown'
        }));

        res.json(formattedJobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: "Error fetching jobs", error });
    }
};

// Update job status
export const updateJobStatus = async (req, res) => {
    const jobId = req.params.id;
    const { status } = req.body;

    try {
        // Update the job status in MongoDB
        const updatedJob = await JobDescription.findByIdAndUpdate(jobId, { status }, { new: true });

        if (!updatedJob) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.json({ message: "Status updated successfully", job: updatedJob });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Error updating status", error });
    }
};
