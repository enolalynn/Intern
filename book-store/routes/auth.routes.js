const express = require('express');
const {registerUser, loginUser, validateUser, adminRegister, adminLogin, validateAdmin} = require('../services/auth.controller.js')
const authRouter = express.Router();
const {body} = require('express-validator');
const {authMiddleware, authAdminMiddleware} = require('../middleware/auth.middleware');

authRouter.post('/register', [
    body('email').isEmail().withMessage('Invalid format'),
    body('name').isString().isLength({min:6, max:20}).withMessage('Name must be between 6 and 20 long'),
    body('password').isString().isLength({min: 6, max: 20}).withMessage('Password must be between 6 and 20 long')
], registerUser)

authRouter.post('/login', [
    body('email').isEmail().withMessage("Invalid email format"),
    body('password').isString().isLength({min: 6, max : 20}).withMessage('Password must be between 6 and 20 long')
], loginUser)

//user validate
authRouter.get('/validate', authMiddleware, validateUser)

authRouter.post('/admin/register', [
    body('email').isEmail().withMessage('Invalid email format'),
    body('name').isString().isLength({min: 6, max: 10}).withMessage('Name must be between 6 and 20 character long'),
    body('password').isString().isLength({min: 6, max: 20}).withMessage('Password must be between 6 and 20 characters long'),
], adminRegister)

//admin login
authRouter.post('/admin/login', [
    body('email').isEmail().withMessage("Invalid email format"),
    body('password').isString().isLength({min: 6, max: 20}).withMessage('Password must be between 6 and 20 characters long')
], adminLogin)

//admin validate
authRouter.get('/admin/validate', authAdminMiddleware, validateAdmin)

module.exports = authRouter;