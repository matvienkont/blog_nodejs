const mongoose = require("mongoose")
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs');

const randtoken = require('rand-token');

const expiringTime = 86400000;

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
    },
    confirmedEmail: {
        type: Boolean,
        default: false,
        required: true
    },
    emailConfirmationToken: {
        type: String
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
            const token = randtoken.generate(80);
            user.refreshToken.token = token
            user.refreshToken.expiringTime = Date.now() + expiringTime
            await user.save()
            return { user, token }
        }
        throw Error("incorrect password")
    } throw Error("incorrect email")
}


mongoose.model("users", userSchema)