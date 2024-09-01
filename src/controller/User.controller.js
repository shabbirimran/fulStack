import { asyncHandler } from "../utils/asyncHandler.js";
import{Apierror} from '../utils/Apierror.js'
import {User} from '../models/User.Models.js';
import {uploadOnCloudinary} from '../utils/Cloudinary.js'
import {Apiresponse} from "../utils/Apiresponse.js"
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";
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

const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingrefreshToken=req.cookies?.refreshToken || req.body.refreshToken
  if(!incomingrefreshToken){
    throw new Apierror(401,"unauthorized token")
  }
 try {
  const decodedToken=jwt.verify(incomingrefreshToken,process.env.REFRESH_TOKEN_SECRET)
  const user= await User.findById(decodedToken?._id)
 if(!user){
   throw new Apierror(400,"invalid refresh token")
 }
 if(incomingrefreshToken !== user?.refreshToken){
   throw new Apierror(400,"refresh token is expired or used")
 }
 const {accessToken,newrefreshToken}=await generateAccessandRefreshTokens(user._id)
 const options={
   httpOnly:true,
   secure:true
 }
 res.status(200)
 .cookie("accessToken",accessToken,options)
 .cookie("newrefreshToken",newrefreshToken,options)
 .json(
   new Apiresponse(200,
     {user:accessToken,refreshToken:newrefreshToken},
     "Access Token Refresh successfully"
   )
 )
 } catch (error) {
    throw new Apierror(400,err?.message || "invalid refresh Token")
 }
})
const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const {oldPassword, newPassword,cnfrmPassword} = req.body
console.log(newPassword,"old")
  if(!(newPassword === cnfrmPassword)){
    throw new Apierror(401,"confirm password is incorrect")
  }
  
try {
    const user= await User.findById(req.user?._id)
    console.log(oldPassword)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
      throw new Apierror(400,"incorrect password")
  
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})
    return res.status(200).json(
      new Apiresponse(200,{},"Password change successfully")
    )
} catch (err) {
  throw new Apierror(400,err?.meaasge || "incorrect password error")
}
})
const getCurrentUser=asyncHandler(async(req,res)=>{
  return res.status(200).json(
    new Apiresponse(200,{user:req.user,},"current user fetch successfully")
  )
})
const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullname,email,username}=req.body
  if(!(fullname || email || username )){
    throw new Apierror(404,"empty fields")
  }
  console.log(username,"usermame",fullname,"fullname",email,"email")
 try {
   const user=await User.findByIdAndUpdate(
     req.user?._id,
     {
       $set:{
         fullname:fullname,
         email:email,
         username:username
       }
     },
     {new:true}
 
   ).select("-password")
   return res.status(200).json(
     new Apiresponse(200,user,"Updated Successfully")
   )
 } catch (error) {
  throw new Apierror(404,error?.message || "not updated")
 }
})
 const updateAvatarImage=asyncHandler(async(req,res)=>{
  const avatarLocalPath=req.file?.path
  if(!avatarLocalPath){
    throw new Apierror(401,"Avatar file is missing")
  }
  const avatar=await uploadOnCloudinary(avatarLocalPath)
  if(!avatar.url){
    throw new Apierror(401,"Error while uploading avatar on cloudinary")
  }
  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{avatar:avatar.url},
    },
    {new:true}
  ).select("-password")
  return res.status(200).json(
    new Apiresponse(200,{user:user,},"avatar updated successfully")
  )
})
const updateCoverImage=asyncHandler(async(req,res)=>{
  const coverLocalPath=req.file?.path
  if(!coverLocalPath){
    throw new Apierror(401,"coverImage file is missing")
  }
  const coverImage=await uploadOnCloudinary(coverLocalPath)
  if(!coverImage.url){
    throw new Apierror(401,"Error while uploading coverImage on cloudinary")
  }
  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{coverImage:coverImage.url},
    },
    {new:true}
  ).select("-password")
  return res.status(200).json(
    new Apiresponse(200,{user:user,},"coverImage updated successfully")
  )
})
const getUserChannelProfile=asyncHandler(async(req,res)=>{
  const {username}=req.params
  if(!username?.trim()){
    throw new Apierror(404,"username is missing")
  }
  const channel=await User.aggregate([
    {
      $match:{
        username:username?.toLowerCase(),
      }
    },
    {
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"channel", 
        as:"subscribers"
      }
    },
    {
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"subscriber",
        as:"subcribedTo"//maine kisko subscribe kia hai

      }
    },
    {
      $addFields:{
        subscriberCount:{
          $size:"$subscribers"
        },
        channelsSubscribedToCount:{
          $size:"$subcribedTo"
        },
        isSubscribed:{
          $cond:{
            if:{$in:[req.user?._id,"$subsscribers.subscriber"]},
            then:true,
            else:false
          }
        }
      }
    },
    {
      $project:{
        fullname:1,
        username:1,
        subscriberCount:1,
        channelsSubscribedToCount:1,
        isSubscribed:1,
        avatar:1,
        coverImage:1,
        email:1
      }
    }
  ])
  if(!channel?.length){
throw new Apierror(400,"channel does not exists")
  }
  return res.status(200).json(
    new Apiresponse(200,channel[0],"user channel fetch successfully")
  )
})
const getWatchHistory=asyncHandler(async(req,res)=>{
  const user=await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user_.id),
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                      fullname:1,
                      username:1,
                      avatar:1
                  }
                }
              ]
            },

          },
          {
            $addFields:{
              owner:{
                $first:"$owner"
              }
            }
          }
          
        ]
      }
    }
  ])
  return res.status(200).json(
    new Apiresponse(200,user[0].watchHistory,"watch history fetch successfully")
  )
})
export {registerHandler,loginUser,logoutHandler,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateCoverImage,updateAvatarImage,getWatchHistory,getUserChannelProfile}