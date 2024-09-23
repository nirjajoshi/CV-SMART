import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

app.get("/",(req,res)=>{
    res.status(200).send("nirja loves mann");
})

const app = express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
     credentials : true
}))

app.use(express.json({limit:"25kb"}))
app.use (express.urlencoded({extended:true,limit:"25kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import 
import userRouter from "./routes/user.routes.js"

//routes declaration 
app.use("/api/v1/users",userRouter)


export default app