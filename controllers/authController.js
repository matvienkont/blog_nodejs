const mongoose = require("mongoose")
const bcrypt = require('bcryptjs');

require("../models/userSchema")
const Users = mongoose.model("users")
const { createToken } = require("../helpers/authorize/auth");

const JWT_LIFETIME = 3600000;

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
                        var salt = bcrypt.genSaltSync(10);
                        var hash = bcrypt.hashSync(req.body.password, salt);
                
                        const newUser = new Users({
                            name: req.body.name,
                            email: req.body.email,
                            password: hash
                        })
                
                        new Users(newUser).save().then((user) => 
                        {
                            const token = createToken(user._id);

                            res.cookie("jwt", token, {
                                httpOnly: true, maxAge: JWT_LIFETIME
                            })
                            res.redirect('/posts');
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
        const user = await Users.login(email, password)
        const token = createToken(user._id)

        res.cookie("jwt", token, { httpOnly: true, maxAge: JWT_LIFETIME})
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