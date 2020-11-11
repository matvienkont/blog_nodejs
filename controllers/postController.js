const mongoose = require("mongoose")
require("../models/postSchema")
const PostModel = mongoose.model("posts")

const { sanitize } = require("../helpers/sanitize")
const sanitizeHtml = require('sanitize-html')

module.exports.add_post = async (req, res, next) =>
{
    let errors = [];
    if (!req.body.title) errors.push({ textError: 'Required title field is empty' });
    if (!req.body.content) errors.push({ textError: 'Required details field is empty' });

    if (errors.length > 0) {
        next()
    } else {
        var content = sanitizeHtml(req.body.content)
        var title = sanitize(req.body.title)

        if(!content)
        {
            next(new Error("Content field possibly contains code for XSS attack"))
        } else {
            const newPost = {
                title: title,
                content: content,
                user: res.locals.user._id,
            };
            await new PostModel(newPost).save().then(() => {
                next()
            });
        }
    }
}