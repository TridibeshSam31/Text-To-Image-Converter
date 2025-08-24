import userModel from "../models/userModel.js"
import FormData from "form-data"
import axios from "axios"

//image generate krne ka logic likhenge so mujhko yeh chaiye ki mai prompt do aur woh image generate kr de
//api bhi fetch krna pdega credit score ke liye aur agar hum text ko image mai convert kr rhe hai toh humko creditpoints ko kmm bhi krna pdega uske liye bhi logic part likhna pdega jo aasan hai
//hume iss logic ko export krna hai so 


export const imageController = async(req,res) => {
    try {
        const {userId , prompt} = req.body
        const user = await userModel.findById(userId) //user id se user ko find krna hai
        if (!user||!prompt) {
            res.json({sucess:false , message:"Details are Missing kindly fill all the details"}) //agar user nahi mila ya prompt nahi diya hai toh error message return krna
        }
        //prompt bhi lamba nhi hona chaiye jyada so humko uske liye bhi condition likhna pdega
        if (prompt.length > 1000) {
            console.log("Prompt cannot exceed 1000 characters, please maintain word limit")
            
        }
        //ab creditscore ki baari , userModel mai humne ek creditscore ka option bnaya tha mtlb ki userModel se crediBalance ka acess le skte hai 
        if (user.CreditBalance === 0 || userModel.CreditBalance<0 ) {
            res.json({sucess:false,message:"User Has Very Less Credit Balance" , CreditBalance: user.CreditBalance});
        }
        //ab text ko image mai convert krne ka logic likhna hai axios se api ko fetch krna hai 

        //by using axios
        const formData = new FormData()
        formData.append("prompt", prompt)

       const {data} = await axios.post('https://clipdrop-api.co/text-to-image/v1',formData,{
            headers:{
               'x-api-key': process.env.CLIPBOARD_API_KEY,
            },
            responseType: 'arraybuffer'  // buffer is the binary representation of the returned image   
        })
        const base64Image = Buffer.from(data,'binary').toString('base64')
        const resultImage = `data:image/png;base64,${base64Image}` //base64 image format

        await userModel.findByIdAndUpdate(user._id , {creditBalance:user.creditBalance - 1 , resultImage})

        //so basically humne kiya kya hai humne pehle axios se api ko betch kiya aur fir humne response mai arraybuffer le liya fir hum uss response ko base64 mai convert kr rhe hai
        //using buffer.form method par baat yeh hai ki base64 form mai images mongobd mai store krna shi toh hai lekin woh heavy images size ko nhi sambhal sklta uske liye hume cloudinary/s3 ka use krna pdega jo url me store karke sirf URL save karna better hota hai.
        //mai cloudinary se bhi kr rha hu inn sabko end mai comment kr dunga 
        //next step hoga razorpayu ya stripepay ko connect krna 




    } catch (error) {
         console.log(error)
         res.json({sucess:false , message: error.message})
    }
}






