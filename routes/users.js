const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { requireAuth } = require("../middleware/authMiddleware")

//Login page
router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', authController.login_post);

router.post('/register', authController.signup_post);

router.use((err, req, res, next) =>
{
    res.status(500);
    res.send(err.message)
})

router.post("/register", (req, res) => {
    res.redirect('/posts')
})

//Register page
router.get('/register', (req, res) => res.render("users/register"))

//Logout
router.get('/logout', requireAuth, authController.logout_get)

//Refresh token
router.get("/verify", authController.refresh_token_get)

module.exports = router
