import { Client } from '@elastic/elasticsearch';

const es = new Client({
  node: 'http://localhost:9200', // Your Elasticsearch URL
  auth: {
    username: 'nirja',
    password: '123456',
  },
});

export default es;
