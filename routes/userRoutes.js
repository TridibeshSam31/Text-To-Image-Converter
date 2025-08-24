import express from 'express'
import { registerUser,loginUser, userCredits } from '../controllers/userController.js'
import userAuth from '../middleware/auth.js'
const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
//userRouter.post('/credits',userCredits) isko use krne ke liye obv humko middleware mai hi jana pdega 
userRouter.post('/credits',userAuth,userCredits)

export default userRouter