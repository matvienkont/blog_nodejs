const mongoose = require("mongoose")
const bcrypt = require('bcryptjs');

require("../models/userSchema")
const Users = mongoose.model("users")
const { createToken } = require("../helpers/authorize/auth");
const { v4: uuidv4 } = require('uuid');
const confirm_email = require("../helpers/confirm_email")
const randtoken = require('rand-token')
const validator = require('validator');

const JWT_LIFETIME = 3600000
const USER_ID_LIFETIME = 86400000
const REFRESH_TOKEN_LIFETIME = 86400000


module.exports.signup_post = async  (req, res, next) => 
{
    Users.findOne({ email: req.body.email })
        .then((user) => 
        {
            if (user) 
                {
                    next(new Error("Email with this e-mail already exists"))
                    return 0
                } 
                else 
                {
                    const secret = uuidv4()
                    
                    var salt = bcrypt.genSaltSync(10)
                    var hash = bcrypt.hashSync(req.body.password, salt)

                    const refresh_token = randtoken.generate(80);

                    var validName = validator.matches(req.body.name, "^[a-zA-Z0-9_\.\-]*$")

                    if(!validName)
                    {
                        next(new Error("Not valid name"))
                        return 0
                    }

                    const validEmail = validator.isEmail(req.body.email)
                    if(!validEmail)
                    {
                        next(new Error("Not valid email"))
                        return 0
                    }

                    if (!req.body.password)
                    {
                        next(new Error("Password required"))
                        return 0
                    }
                        

                    if (req.body.password.length < 4)
                    {
                        next(new Error("Password must be more than 4 characters"))
                        return 0
                    }

                    if (!req.body.confirm_password)
                    {
                        next(new Error("Password confirmation required"))
                        return 0
                    }

                    if (req.body.password !== req.body.confirm_password)
                    {
                        next(new Error("Passwords do not match"))
                        return 0
                    }

                    const newUser = new Users({
                        name: req.body.name,
                        email: req.body.email,
                        password: hash,
                        emailConfirmationToken: secret,
                        refreshToken: {
                            token: refresh_token,
                            expiringTime: Date.now() + REFRESH_TOKEN_LIFETIME
                        }
                    })
            
                    new Users(newUser).save().then((user) => 
                    {
                        const access_token = createToken(user._id)
                        
                        confirm_email(req.body.email, secret, user._id)

                        res.cookie("jwt", access_token, {
                            httpOnly: true, maxAge: JWT_LIFETIME
                        })
                        res.cookie("user_id", user._id, { 
                            httpOnly: true, maxAge: USER_ID_LIFETIME
                        })
                        res.cookie("refresh_token", refresh_token, { 
                            httpOnly: true, maxAge: REFRESH_TOKEN_LIFETIME, path: "/users/verify"
                        })
                        next()
                    });

                }
        })
        .catch(err => console.log(err))
}

module.exports.login_post = async (req, res, next) => 
{
    const { email, password } = req.body
    try 
    {
        const login_data = await Users.login(email, password)
        const user = login_data.user
        const refresh_token = login_data.token
        const access_token = createToken(user._id);

        res.cookie("jwt", access_token, { httpOnly: true, maxAge: JWT_LIFETIME})
        res.cookie("user_id", user._id, { httpOnly: true, maxAge: USER_ID_LIFETIME})
        res.cookie("refresh_token", refresh_token, { httpOnly: true, maxAge: REFRESH_TOKEN_LIFETIME, path: "/users/verify"})
        res.redirect("/posts")
    }
    catch (err)
    {
        res.status(400)
        res.send(err.message)
    }
}

module.exports.logout_get = (req, res) => 
{
    res.cookie("jwt", '', { maxAge: 1})
    res.redirect('/')
}

module.exports.refresh_token_get = async (req, res, next) => {
    const user_id = req.cookies.user_id
    const refresh_token_out_of_cookies = req.cookies.refresh_token


    try {
        await Users.findOne({ _id: user_id })
                .then((user) =>
                {
                    if (user.refreshToken.token == refresh_token_out_of_cookies && Date.now() <= user.refreshToken.expiringTime)
                    {
                        const token = createToken(user._id);

                        res.cookie("jwt", token, {
                            httpOnly: true, maxAge: JWT_LIFETIME
                        })
                        res.cookie("user_id", user._id, { 
                            httpOnly: true, maxAge: USER_ID_LIFETIME
                        })

                        //redirect to the page a request came from
                        const loc = req.query.loc
                        res.redirect(loc)
                    } else {
                        res.redirect("/users/login")
                    }
                })
    } catch (err)
    {
        res.redirect("/users/login")
    }
    return 0;
}