import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.gaCsAks0uRcva50qypiLO4HQKvM // Click 'View API Keys' above to copy your API secret
});
const uploadOnCloudinary=async(localFilePath)=>{
    try{
        if(!localFilePath) return null;
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto",
        })
        // file has been uplaoded successfully
        console.log("file is uploadon on cloudinary",response.url)
        return response
    }catch(error){
        fs.unlinkSync(localFilePath)//remove the locally save temporary files as the upload operaation failed
        return null;
    }
} 

export {uploadOnCloudinary}