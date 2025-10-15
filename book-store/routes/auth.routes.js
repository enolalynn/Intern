const express = require('express');
const { registerUser, loginUser, validateUser } = require('../services/auth/auth.controller');
const authRouter = express.Router();
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth.middleware');

//user register
authRouter.post('/register', [
     body('email').isEmail().withMessage("Invalid email format"),
     body('name').isString().isLength({ min: 6, max: 10 }).withMessage('Name must be between 6 and 20 characters long'),

     body('password').isString().isLength({ min: 6, max: 20 }).withMessage('Password must be between 6 and 20 characters long'),
], registerUser)


//user login
authRouter.post('/login', [
     body('email').isEmail().withMessage("Invalid email format"),
     body('password').isString().isLength({ min: 6, max: 20 }).withMessage('Password must be between 6 and 20 characters long'),
], loginUser)

authRouter.get('/validate', authMiddleware, validateUser)


module.exports = authRouter;




//user login