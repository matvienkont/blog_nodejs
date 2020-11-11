const jwt = require("jsonwebtoken")

module.exports.createToken = (id) =>
{
    return jwt.sign({ id }, process.env.JWT_TOKEN_SECRET)
}