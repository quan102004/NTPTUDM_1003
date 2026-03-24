const nodemailer = require("nodemailer");

// Looking to send emails in production? Check out our Email API/SMTP product!
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "d29624930ba87e",
    pass: "bb4fbd1e59f36a"
  }
});

module.exports = {
    sendMail: async function (to, url) {
        await transporter.sendMail({
            from: 'admin@haha.com',
            to: to,
            subject: "reset password email",
            text: "click vao day de doi pass", // Plain-text version of the message
            html: "click vao <a href=" + url+ ">day</a> de doi pass", // HTML version of the message
        })
    },
    sendPasswordMail: async function (to, password) {
        await transporter.sendMail({
            from: 'admin@haha.com',
            to: to,
            subject: "Your Account Password",
            text: `Your new password is: ${password}`, // Plain-text
            html: `Your new password is: <b>${password}</b>`, // HTML
        })
    }
}
