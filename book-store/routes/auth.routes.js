const express = require('express');
const {registerUser, loginUser, validateUser} = require('../services/auth.controller.js')
const authRouter = express.Router();
const {body} = require('express-validator');
const {authMiddleware} = require('../middleware/auth.middleware');

authRouter.post('/register', [
    body('email').isEmail().withMessage('Invalid format'),
    body('name').isString().isLength({min:6, max:20}).withMessage('Name must be between 6 and 20 long'),
    body('password').isString().isLength({min: 6, max: 20}).withMessage('Password must be between 6 and 20 long')
], registerUser)

authRouter.post('/login', [
    body('email').isEmail().withMessage("Invalid email format"),
    body('password').isString().isLength({min: 6, max : 20}).withMessage('Password must be between 6 and 20 long')
], loginUser)

authRouter.get('/validate', authMiddleware, validateUser)

module.exports = authRouter;