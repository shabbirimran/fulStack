import { asyncHandler } from "../utils/asyncHandler.js";
import{Apierror} from '../utils/Apierror.js'
import {User} from '../models/User.Models.js';
import {uploadOnCloudinary} from '../utils/Cloudinary.js'
import {Apiresponse} from "../utils/Apiresponse.js"

const generateAccessandRefreshTokens=async(userId)=>{
  try{
    const user=await User.findById(userId)
       const accessToken=user.generateAccessToken() 
    const refreshToken=user.generateRefreshToken()
    user.refreshToken=refreshToken
   await user.save({ValidateBeforeSave:false})
    return{accessToken,refreshToken}

  }catch(err){
    throw new Apierror(500,"something went wrong while generating regresh and access token")
  }
}

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
  throw new Apierror(400,`fields is required`)
}
const existedUser=await User.findOne({
  $or:[{username},{email}]
})
if(existedUser){
  throw new Apierror(409,"user with email or password existed")
}
const avatarLocalPath=req.files?.avatar[0]?.path;
console.log(avatarLocalPath)
const coverLocalPath=req.files?.coverImage[0]?.path;
console.log(coverLocalPath)
if(!avatarLocalPath){
  throw new Apierror(400,"avatarpath file is required")}

const avatar=await uploadOnCloudinary(avatarLocalPath)
const coverImage=await uploadOnCloudinary(coverLocalPath)

if(!avatar){
  throw new Apierror(400,"avatar file is required")
}
const user=await User.create({
  fullname,
  avatar: avatar.url,
  coverImage:coverImage?.url || "",
  email,
  password,
  username:username.toLowerCase()
})
const createduser=await User.findById(user._id).select(
  "-password -refreshToken"
)
if(!createduser){
  throw new Apierror(500,"something went wrong while register user")
}
return res.status(200).json(
  new Apiresponse(200,createduser,"user register successfully")
)
});
 
///login user
const loginUser=asyncHandler(async(req,res)=>{
  //req body =>data
  //check username or email
  //find the user or email is exists
  //check password
  //access and refresh token
  //send to cokkie
  //response successfully 

  const {email,username,password}=req.body
 console.log(email)
  if(!(email || username)){
    throw new Apierror(400,"username or password is required ")
  }
  const user=await User.findOne({
    $or:[{username},{email}]
  })
  console.log(user,"users")
  if(!user){
    throw new Apierror(404,"user does not exists")
  }
const isPassword=await user.isPasswordCorrect(password)
if(!isPassword){
  throw new Apierror(401,"Invalid users credentials")
}
const {accessToken,refreshToken}=await generateAccessandRefreshTokens(user._id)
const logginUser=await User.findById(user._id).
select("-password -refreshToken")
const options={
  httpOnly:true,
  secure:true
}
res.status(200).cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
  new Apiresponse(
    200,
    {
      user:logginUser,accessToken,refreshToken
    },
    "User logged In SuccessFully"
  )
)
})

const logoutHandler=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(req.user._id,
    {
      $set:{refreshToken:undefined}

    },{
      new:true
    }
  )   
  const options={
    httpOnly:true,
    secure:true
  }
  return res.status(200).clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new Apiresponse(200,{},"User Logged Out")
  )
})



export {registerHandler,loginUser,logoutHandler}