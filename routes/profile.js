const express = require("express")
const router = express.Router()
const { requireAuth, checkUser } = require("../middleware/authMiddleware")
const profileController = require("../controllers/profileController")

router.get("/", requireAuth, checkUser, profileController.profile_get)

router.put('/email', requireAuth, checkUser, profileController.profile_email_change)

router.use(function(err, req, res, next)
{
    res.status(500);
    res.send(err.message)
})

router.put('/name', requireAuth, checkUser, profileController.profile_name_change)

router.use(function(err, req, res, next)
{
    res.status(500);
    res.send(err.message)
})

router.get('/verify/:user_id/:id?', profileController.verify_profile_get)

router.get("/statistics", requireAuth, checkUser, profileController.get_statistics)

module.exports = router