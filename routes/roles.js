var express = require("express");
var router = express.Router();
let roleModel = require("../schemas/roles");
let userModel = require("../schemas/users");

router.get("/", async function (req, res, next) {
    try {
        let roles = await roleModel.find({ isDeleted: false });
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/:id/users", async function (req, res, next) {
    try {
        let users = await userModel
            .find({
                role: req.params.id,
                isDeleted: false,
            })
            .populate("role");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/:id", async function (req, res, next) {
    try {
        let role = await roleModel.findOne({
            _id: req.params.id,
            isDeleted: false,
        });
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }
        res.status(200).json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/", async function (req, res, next) {
    try {
        let role = new roleModel(req.body);
        let result = await role.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put("/:id", async function (req, res, next) {
    try {
        let role = await roleModel.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true, runValidators: true },
        );
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }
        res.status(200).json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:id", async function (req, res, next) {
    try {
        let role = await roleModel.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true },
        );
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }
        res.status(200).json({ message: "Role deleted", role: role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
