import es from '../utils/elasticsearchClient.js';// Updated to use ES6 import syntax

// Fetch all job descriptions
export const getJobs = async (req, res) => {
    try {
        const response = await es.search({
            index: 'job_description_index',
            size: 1000,
            query: {
                match_all: {}
            }
        });

        const jobs = response.hits.hits.map(hit => ({
            id: hit._id,
            title: hit._source.file_name || 'No title available', // Adjust this based on your actual field name
            status: hit._source.status || 'Unknown'
        }));

        res.json(jobs);
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
        await es.update({
            index: 'job_description_index',
            id: jobId,
            doc: { status }
        });

        res.json({ message: "Status updated successfully" });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Error updating status", error });
    }
};
