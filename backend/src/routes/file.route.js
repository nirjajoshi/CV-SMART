// routes/fileRoutes.js
import express from 'express';
import { viewFile } from '../controllers/file.controller.js'; // Adjust the path based on your file structure

const router = express.Router();

// Define the route for viewing a file
router.get('/view-file/:filename', viewFile);

export default (req, res) => {
    router(req, res); // Delegate request handling to the router
};
