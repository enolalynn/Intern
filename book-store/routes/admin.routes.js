const express = require('express');
const adminRouter = express.Router();
const {body, param} = require('express-validator');
const {createAuthor, getAllAuthors, getSingleAuthor, createBook, getAllBook, updateBook, deleteBook, insertInStock, lease} = require('../services/admin.controller.js');

//user register
adminRouter.post('/author',[
    body('bio').isString().withMessage("Please provide a bio"),
    body('name').isString().isLength({min:6, max:20}).withMessage('Name must be between 6 & 20 long'),
    body('age').isInt().withMessage('Age must be a number')
], createAuthor)

adminRouter.get('/author', getAllAuthors)

adminRouter.get('/author/:id', [
    param('id').notEmpty().withMessage('provide id')
    .isInt().withMessage('provide init id')
    .toInt()
], getSingleAuthor)

//create book
adminRouter.post('/book',[
    body('title').isString().withMessage('Please provide a title'),
    body('description').isString().isLength({min:6, max: 20}).withMessage('Description must be between 6 and 20 long.'),
    body('authorId').isInt().withMessage('Provide authorId')
], createBook)

adminRouter.get('/book', getAllBook)

//update book
adminRouter.put('/book/:id',[
    body('title').isString().withMessage('Please provide a title'),
    body('description').isString().isLength({min:6, max: 20}).withMessage('Description must be between 6 and 20 long.'),
    body('authorId').isInt().withMessage('Provide authorId')
], updateBook)

adminRouter.delete('/book/:id',[
    param('id').notEmpty().withMessage('provide id')
    .withMessage('provide init id')
], deleteBook)

adminRouter.post('/book/instock', [
    body('bookId').isInt().withMessage("Please provide a bookId"),
    body("stock").isInt().withMessage("Please provide a stock quantity")
], insertInStock)

adminRouter.post('/book/lease', lease)


module.exports = adminRouter;