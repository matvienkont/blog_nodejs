const express = require("express")
const { requireAuth, checkUser } = require("../middleware/authMiddleware")
const postController = require("../controllers/postController")

const router = express.Router()

router.get(':page?', requireAuth, checkUser, postController.get_all_posts)

// Add note
router.get('/add', requireAuth, checkUser, (req, res) => {
    res.render('posts/add');
})

//Process form
router.post("/", requireAuth, checkUser, postController.add_post)

router.use(function(err, req, res, next)
{
    res.status(500);
    res.send(err.message)
})

router.post("/", (req, res, next) => {
        res.redirect('/posts');
})

// Edit post
router.get('/edit/:id', requireAuth, checkUser, postController.get_edit_page)

// Update post
router.put('/:id', requireAuth, postController.put_method_update_post)

//Delete note
router.delete('/:id', requireAuth, postController.delete_post)

//View post
router.get("/view/:id?", requireAuth, checkUser, postController.get_overview_post)

module.exports = router