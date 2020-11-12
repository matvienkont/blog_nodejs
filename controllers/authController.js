const mongoose = require("mongoose")
const bcrypt = require('bcryptjs');

require("../models/userSchema")
const Users = mongoose.model("users")
const { createToken } = require("../helpers/authorize/auth");
const { v4: uuidv4 } = require('uuid');
const confirm_email = require("../helpers/confirm_email")
const randtoken = require('rand-token')

const JWT_LIFETIME = 3600000
const USER_ID_LIFETIME = 86400000
const REFRESH_TOKEN_LIFETIME = 86400000


module.exports.signup_post = async  (req, res) => 
{
    var errors = [];

    if (!req.body.name)
        errors.push({ textError: 'Name required' });

    if (!req.body.email)
        errors.push({ textError: 'Email required' });

    if (!req.body.password)
        errors.push({ textError: 'Password required' });

    if (req.body.password.length < 4)
        errors.push({ textError: 'Password must be more than 4 characters' });

    if (!req.body.confirm_password)
        errors.push({ textError: 'Password confirmation required' });

    if (req.body.password !== req.body.confirm_password)
        errors.push({ textError: 'Passwords do not match' });


    if (errors.length > 0) {
        res.render("users/register",
            {
                errors: errors,
                input_data: req.body
            })
    }
    else {
        Users.findOne({ email: req.body.email })
            .then((user) => 
            {
                if (user) 
                    {
                        console.log("Email with this e-mail already exists");
                        //req.flash("error_msg", "Email with this e-mail already exists");
                        res.redirect('/users/register')
                    } 
                else 
                    {
                        const secret = uuidv4()
                        
                        var salt = bcrypt.genSaltSync(10)
                        var hash = bcrypt.hashSync(req.body.password, salt)

                        const refresh_token = randtoken.generate(80);

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
                                httpOnly: true, maxAge: REFRESH_TOKEN_LIFETIME
                            })
                            res.redirect('/posts')
                        });

                    }
            })
            .catch(err => console.log(err))
    }
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
        res.cookie("refresh_token", refresh_token, { httpOnly: true, maxAge: REFRESH_TOKEN_LIFETIME})
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
        res.send("Database error")
    }
    return 0;
}