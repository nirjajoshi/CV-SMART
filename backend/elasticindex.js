import express from 'express';
import es from './src/utils/elasticsearchClient.js'; // Import Elasticsearch client
import { asyncHandler } from './src/utils/asyncHandler.js';

const app = express();
const PORT = 3000;

// Resume Index Mapping
const resumeMapping = {
  mappings: {
    properties: {
      user_id: { type: 'text' },
      candidate_id: { type: 'keyword' },
      file_name: { type: 'keyword' },
      file_content: { type: 'text' }, // Base64 encoded content
      location: { type: 'text' },
      upload_date: { type: 'date' },
      embeddings: {
        type: 'dense_vector',
        dims: 384, // Adjust based on the size of your embeddings
        similarity: 'cosine'
      },
      common_id: { type: 'keyword' } // New common identifier
    }
  }
};

// Job Description Index Mapping
const jobMapping = {
  mappings: {
    properties: {
      user_id: { type: 'text' },
      file_name: { type: 'keyword' },
      file_content: { type: 'text' }, // Base64 encoded content
      location: { type: 'text' },
      embeddings: {
        type: 'dense_vector',
        dims: 384,
        similarity: 'cosine'
      },
      posted_date: { type: 'date' },
      common_id: { type: 'keyword' } // New common identifier
    }
  }
};

// Function to delete and recreate an index
const recreateIndex = async (indexName, mapping) => {
  try {
    const indexExists = await es.indices.exists({ index: indexName });

    if (indexExists) {
      // Delete the existing index
      await es.indices.delete({ index: indexName });
      console.log(`Deleted existing index '${indexName}'`);
    }

    // Create the new index with the updated mappings
    await es.indices.create({
      index: indexName,
      body: mapping
    });

    console.log(`Index '${indexName}' recreated successfully!`);
  } catch (err) {
    console.error(`Error recreating index '${indexName}': ${err.message}`);
  }
};

// Middleware to recreate both indices
const initializeIndices = async () => {
  await recreateIndex('resume_index', resumeMapping);
  await recreateIndex('job_description_index', jobMapping);
};

// Run the initialization when the server starts
initializeIndices().then(() => {
  // Start the server on port 3000 after indices are recreated
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
