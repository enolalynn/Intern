const express = require('express');
const adminRouter = express.Router();
const { body, param } = require('express-validator');
const { createAuthor, getAllAuthors, getSingleAuthor, createBook, getAllBook, insertInStock } = require('../services/admin/admin.controller');

//user register
adminRouter.post('/author', [
     body('bio').isString().withMessage("Please provide a bio"),
     body('name').isString().isLength({ min: 6, max: 20 }).withMessage('Name must be between 6 and 20 characters long'),
     body('age').isInt().withMessage('Age must be a number'),
], createAuthor)

adminRouter.get('/author', getAllAuthors)

adminRouter.get('/author/:id', [
     param('id').notEmpty().withMessage('provide id')
          .isInt().withMessage('provide init id')
          .toInt()
], getSingleAuthor)

//create book
adminRouter.post('/book', [
     body('title').isString().withMessage("Please provide a title"),
     body('description').isString().isLength({ min: 6, max: 20 }).withMessage('Name must be between 6 and 20 characters long'),
     body('authorId').isInt().withMessage('Provide authorId'),
], createBook)
adminRouter.get('/book', getAllBook)

//insert book quantity
//create book
adminRouter.post('/book/instock', [
     body('bookId').isInt().withMessage("Please provide a bookId"),
     body('stock').isIn().withMessage("Please provide a stock quantity"),
], insertInStock)

module.exports = adminRouter;