const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
require("../models/userSchema")
const Users = mongoose.model("users")

const requireAuth = (req, res, next) =>
{
    const token = req.cookies.jwt

    if(token)
    {
        jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err, decodeSuccess) =>
        {
            if(err)
            {

                res.redirect("/users/login")
            } else {
                next()
            }
        })
    } else {
        res.redirect("/users/login")
    }
}

const checkUser = (req, res, next) => 
{
    const token = req.cookies.jwt

    if(token)
    {
        jwt.verify(token, process.env.JWT_TOKEN_SECRET, async (err, decodedToken) =>
        {
            if(err)
            {
                res.locals.user=null
                next()
            } else {
                let user = await Users.findById(decodedToken.id).lean()
                res.locals.user = user
                next()
                return 1;
            }
        })
    } else {
        res.locals.user=null
        next()
    }
}

module.exports = { requireAuth, checkUser }