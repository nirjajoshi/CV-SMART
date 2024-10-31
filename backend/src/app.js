import express from "express"
import path from 'path';
import { fileURLToPath } from 'url'; 
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv";

dotenv.config();
const __filename = fileURLToPath(import.meta.url); // Required for ES modules
const __dirname = path.dirname(__filename); // Required for ES module

const app = express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
     credentials : true
}))

app.use(express.json({limit:"50mb"}))
app.use (express.urlencoded({extended:true,limit:"50mb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import 
import userRouter from "./routes/user.routes.js"
import jobDescriptionRouter from './routes/jobdescription.routes.js';
import resumeRouter from './routes/resume.routes.js'
import matchingroute from './routes/matchingjob.routes.js'
import getuserid from './routes/userid.routes.js'
import fileRoutes from './routes/file.route.js';
import matchingCandidatesRoutes from './routes/matchingCandidates.routes.js'; 
import updatejob from './routes/jobupdate.routes.js'



//routes declaration 
app.use("/api/v1/users",userRouter)
app.use("/api/v1/job_description",jobDescriptionRouter)
app.use("/api/v1/resume",resumeRouter)
app.use("/api/v1/", matchingroute)
app.use("/api/v1/userid",getuserid)
app.use('/api/v1/', fileRoutes)
app.use('/api/v1', matchingCandidatesRoutes)
app.use('/api/v1', updatejob)





export default app