import express from 'express';
import cors from 'cors'
import 'dotenv/config'
import connectDB from '../Imagify/config/config.js' ;
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';



const PORT = process.env.PORT || 4000 ;

const app = express()

app.use(cors)
app.use(express.json())

app.use('/api/users',userRouter)
app.use('/api/image',imageRouter)
app.get('/',(req,res)=> res.send("API WORKING"))

connectDB()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is running on port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGODB CONNECTION FAILED",err)
})