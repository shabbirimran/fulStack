import { asyncHandler } from "../utils/asyncHandler.js";
import{Apierror} from '../utils/Apierror.js'
import {User} from '../models/User.Models.js';
import {uploadOnCloudinary} from '../utils/Cloudinary.js'
import {Apiresponse} from "../utils/Apiresponse.js"
const registerHandler=asyncHandler(async(req,res)=>{
 //get user detail from frontend
 //validation -not empty
 //check if already exist: username , email
 //check avtar
 //check images
 //upload them to cloudinary , avatar
 //create user object - create entry in db
 //remove refresh token fields and password from response
//check for user creation
// return response

const {fullname,email,username,password} = req.body;
console.log("email:",email)
if(
  [fullname,email,username,password].some((fields) => {
    return fields?.trim() === "";
    console.log(fields)
  }))
{
  throw new error instanceof Apierror(400,`fields is required`)
}
const existedUser=User.findOne({
  $or:[{username},{email}]
})
if(existedUser){
  throw new error instanceof Apierror(409,"user with email or password existed")
}
const avatarLocalPath=req.files?.avatar[0]?.path
console.log(avatarLocalPath)
const coverLocalPath=req.files?.avatar[0]?.path
console.log(coverLocalPath)
if(!coverLocalPath){
  throw new error instanceof Apierror(400,"avatar file is required")
}
});
 
const avatar=await uploadOnCloudinary(avatarLocalPath)
const coverImage=await uploadOnCloudinary(coverLocalPath)

if(!avatar){
  throw new error instanceof Apierror(400,"avatar file is required")
}
const user=await User.create({
  fullname,
  avatar: avatar.url,
  coverImage:coverImage?.url || "",
  email,
  password,
  username:username.toLowerCase()
})
const createduser=await User.findById(user_id).select(
  "-password -refreshToken"
)
if(!createduser){
  throw new Apierror(500,"something went wrong while register user")
}
return res.status(200).json(
  new Apiresponse(200,createduser,"user register successfully")
)
export {registerHandler}