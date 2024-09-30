import mongoose ,{Schema} from 'mongoose';
import jwt  from 'jsonwebtoken';
import bcrypt from "bcrypt" // For hashing passwords

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: [true ,'Password is required ']
    },
    fullname:{
        type:String,
        required:true,
        index:true
    },
    // avatar:{
    //     type:String,
    //     required : true 
    // },
    role: { 
        type: String, 
        enum: ['candidate', 'company', 'admin'], // Defines user types
        required: true 
    },
    status: { 
        type: String, 
        enum: ['open_to_network', 'hiring', 'not_open_to_network', 'not_hiring'], 
        default: 'not_open_to_network' 
    },
    refreshToken:{
        type:String 
    }
},
{
    timestamps:true 
});

// Pre-save hook to hash password before saving to DB
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
      } catch (error) {
        next(error);
      }
})
    
// Password validation method
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}
userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id : this._id ,
        email:this.email ,
        fullname:this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id : this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)

}

export const User =mongoose.model("User",userSchema)
