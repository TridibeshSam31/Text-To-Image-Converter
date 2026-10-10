import mongoose from "mongoose"
import {DB_NAME} from "../constants.js"


const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017"
        const connectionInstance = await mongoose.connect(`${uri}/${DB_NAME}`)
        console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("Primary MongoDB URI failed, connecting to local MongoDB (27017)...")
        try {
            const localInstance = await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`)
            console.log(`MongoDB Connected (local fallback): ${localInstance.connection.host}`);
        } catch (localError) {
            console.log("MONGODB CONNECTION ERROR" ,error)
            process.exit(1)
        }
        
    }
}

export default connectDB;