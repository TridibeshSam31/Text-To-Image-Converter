import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import  jwt  from "jsonwebtoken";
import razorpay from "razorpay" 
//yahan par hum user ko login aur register krne ke liye conytroller likhenge jaise humne demoproject mai kiya tha

const registerUser = async (req, res) => {
    try {
        const{name,email,password} = req.body
        if (!name||!email||!password) {
           return res.json({sucess:false , message:'Missing Details'})
            
        }
        const salt = await bcrypt.genSalt(10) //iski jagah mai hum directly hased password mai bhi isse likh skte the koi change nhi hota
        const hashedPassword = await bcrypt.hash(password, salt) //hashing password

        const userData = {
            name,
            email,
            hashedPassword
            
        }
        const newUser = new userModel(userData) //user model mai iss userdata ko diya aur ab isse save kr denge
        const user = await newUser.save()

        const token = jwt.sign({id:user_id},process.env.JWT_SECRET)
        res.json({sucess:true , user: {name: user.name},token})
    } catch (error) {
        console.log(error)
        res.json({sucess:false , message: error.message})
        
    }
}

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({sucess:false , message:'user does not exist'})
        }
        const isMatch = await bcrypt.compare(password, user.hashedPassword)
        if (isMatch) {
             const token = jwt.sign({id:user_id},process.env.JWT_SECRET)
             res.json({sucess:true , user: {name: user.name},token})
        } else {
            return res.json({sucess:false , message:'Invalid Credentials'})
        }
        
    } catch (error) {
         console.log(error)
         res.json({sucess:false , message: error.message})
    }
}
const userCredits = async (req, res) => {
    try {
       const {userId} = req.body ; 
       
       const user = await userModel.findById(userId)
       res.json({sucess:true , credits:user.creditBalance , user:{name: user.name}})
    } catch (error) {
         console.log(error)
         res.json({sucess:false , message: error.message})
    }
}

/*const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET,
});
const razorpayPayment = async (req, res) => {
    try {
     const {userId , planId} = req.body   
     const userData = awail.userModel.findById(userId)
     if (!userId|| !planId) {
        return res.json({sucess:false , message:'Missing Details'})
     }
     let credits,plan,amount,date
    } catch (error) {
        console.log(error)
        res.json({sucess:false,message:error.message})
    }
}*/

export {registerUser,loginUser,userCredits} 