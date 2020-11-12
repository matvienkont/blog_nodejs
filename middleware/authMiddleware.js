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
        const loc = req.originalUrl
        res.redirect(`/users/verify?loc=${loc}`)
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
                if(user)
                {
                    res.locals.user = user
                    next()
                    return 1;
                } else {
                    res.cookie("jwt", '', { maxAge: 1})
                    res.redirect('/users/login')
                }
            }
        })
    } else {
        res.locals.user=null
        next()
    }
}

module.exports = { requireAuth, checkUser }