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

module.exports.get_all_posts = (req, res) =>
{
    var current_page = 0
    if (req.query.page)
        current_page = req.query.page
    
    PostModel
        .find({user: res.locals.user._id})
        .lean()
        .sort({'date': -1})
        .exec(function(err, posts) {
            const posts_length = posts.length-1
            const page_amount = Math.floor(posts_length/10)
            
            res.locals.page_amount = page_amount
            res.locals.loc = "/posts"

            posts = posts.slice(current_page*10, current_page*10+10)
                return res.render("posts/viewPosts", {
                    posts: posts
            })
        });
}

module.exports.get_edit_page = (req, res) => {
    PostModel.findOne({ _id: req.params.id }).lean()
    .then((post) => {
        if (post.user != res.locals.user._id) 
        {
            req.flash('error_msg', 'Sorry, not authenticated :(');
            res.redirect('/posts')
        } else 
        {
            res.render('posts/edit', {
                post: post
            })
        }
    })
}

module.exports.put_method_update_post =  async (req, res, next) => {
    
    if(!req.body.title)
    {
        console.log("A title shouldn\'t be empty, no update happened")
        return res.redirect('/posts')
    } else if(!req.body.content)
        {
            console.log("A details field shouldn\'t be empty, no update happened");
            return res.redirect('/posts')
        } else 
        {
            PostModel.findOne({ _id: req.params.id })
            .then(async (post) => 
            {
                if(post.title == req.body.title && post.content == req.body.content)
                {
                    return 0
                } else 
                {
                    post.title = sanitize(req.body.title)
                    post.content = sanitizeHtml(req.body.content)
                    
                    if(!post.content)
                    {
                        return 0;
                    }

                    try {
                        await post.save()
                    }
                        catch(error)
                        {
                            next(error);
                        }
                    return 1
                } 
            })
            .then((success) => {
                if(success) 
                {
                    console.log('Note successfully updated!');
                    res.redirect('/posts')
                } else 
                {
                    console.log('Nothing to change!');
                    res.redirect('/posts')
                }

            });
        }
}

module.exports.delete_post = (req, res) => {
    PostModel.deleteOne({ _id: req.params.id }).then(() => {
        console.log('Note successfully deleted!');
        res.redirect('/posts');
    })
}

module.exports.get_overview_post = (req, res) => {
    PostModel.findOne({ _id: req.params.id })
    .lean()
    .then(post => res.render("posts/post_overview", { post: post }))
}


module.exports.search_post = (req, res) => {
    try {
    var current_page = 0
    if (req.query.page)
        current_page = req.query.page
    
    PostModel
        .find({user: res.locals.user._id})
        .lean()
        .sort({'date': -1})
        .exec(function(err, posts) {
            const key = sanitize(req.query.key)

            posts = posts.filter(post => post.title.includes(key) || post.content.includes(key))

            const posts_length = posts.length-1
            const page_amount = Math.floor(posts_length/10)

            res.locals.page_amount = page_amount
            res.locals.loc = "/posts/search/"
            res.locals.key = key

            posts = posts.slice(current_page*10, current_page*10+10)
                return res.render("posts/viewPosts", {
                    posts: posts
            })
        });
    } catch (err)
    {
        res.send("Database error")
    }
}