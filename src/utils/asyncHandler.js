// const asynchandler=()=>{}
const asyncHandler=(requeshandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requeshandler(req,res,next)).catch(err=>next(err));
    }
}



export {asyncHandler}

// for learning
// let a=(fn)=>{
// async (res,req,next)=>{
//     await fn(res,req,mext)
// }
// }
// const asynchandler=(fn)=>async(req,res,next)=>{
//     try{
//         await fn(req,res,next);
//     }catch(error){
//         res.status(err.code || 500).json({
//             success:500,
//             message:err.message
//         })
//     }
// }    