let mongoose = require("mongoose");

let userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: [true, "username khong duoc trung"],
            required: [true, "username khong duoc rong"],
            trim: true,
        },
        password: {
            type: String,
            required: [true, "password khong duoc rong"],
        },
        email: {
            type: String,
            unique: [true, "email khong duoc trung"],
            required: [true, "email khong duoc rong"],
            trim: true,
            lowercase: true,
        },
        fullName: {
            type: String,
            default: "",
            trim: true,
        },
        avatarUrl: {
            type: String,
            default: "https://i.sstatic.net/l60Hf.png",
        },
        status: {
            type: Boolean,
            default: false,
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "role",
            default: null,
        },
        loginCount: {
            type: Number,
            default: 0,
            min: [0, "loginCount khong duoc nho hon 0"],
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = new mongoose.model("user", userSchema);
