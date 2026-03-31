let express = require("express");
let router = express.Router();
let messageModel = require("../schemas/messages");
let userModel = require("../schemas/users");
let { CheckLogin } = require("../utils/authHandler");
let messageController = require("../controllers/messages");

// GET /api/v1/messages/
// Lấy message cuối cùng của mỗi user mà user hiện tại nhắn tin hoặc user khác nhắn cho user hiện tại
router.get("/", CheckLogin, async function (req, res, next) {
  try {
    let userId = req.user._id;
    let conversations = await messageController.GetLastMessageOfEachConversation(userId);
    res.send(conversations);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// GET /api/v1/messages/:userID
// Lấy toàn bộ message giữa user hiện tại và userID
router.get("/:userID", CheckLogin, async function (req, res, next) {
  try {
    let userId = req.user._id;
    let targetUserId = req.params.userID;

    let targetUser = await userModel.findOne({
      _id: targetUserId,
      isDeleted: false
    });
    if (!targetUser) {
      return res.status(404).send({ message: "User not found" });
    }

    let messages = await messageController.GetConversation(userId, targetUserId);
    res.send(messages);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// POST /api/v1/messages/
// Gửi tin nhắn: type = "text" hoặc "file", text = nội dung hoặc path file
router.post("/", CheckLogin, async function (req, res, next) {
  try {
    let fromUserId = req.user._id;
    let { to, type, text } = req.body;

    if (!to || !type || !text) {
      return res.status(400).send({ message: "to, type, text are required" });
    }

    if (!["text", "file"].includes(type)) {
      return res.status(400).send({ message: "type must be 'text' or 'file'" });
    }

    let targetUser = await userModel.findOne({
      _id: to,
      isDeleted: false
    });
    if (!targetUser) {
      return res.status(404).send({ message: "User not found" });
    }

    let newMessage = await messageController.PostMessage(
      fromUserId,
      to,
      type,
      text
    );
    res.send(newMessage);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
