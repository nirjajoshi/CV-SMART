import es from '../utils/elasticsearchClient.js'; // Adjust based on your setup

export const getOriginalFilePath = async (userId) => {
  try {
    const result = await es.search({
      index: 'job_description_index',
      body: {
        query: {
          match: { user_id: userId }
        }
      }
    });

    if (result.body.hits.total.value > 0) {
      const jobDescription = result.body.hits.hits[0]._source;
      return jobDescription.file_name; // Assuming the file name is stored here
    } else {
      throw new Error('Job description not found');
    }
  } catch (error) {
    console.error("Error fetching original file path:", error);
    return null; // Or handle the error as needed
  }
};
