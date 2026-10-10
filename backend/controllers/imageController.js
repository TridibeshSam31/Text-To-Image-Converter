import userModel from "../models/userModel.js"
import FormData from "form-data"
import axios from "axios"

//image generate krne ka logic likhenge so mujhko yeh chaiye ki mai prompt do aur woh image generate kr de
//api bhi fetch krna pdega credit score ke liye aur agar hum text ko image mai convert kr rhe hai toh humko creditpoints ko kmm bhi krna pdega uske liye bhi logic part likhna pdega jo aasan hai
//hume iss logic ko export krna hai so 


export const imageController = async(req,res) => {
    try {
        const userId = req.userId || req.body.userId || req.body.userID
        const { prompt } = req.body
        const user = await userModel.findById(userId) //user id se user ko find krna hai
        if (!user||!prompt) {
            return res.json({sucess:false , message:"Prompt is required. Please enter a prompt."})
        }
        //prompt bhi lamba nhi hona chaiye jyada so humko uske liye bhi condition likhna pdega
        if (prompt.length > 1000) {
            return res.json({sucess:false, message: "Prompt cannot exceed 1000 characters. Please shorten your prompt."})
        }
        //ab creditscore ki baari , userModel mai humne ek creditscore ka option bnaya tha mtlb ki userModel se crediBalance ka acess le skte hai 
        if (user.creditBalance === 0 || user.creditBalance < 0 ) {
            return res.json({sucess:false,message:"Insufficient credit balance. Please top up your credits to continue.", CreditBalance: user.creditBalance, creditBalance: user.creditBalance});
        }
        //ab text ko image mai convert krne ka logic likhna hai axios se api ko fetch krna hai 

        //by using axios
        const formData = new FormData()
        formData.append("prompt", prompt)

       const {data} = await axios.post('https://clipdrop-api.co/text-to-image/v1',formData,{
            headers:{
               'x-api-key': process.env.CLIPBOARD_API_KEY,
               ...formData.getHeaders(),
            },
            responseType: 'arraybuffer'  // buffer is the binary representation of the returned image   
        })
        const base64Image = Buffer.from(data).toString('base64')
        const resultImage = `data:image/png;base64,${base64Image}` //base64 image format

        const updatedUser = await userModel.findByIdAndUpdate(user._id , { $inc: { creditBalance: -1 } }, { new: true })

        //so basically humne kiya kya hai humne pehle axios se api ko betch kiya aur fir humne response mai arraybuffer le liya fir hum uss response ko base64 mai convert kr rhe hai
        //using buffer.form method par baat yeh hai ki base64 form mai images mongobd mai store krna shi toh hai lekin woh heavy images size ko nhi sambhal sklta uske liye hume cloudinary/s3 ka use krna pdega jo url me store karke sirf URL save karna better hota hai.
        //mai cloudinary se bhi kr rha hu inn sabko end mai comment kr dunga 
        //next step hoga razorpayu ya stripepay ko connect krna 

        return res.json({
            sucess: true,
            success: true,
            message: "Image Generated Successfully",
            resultImage,
            creditBalance: updatedUser ? updatedUser.creditBalance : user.creditBalance - 1
        })

    } catch (error) {
         let errorMessage = error.message;
         if (error.response && error.response.data) {
             try {
                 const raw = Buffer.isBuffer(error.response.data)
                     ? error.response.data.toString()
                     : JSON.stringify(error.response.data);
                 const parsed = JSON.parse(raw);
                 if (parsed.error) errorMessage = parsed.error;
             } catch {
                 if (Buffer.isBuffer(error.response.data)) {
                     errorMessage = error.response.data.toString();
                 }
             }
         }
         console.log("Image generation error:", errorMessage);

         let clientMessage = "Unable to synthesize artwork at this time. Please try again.";
         if (errorMessage && typeof errorMessage === "string") {
             const lower = errorMessage.toLowerCase();
             if (lower.includes("credit") || lower.includes("quota")) {
                 clientMessage = "Credit quota reached. Please recharge your balance to continue.";
             } else if (lower.includes("safety") || lower.includes("moderation") || lower.includes("nsfw")) {
                 clientMessage = "The prompt could not be processed due to safety guidelines. Please modify your prompt.";
             } else if (!lower.includes("status code") && !lower.includes("axios") && !lower.includes("http")) {
                 clientMessage = errorMessage;
             }
         }

         res.json({sucess:false , message: clientMessage})
    }
}






