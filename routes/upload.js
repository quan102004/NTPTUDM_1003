let express = require('express')
let router = express.Router()
let { uploadImage, uploadExcel } = require('../utils/uploadHandler')
let path = require('path')
let exceljs = require('exceljs')
let fs = require('fs')
let categoriesModel = require('../schemas/categories')
let productsModel = require('../schemas/products')
let inventoryModel = require('../schemas/inventories')
let mongoose = require('mongoose')
let slugify = require('slugify')
let usersModel = require('../schemas/users')
let rolesModel = require('../schemas/roles')
let { sendPasswordMail } = require('../utils/sendMail')
let crypto = require('crypto')

router.post('/one_image', uploadImage.single('file'), function (req, res, next) {
    if (!req.file) {
        res.status(404).send({
            message: "file not found"
        })
    } else {
        console.log(req.body);
        res.send({
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size
        })
    }
})
router.post('/multiple_images', uploadImage.array('files', 5), function (req, res, next) {
    if (!req.files) {
        res.status(404).send({
            message: "file not found"
        })
    } else {
        console.log(req.body);
        res.send(req.files.map(f => ({
            filename: f.filename,
            path: f.path,
            size: f.size
        })))
    }
})
router.get('/:filename', function (req, res, next) {
    let pathFile = path.join(
        __dirname, '../uploads', req.params.filename
    )
    res.sendFile(pathFile)
})

router.post('/excel', uploadExcel.single('file'), async function (req, res, next) {
    if (!req.file) {
        res.status(404).send({
            message: "file not found"
        })
    } else {
        //workbook->worksheet->column/row->cell
        let workbook = new exceljs.Workbook();
        let pathFile = path.join(
            __dirname, '../uploads', req.file.filename
        )
        await workbook.xlsx.readFile(pathFile)
        let worksheet = workbook.worksheets[0];
        let result = []
        let categories = await categoriesModel.find({
        });
        let categoriesMap = new Map();
        for (const category of categories) {
            categoriesMap.set(category.name, category._id)
        }
        let products = await productsModel.find({})
        let getTitle = products.map(p => p.title)
        let getSku = products.map(p => p.sku)

        for (let index = 2; index <= worksheet.rowCount; index++) {
            let errorsInRow = []
            const element = worksheet.getRow(index);
            let sku = element.getCell(1).value;
            let title = element.getCell(2).value;
            let category = element.getCell(3).value;

            let price = Number.parseInt(element.getCell(4).value)
            let stock = Number.parseInt(element.getCell(5).value)

            if (price < 0 || isNaN(price)) {
                errorsInRow.push("price khong hop le")
            }
            if (stock < 0 || isNaN(stock)) {
                errorsInRow.push("stock khong hop le")
            }
            if (!categoriesMap.has(category)) {
                errorsInRow.push('category khong hop le')
            }
            if (getSku.includes(sku)) {
                errorsInRow.push('sku bi trung')
            }
            if (getTitle.includes(title)) {
                errorsInRow.push('title khong hop le')
            }
            if (errorsInRow.length > 0) {
                result.push({
                    success: false,
                    data: errorsInRow
                });
                continue;
            }// 

            let session = await mongoose.startSession();
            session.startTransaction()
            try {
                let newProduct = new productsModel({
                    sku: sku,
                    title: title,
                    slug: slugify(title, {
                        replacement: '-',
                        remove: undefined,
                        lower: true,
                        strict: false,
                    }),
                    price: price,
                    description: title,
                    category: categoriesMap.get(category)
                });
                newProduct = await newProduct.save({ session });
                let newInventory = new inventoryModel({
                    product: newProduct._id,
                    stock: stock
                })
                newInventory = await newInventory.save({ session });
                newInventory = await newInventory.populate('product')
                await session.commitTransaction();
                await session.endSession()
                getTitle.push(title);
                getSku.push(sku)
                result.push({
                    success: true,
                    data: newInventory
                })
            } catch (error) {
                await session.abortTransaction();
                await session.endSession()
                result.push({
                    success: false,
                    data: error.message
                })
            }

        }
        fs.unlinkSync(pathFile)
        res.send(result.map(function (r, index) {
            if (r.success) {
                return { [index + 1]: r.data }
            } else {
                return { [index + 1]: r.data.join(',') }
            }
        }))
    }
})

router.post('/excel/users', uploadExcel.single('file'), async function (req, res, next) {
    if (!req.file) {
        return res.status(404).send({ message: "file not found" })
    }
    
    let workbook = new exceljs.Workbook();
    let pathFile = path.join(__dirname, '../uploads', req.file.filename)
    await workbook.xlsx.readFile(pathFile)
    let worksheet = workbook.worksheets[0];
    let result = []
    
    let userRole = await rolesModel.findOne({ name: 'USER' });
    if (!userRole) {
        userRole = await rolesModel.findOne({ name: 'user' });
    }
    if (!userRole) {
        fs.unlinkSync(pathFile)
        return res.status(400).send({ message: "Role 'user' not found" });
    }

    let users = await usersModel.find({})
    let getUsernames = users.map(u => u.username)
    let getEmails = users.map(u => u.email)

    for (let index = 2; index <= worksheet.rowCount; index++) {
        let errorsInRow = []
        const element = worksheet.getRow(index);
        let usernameCell = element.getCell(1).value;
        let emailCell = element.getCell(2).value;

        let username = usernameCell && typeof usernameCell === 'object' && usernameCell.result ? usernameCell.result : usernameCell;
        let email = emailCell && typeof emailCell === 'object' && emailCell.result ? emailCell.result : emailCell;

        if (!username) {
            errorsInRow.push("username is empty")
        }
        if (!email) {
            errorsInRow.push("email is empty")
        }
        if (getUsernames.includes(username)) {
            errorsInRow.push('username bi trung')
        }
        if (getEmails.includes(email)) {
            errorsInRow.push('email bi trung')
        }

        if (errorsInRow.length > 0) {
            result.push({
                success: false,
                data: errorsInRow
            });
            continue;
        }

        let password = crypto.randomBytes(8).toString('hex');

        try {
            let newUser = new usersModel({
                username: username,
                email: email,
                password: password,
                role: userRole._id
            });
            await newUser.save();
            
            await sendPasswordMail(email, password);

            getUsernames.push(username);
            getEmails.push(email);
            
            result.push({
                success: true,
                data: {
                    username: newUser.username,
                    email: newUser.email
                }
            })
        } catch (error) {
            result.push({
                success: false,
                data: error.message
            })
        }
    }
    fs.unlinkSync(pathFile)
    res.send(result.map(function (r, index) {
        if (r.success) {
            return { [index + 1]: r.data }
        } else {
            return { [index + 1]: typeof r.data === 'string' ? r.data : r.data.join(',') }
        }
    }))
})

module.exports = router;