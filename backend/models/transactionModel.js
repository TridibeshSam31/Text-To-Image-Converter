import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId:{type:String,required:true},
    plan:{type:String,required:true},
    amount:{type:Number,required:true},
    credits:{type:Number,required:true},
    payment:{type:Boolean,required:true},
    data:{type:Number}
})

const transactionModel = mongoose.model("Transaction", transactionSchema);

export default transactionModel;