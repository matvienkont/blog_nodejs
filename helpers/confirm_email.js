const nodemailer = require("nodemailer");

const smtpTransport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
      user: "test.blog.posts",
      pass: "e6+aEQnpem43UVrsI0W/UJm00FKF6fFepsG6mbraWR4="
    }
  });

module.exports = confirm_email = async (email, secret, user_id) =>
{
    var link=`http://localhost:5000/profile/verify/${user_id}/${secret}`
    mailOptions={
        to : email,
        subject : "Please confirm your Email account",
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
    }
    console.log(mailOptions)
    smtpTransport.sendMail(mailOptions, function(error, response){
     if(error){
            console.log(error)
     } else{
            console.log("Message sent")
         }
})
}