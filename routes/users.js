var express = require("express");
var router = express.Router();
let userModel = require("../schemas/users");

router.get("/", async function (req, res, next) {
    try {
        let users = await userModel.find({ isDeleted: false }).populate("role");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/:id", async function (req, res, next) {
    try {
        let user = await userModel
            .findOne({
                _id: req.params.id,
                isDeleted: false,
            })
            .populate("role");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/", async function (req, res, next) {
    try {
        let user = new userModel(req.body);
        let result = await user.save();
        let populatedUser = await result.populate("role");
        res.status(201).json(populatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/enable", async function (req, res, next) {
    try {
        let user = await userModel
            .findOneAndUpdate(
                {
                    email: req.body.email,
                    username: req.body.username,
                    isDeleted: false,
                },
                { status: true },
                { new: true },
            )
            .populate("role");
        if (!user) {
            return res.status(404).json({
                message: "User not found with provided email and username",
            });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/disable", async function (req, res, next) {
    try {
        let user = await userModel
            .findOneAndUpdate(
                {
                    email: req.body.email,
                    username: req.body.username,
                    isDeleted: false,
                },
                { status: false },
                { new: true },
            )
            .populate("role");
        if (!user) {
            return res.status(404).json({
                message: "User not found with provided email and username",
            });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put("/:id", async function (req, res, next) {
    try {
        let user = await userModel
            .findOneAndUpdate(
                { _id: req.params.id, isDeleted: false },
                req.body,
                { new: true, runValidators: true },
            )
            .populate("role");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:id", async function (req, res, next) {
    try {
        let user = await userModel.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true },
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted", user: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
