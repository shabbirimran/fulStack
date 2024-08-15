import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const UserSchema=new Schema({
    username:{
        type: String,
        required: true,
        trim: true,
        unique:true,
        lowecase:true,
        index:true,
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique:true,
        lowecase:true,
        
    },
    fullname:{
        type: String,
        required: true,
        trim: true,
        index:true,

    },
    avatar:{
        type: String,// cloudinary url
        required: true,
    },
    coverImage:{
            type: String,// cloudinary url
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
         required:[true,'Pasword is required']   
    },
    refreshToken:{
        type:String

    },
    
},
{
    timestamps:true
})
UserSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next()
    this.password=bcrypt.hash(this.password,10)
    next()
})
UserSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(this.password,password)
}
UserSchema.methods.generateAccessToekn=function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expireIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
UserSchema.methods.generateRefreshToekn=function(){
    return jwt.sign({
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expireIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}
export const User=mongoose.model("User",UserSchema)