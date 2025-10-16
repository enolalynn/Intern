const {Router} = require('express');
const authRouter = require('./auth.routes.js');
const routes = Router();

routes.use('/auth', authRouter);

module.exports = routes;