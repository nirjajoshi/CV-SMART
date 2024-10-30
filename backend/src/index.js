// require('dotenv').config({path:'./env'})   use this or below method or dotenv 

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js"
dotenv.config({
    path: './env'
})

connectDB()

.then(()=>{
    app.listen(process.env.PORT || 8000,'0.0.0.0' , () =>{
        console.log(`Server is running at port:${process.env.PORT || 8000}`);
    })
})
.catch((err) =>{
    console.log("MongoDB connection failed ",err);
})


// Use this code or just go to db folder index.js use that .This gives a systematic look to main index.js becuase very few code is written here 

// import express from "express"
// import { error } from "console"
// const app = express

// (async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("errror",(error)=>{
//             console.log("ERRROR",error);
//             throw error 
//         })
//         app.listen(process.env.PORT,() =>{
//             console.log(`App is listening on port ${process.env.PORT}`)
//         })
        
//     } catch (error) {
//         console.error("ERROR",error)
//         throw err 
        
//     }
// })()

