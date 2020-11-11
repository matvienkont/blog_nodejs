const express = require("express")
const mongoose = require("mongoose")
const { requireAuth, checkUser } = require("../middleware/authMiddleware")
const { sanitize } = require("../helpers/sanitize")
const sanitizeHtml = require('sanitize-html')
const postController = require("../controllers/postController")

const router = express.Router()

require("../models/postSchema")
const PostModel = mongoose.model("posts")

router.get('/', requireAuth, checkUser, (req, res) =>
{
    PostModel.find({ user: res.locals.user._id}).lean()
    .then(posts => {
        posts = posts.sort((a,b) => b.date - a.date)

        return res.render("posts/viewPosts", {
            posts: posts
        })
    })  
})

// Add note
router.get('/add', requireAuth, checkUser, (req, res) => {
    res.render('posts/add');
});

//Process form
router.post("/", requireAuth, checkUser, postController.add_post)

router.use(function(err, req, res, next)
{
    res.status(500);
    res.send("Oops, something went wrong.")
    setTimeout(()=> res.redirect("/posts"), 2000)
})

router.post("/", (req, res, next) => {
    /*if(req.locals.errors) {
        res.render('posts/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.content
        })
    } else {*/
        res.redirect('/posts');
    //}
});

// Edit post
router.get('/edit/:id', (req, res) => {
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
            });
        }
    });
});

// Update post
router.put('/:id', requireAuth, async (req, res, next) => {
    
    if(!req.body.title)
    {
        //req.flash('error_msg', 'A title shouldn\'t be empty, no update happened');
        console.log("A title shouldn\'t be empty, no update happened")
        return res.redirect('/posts')
    } else if(!req.body.content)
        {
            //req.flash('error_msg', 'A details field shouldn\'t be empty, no update happened');
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
                        res.locals.errors = "Content consists of forbidden input"
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
                    //req.flash('success_msg', 'Note successfully updated!')
                    console.log('Note successfully updated!');
                    res.redirect('/posts')
                } else 
                {
                    //req.flash('success_msg', 'Nothing to change!')
                    console.log('Nothing to change!');
                    res.redirect('/posts')
                }

            });
        }
});

//Delete note
router.delete('/:id', requireAuth, (req, res) => {
    PostModel.deleteOne({ _id: req.params.id }).then(() => {
        //req.flash('success_msg', 'Note successfully deleted!');
        console.log('Note successfully deleted!');
        res.redirect('/posts');
    })
});



module.exports = router