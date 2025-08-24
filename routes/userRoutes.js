import express from 'express'
import { registerUser,loginUser, userCredits } from '../controllers/userController.js'
import userAuth from '../middleware/auth.js'
//import { razorpayPayment } from '../controllers/paymentController.js'
//import { verifyRazorpay } from '../controllers/paymentController.js'
const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
//userRouter.post('/credits',userCredits) isko use krne ke liye obv humko middleware mai hi jana pdega 
userRouter.post('/credits',userAuth,userCredits)

//userRouter.post('/pay-razorpay',userAuth,razorpayPayment)
//userRouter.post('/verify-razorpay'verifyRazorpay)//justified hai ab kyu le kr aaunga middleare ko isme

export default userRouter