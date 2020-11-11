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

//Register page
router.get('/register', (req, res) => res.render("users/register"))

//Logout
router.get('/logout', requireAuth, authController.logout_get)

module.exports = router