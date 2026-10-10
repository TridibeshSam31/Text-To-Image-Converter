import 'dotenv/config';
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import  jwt  from "jsonwebtoken";
import razorpay from "razorpay" 
import transactionModel from "../models/transactionModel.js";
//yahan par hum user ko login aur register krne ke liye conytroller likhenge jaise humne demoproject mai kiya tha

const registerUser = async (req, res) => {
    try {
        const{name,email,password} = req.body
        if (!name||!email||!password) {
           return res.json({sucess:false , message:'Missing Details'})
            
        }
        const existingUser = await userModel.findOne({email})
        if (existingUser) {
            return res.json({sucess:false , message:'User already exists with this email'})
        }
        const salt = await bcrypt.genSalt(10) //iski jagah mai hum directly hased password mai bhi isse likh skte the koi change nhi hota
        const hashedPassword = await bcrypt.hash(password, salt) //hashing password

        const userData = {
            name,
            email,
            password: hashedPassword
            
        }
        const newUser = new userModel(userData) //user model mai iss userdata ko diya aur ab isse save kr denge
        const user = await newUser.save()

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
        res.json({sucess:true , success:true , user: {name: user.name},token})
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
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
             const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
             res.json({sucess:true , success:true , user: {name: user.name},token})
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
       const userId = req.userId || req.body.userId || req.body.userID;
       if (!userId) {
           return res.json({sucess:false , message:'User not authenticated'})
       }
       
       const user = await userModel.findById(userId)
       if (!user) {
           return res.json({sucess:false , message:'User not found'})
       }
       res.json({sucess:true , success:true , credits:user.creditBalance , user:{name: user.name}})
    } catch (error) {
         console.log(error)
         res.json({sucess:false , message: error.message})
    }
}

const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return null;
    }
    return new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

const plans = {
    'Basic': { plan: 'Basic', credits: 100, amount: 10 },
    'Advanced': { plan: 'Advanced', credits: 500, amount: 50 },
    'Business': { plan: 'Business', credits: 5000, amount: 250 }
};

const razorpayPayment = async (req, res) => {
    try {
     const userId = req.userId || req.body.userId || req.body.userID;
     const { planId } = req.body;
     const userData = await userModel.findById(userId)
     if (!userData || !planId) {
        return res.json({sucess:false , message:'Missing Details'})
     }
     const razorpayInstance = getRazorpayInstance();
     if (!razorpayInstance) {
        return res.json({sucess:false, message:'Razorpay keys missing in backend/.env. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'})
     }
     const selectedPlan = plans[planId] || plans['Basic'];
     const credits = selectedPlan.credits;
     const plan = selectedPlan.plan;
     const amount = selectedPlan.amount;
     const date = Date.now();
     const transactionData = {
         userId,
         plan,
         amount,
         credits,
         payment: false,
         data: date
     }
         const newTransaction = await transactionModel.create(transactionData) //kuch nhi bas database mai save krwa diya ab

         //order ko create krne ke liye kya krenge 

         const order = await razorpayInstance.orders.create({
             amount: newTransaction.amount * 100,
             currency: process.env.CURRENCY || "INR",
             receipt: newTransaction._id.toString()
         });

         res.json({sucess:true, success:true, order, key: process.env.RAZORPAY_KEY_ID})

    } catch (error) {
        console.log(error)
        res.json({sucess:false,message:error.message})
    }
}


/*
ab payment jo krenge usko verify kaise krenge usko very krne ke liye bhi humme function likhna hoga
lekin hoga woh function asyncronous because hume database se transaction ki details lene hain aur woh bhi asyncronous hoga
toh hum ek async function likhenge jo payment verification karega
*/
const verifyRazorpay = async (req, res)=>{
    try {
        const {razorpay_order_id} = req.body
        const razorpayInstance = getRazorpayInstance();
        if (!razorpayInstance) {
            return res.json({sucess:false, message:'Razorpay keys missing in backend/.env'})
        }

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if(orderInfo.status === 'paid'){
        const transactionData = await transactionModel.findById(orderInfo.receipt)
        if(!transactionData){
            return res.json({sucess:false,message:'Transaction not found'})
        }
        if(transactionData.payment){
            return res.json({sucess:false,message:'Payment already verified'})
        }

        const userData = await userModel.findById(transactionData.userId)
        //ab jo paise diye hai usse credit balance bhi toh add krenge so

        const creditBalance = userData.creditBalance + transactionData.credits
        await userModel.findByIdAndUpdate(userData._id,{creditBalance})
        await transactionModel.findByIdAndUpdate(transactionData._id,{payment:true})
        return res.json({sucess:true, success:true, message:'Payment verified and credits added', credits: creditBalance})
     }else{
         return res.json({sucess:false,message:'Payment not verified'})
        }
    } catch (error) {
        console.log(error)
        res.json({sucess:false,message:error.message})
    }
}

export {registerUser,loginUser,userCredits, razorpayPayment, verifyRazorpay} 