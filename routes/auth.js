var express = require("express");
var router = express.Router();
let userController = require('../controllers/users')
let { RegisterValidator, validatedResult } = require('../utils/validator')
let {CheckLogin} = require('../utils/authHandler')
//login
router.post('/login',async function (req, res, next) {
    let { username, password } = req.body;
    let result = await userController.QueryLogin(username,password);
    if(!result){
        res.status(404).send("thong tin dang nhap khong dung")
    }else{
        res.send(result)
    }
    
})
router.post('/register', RegisterValidator, validatedResult, async function (req, res, next) {
    let { username, password, email } = req.body;
    let newUser = await userController.CreateAnUser(
        username, password, email, '69b6231b3de61addb401ea26'
    )
    res.send(newUser)
})
router.get('/me',CheckLogin,function(req,res,next){
    res.send(req.user)
})

//register
router.put('/changepassword', CheckLogin, async function (req, res, next) {
    let { oldPassword, newPassword } = req.body;
    
    // validate new password
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).send({ success: false, message: "New password must be at least 6 characters long" });
    }
    
    // Check if req.user exists and has _id
    let userId = req.user && req.user.length > 0 ? req.user[0]._id : null;
    if (!userId) {
        return res.status(401).send({ success: false, message: "User not recognized" });
    }
    
    let result = await userController.ChangePassword(userId, oldPassword, newPassword);
    if (!result.success) {
        res.status(400).send(result);
    } else {
        res.send(result);
    }
})
//me
//forgotpassword
//permission
module.exports = router;