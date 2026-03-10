var express = require("express");
var router = express.Router();
let productModel = require("../schemas/products");

// Read all
router.get("/", async function (req, res, next) {
    try {
        let products = await productModel.find({});
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Read by id
router.get("/:id", async function (req, res, next) {
    try {
        let product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create
router.post("/", async function (req, res, next) {
    try {
        let product = new productModel(req.body);
        let result = await product.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update
router.put("/:id", async function (req, res, next) {
    try {
        let product = await productModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true },
        );
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete
router.delete("/:id", async function (req, res, next) {
    try {
        let product = await productModel.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
