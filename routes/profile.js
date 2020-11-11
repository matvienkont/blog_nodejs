const express = require("express")
const router = express.Router()
const { requireAuth } = require("../middleware/authMiddleware")

router.get("/profile", requireAuth, )

module.exports = router