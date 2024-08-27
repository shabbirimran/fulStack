import jwt from "jsonwebtoken";
import { Apierror } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.Models.js";
export const verifyJWT=asyncHandler(async(req,_,next)=>{
   try {
     const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    console.log(req.cookies?.accessToken,"token")
     if(!token){
         throw new Apierror(401,"Unauthorized request")
     }
     const decodeToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 const user = await User.findById(decodeToken?._id).select("-password -refreshToken")
     console.log(user)
 if(!user){
     throw new Apierror(401,"Invalid Access Token")
 }
 req.user=user
 next()
   } catch (error) {
    throw new Apierror(401,error?.message || "Invalid Access")
   }
})