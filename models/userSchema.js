const mongoose = require("mongoose")
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs');

const expiringTime = 300000;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date, 
        default: Date.now()
    },
    refreshToken: {
        token: String,
        expiringTime: {
            type: Date,
            default: Date.now() + expiringTime
        }
    }
})

userSchema.statics.login = async function ( email, password ) 
{
    const user = await this.findOne({ email })
    if(user)
    {
        const auth = await bcrypt.compare(password, user.password)
        if (auth)
        {
            return user
        }
        throw Error("incorrect password")
    } throw Error("incorrect email")
}


mongoose.model("users", userSchema)