const validator = require('validator');
const { sanitize } = require("../helpers/sanitize")
const mongoose = require("mongoose")
const { v4: uuidv4 } = require('uuid');
const confirm_email = require("../helpers/confirm_email")

require("../models/userSchema")
const Users = mongoose.model("users")

require("../models/postSchema")
const PostModel = mongoose.model("posts")

module.exports.profile_get = (req, res) => 
{
    res.render("profile/profile")
}

module.exports.profile_email_change = (req, res, next) => {
    const valid = validator.isEmail(req.body.email)

    if(valid)
    {
        const user_id = res.locals.user._id
        const new_user_email = sanitize(req.body.email)

        Users.findOne({ _id: user_id })
            .then(async (user) => 
            {
                if(user.email == new_user_email)
                {
                    return 0
                } else 
                {
                    const secret = uuidv4()
                    user.email = new_user_email
                    user.confirmedEmail = false
                    user.emailConfirmationToken = secret

                    confirm_email(req.body.email, secret, user._id)

                    try {
                        await user.save()
                    }
                        catch(error)
                        {
                            next(error);
                        }  
                }
            }).then(()=>res.redirect("/profile"))
    } else 
    {
        next(new Error("Not valid email"))
    }
}

module.exports.profile_name_change = (req, res, next) => {
    const valid = validator.matches(req.body.name, "^[a-zA-Z0-9_\.\-]*$") 

    if(valid)
    {
        const new_user_name = sanitize(req.body.name)
        const user_id = res.locals.user._id

        Users.findOne({ _id: user_id })
            .then( async (user) => 
            {
                if(user.name == new_user_name)
                {
                    return 0
                } else 
                {
                    user.name = new_user_name
                    try {
                        await user.save()
                    }
                        catch(error)
                        {
                            next(error);
                        }  
                }
            }).then(()=>res.redirect("/profile"))
    } else 
    {
        next(new Error("Not valid name")) 
    }
}

module.exports.verify_profile_get = (req, res, next) =>
{
    const user_id = req.params.user_id
    const id = req.params.id

    Users.findOne({ _id: user_id })
            .then(async (user) => 
            {
                if(user.emailConfirmationToken == id)
                {
                    user.confirmedEmail = true
                    user.emailConfirmationToken = undefined
                }
                
                try {
                    user.save()
                } catch (err)
                {
                    next(err)
                }
            }).then(()=>res.redirect("/"))
}
    
module.exports.get_statistics = (req, res, next) =>
{
    PostModel.find({ user: res.locals.user._id}).lean()
    .then(posts => {
        posts = posts.sort((a,b) => b.date - a.date)

        const groups = posts.reduce((groups, post) => {
            const date = post.date.toDateString();
            if (!groups[date]) {
              groups[date] = [];
            }
            groups[date].push(post);
            return groups;
        }, {});

        // Edit: to add it in the array format instead
        const groupArrays = Object.keys(groups).map((date) => {
            return {
            date,
            posts: groups[date].length
            };
        });

        return res.render("profile/statistics", {
            groupArrays: groupArrays
        })
    })  
}