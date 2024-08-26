import jwt from "jsonwebtoken";
import { Apierror } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.Models.js";
export const verifyJWT=asyncHandler(async(req,res,next)=>{
   try {
     const token=req.cookie?.accessToken || req.header("Authorization").replace("Bearer ","")
     if(!token){
         return new Apierror(401,"Unauthorized request")
     }
     const decodeToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 const user = await User.findById(decodeToken?._id).select("-password -refreshToken")
 if(!user){
     return new Apierror(401,"Invalid Access Token")
 }
 req.user=user
 next()
   } catch (error) {
    throw new Apierror(401,error?.message || "Invalid Access")
   }
})