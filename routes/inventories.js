var express = require('express');
var router = express.Router();
let inventoryModel = require('../schemas/inventories');

// get all
router.get('/', async function(req, res, next) {
    try {
        let result = await inventoryModel.find({}).populate('product');
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// get inventory by ID (có join product)
router.get('/:id', async function(req, res, next) {
    try {
        let result = await inventoryModel.findById(req.params.id).populate('product');
        if (result) res.send(result);
        else res.status(404).send({ message: "ID NOT FOUND" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Add_stock ({product, quantity}) - POST tăng stock tương ứng với quantity
router.post('/add_stock', async function(req, res, next) {
    try {
        let { product, quantity } = req.body;
        let result = await inventoryModel.findOneAndUpdate(
            { product: product },
            { $inc: { stock: quantity } },
            { new: true }
        );
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


router.post('/remove_stock', async function(req, res, next) {
    try {
        let { product, quantity } = req.body;
        let result = await inventoryModel.findOneAndUpdate(
            { product: product },
            { $inc: { stock: -quantity } },
            { new: true, runValidators: true }
        );
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


router.post('/reservation', async function(req, res, next) {
    try {
        let { product, quantity } = req.body;
        let result = await inventoryModel.findOneAndUpdate(
            { product: product },
            { $inc: { stock: -quantity, reserved: quantity } },
            { new: true, runValidators: true }
        );
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


router.post('/sold', async function(req, res, next) {
    try {
        let { product, quantity } = req.body;
        let result = await inventoryModel.findOneAndUpdate(
            { product: product },
            { $inc: { reserved: -quantity, soldCount: quantity } },
            { new: true, runValidators: true }
        );
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
