import { asyncHandler } from "../utils/asyncHandler.js";

const registerHandler=asyncHandler(async(req,res)=>{
  res.status(200).json({
        message:"ok"
    })
});

export {registerHandler}