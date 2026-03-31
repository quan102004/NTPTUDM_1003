let messageModel = require("../schemas/messages");
let userModel = require("../schemas/users");

class MessageController {
  async GetConversation(userId, targetUserId) {
    let messages = await messageModel
      .find({
        $or: [
          { from: userId, to: targetUserId },
          { from: targetUserId, to: userId }
        ]
      })
      .sort({ createdAt: 1 })
      .populate("from", "username fullName avatarUrl")
      .populate("to", "username fullName avatarUrl");

    return messages;
  }

  async PostMessage(fromUserId, toUserId, type, text) {
    let newMessage = new messageModel({
      from: fromUserId,
      to: toUserId,
      messageContent: {
        type: type,
        text: text
      }
    });
    await newMessage.save();
    await newMessage.populate("from", "username fullName avatarUrl");
    await newMessage.populate("to", "username fullName avatarUrl");
    return newMessage;
  }

  async GetLastMessageOfEachConversation(userId) {
    let allMessages = await messageModel
      .find({
        $or: [{ from: userId }, { to: userId }]
      })
      .sort({ createdAt: -1 })
      .populate("from", "username fullName avatarUrl")
      .populate("to", "username fullName avatarUrl");

    let seenUserIds = new Set();
    let result = [];

    for (let msg of allMessages) {
      let partnerId =
        msg.from._id.toString() === userId.toString()
          ? msg.to._id.toString()
          : msg.from._id.toString();

      if (!seenUserIds.has(partnerId)) {
        seenUserIds.add(partnerId);

        let partner =
          msg.from._id.toString() === userId.toString()
            ? msg.to
            : msg.from;

        result.push({
          partner: partner,
          lastMessage: msg,
          unreadCount: 0
        });
      }
    }

    return result.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );
  }
}

module.exports = new MessageController();
