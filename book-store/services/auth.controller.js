const database = require('../database');
const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const {adminTokenKey, tokenKey, expiresIn} = require('../utils');



/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json(
            {
                message : 'Validation error',
                errors : errors.array(),
            }
        );
    }
    const client = await database.connectDatabase();
    try{
        const {name, email, password, gender} = req.body;

         await client.query('BEGIN');

        const users = await client.query('INSERT INTO users (name, email, password, gender) VALUES ($1, $2, $3, $4) RETURNING *', [name, email, password, gender]);

        await client.query('COMMIT');

        console.log('Transaction successful');
        res.status(200).json(users.rows[0]);

    }catch(err){

        await client.query('ROLLBACK');
        await client.query(`
                        SELECT setval(
                        'users_id_seq',
                        COALESCE((SELECT MAX(id) FROM users), 0)
                        );
                    `);
            
        if(err.code === '23505'){
            res.status(400).json({
                message : `email already exists!`
            })
        }else if (err.code === '23502'){
            res.status(400).json({
                message : `${err.column} is require!`
            })
        }else if(err.code === '23503'){
            res.status(400).json({
                message:`foreign key violation!`
            })
        }else if(err.code === '42P01'){
            res.status(400).json({
                message: 'table does not exist!'
            })
        }else{
            res.status(500).json({
                message:'internal server error!'
            })
        }

    }finally{
        await database.disconnectDatabase();
    }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const loginUser = async (req, res) => {
    console.log("req body", req.body)

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({
            message : 'Validation error',
            errors : errors.array(),
        });
    }

    const client = await database.connectDatabase();

    try{
        const {email, password} = req.body;
        const user = await client.query('SELECT * FROM users WHERE email = $1 AND password = $2;' , [email, password]);

        console.log(user.rows[0])

        if(user.rows.length === 0){
            res.status(400).json({
                message: "email or password is incorrect!"
            })
        }

        const accessToken = jwt.sign({
            userId : user.rows[0].id,
            email: user.rows[0].email,
        }, 
        tokenKey, 
        {
            expiresIn: expiresIn
        });

        console.log(accessToken)

        res.json({user: user.rows[0], accessToken})

    }catch(err){
         if (err.code === '23505') {
               res.status(400).json({
                    message: "email already exists!"
               })
          }
          else if (err.code === '23502') {
               res.status(400).json({
                    message: `${err.column} is require!`
               })
          }
          else if (err.code === '23503') {
               res.status(400).json({
                    message: "foreign key violation!"
               })
          }
          else if (err.code === '42P01') {
               res.status(400).json({
                    message: "table does not exist!"
               })
          } else {

               res.status(500).json({
                    message: "internal server error!"
               })
          }
    }finally{
        await database.disconnectDatabase();
    }

}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const validateUser = async (req, res) => {
    const client = await database.connectDatabase();
    try {
        const user = req.user;
        const exist = await client.query('SELECT * FROM users WHERE email = $1;', [user.email]);
        if(exist.rows.length === 0 ){
            res.status(400).json({
                message: "user not found!"
            })
        }

        res.json(exist.rows[0])


    } catch (error) {
        if (err.code === '23505') {
               res.status(400).json({
                    message: "email already exists!"
               })
          }
          else if (err.code === '23502') {
               res.status(400).json({
                    message: `${err.column} is require!`
               })
          }
          else if (err.code === '23503') {
               res.status(400).json({
                    message: "foreign key violation!"
               })
          }
          else if (err.code === '42P01') {
               res.status(400).json({
                    message: "table does not exist!"
               })
          } else {

               res.status(500).json({
                    message: "internal server error!"
               })
          }
    }finally{
        await database.disconnectDatabase();
    }
}

const adminRegister = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            message: 'Validation error', 
            errors : errors.array()
        });
    }

    const client = await database.connectDatabase();
    try {
        const {name, email, password} = req.body;

        await client.query('BEGIN')
        const admins = await client.query('INSERT INTO admins (name, email, password) VALUES ($1, $2, $3) RETURNING  *' , [name, email, password]);
        await client.query('COMMIT')
        res.json(admins.rows[0])
        
    } catch (err) {

        await client.query('ROLLBACK');
        await client.query(`SELECT setval('admins_id_seq', COALESCE((SELECT MAX(id) FROM admins), 0));`);

        if(err.code === '23505'){
            res.status(400).json({
                message: 'email already exists!'
            })
        }else if(err.code === '23502'){
            res.status(400).json({
                message: `${err.column} is require!`
            })
        }else if(err.code === '23503'){
            res.status(400).json({
                message : 'foreign key violation!'
            })
        }else if(err.code === '42P01'){
            res.status(400).json({
                message : 'table does not exist!'
            })
        }else{
            res.status(500).json({
                message:'internal server error!'
            })
        }
        
    }finally{
            await database.disconnectDatabase();
        }

}

const adminLogin = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            message: 'Validation error', 
            errors: errors.array()
        })
    }

    const client = await database.connectDatabase();
    try {
        const {email, password} = req.body;
        const admin = await client.query('SELECT * FROM admins WHERE email=$1 AND password = $2;', [email,password]);

        if(admin.rows.length === 0 ){
            res.status(400).json({
                message : 'email or password is incorrect!'
            })
        }

        const accessToken = jwt.sign({
            adminId : admin.rows[0].id,
            email: admin.rows[0].email
        }, adminTokenKey, {expiresIn: expiresIn});

        res.json({
            admin : admin.rows[0],
            accessToken
        })

    } catch (err) {
        console.log(err)

        if(err.code === '23505'){
            res.status(400).json({
                message:'email already exists!'
            })
        }else if(err.code === '23502'){
            res.status(400).json({
                message: `${err.column} is require!`
            })
        }else if(err.code === '42P01'){
            res.status(400).json({
                message:'table does not exist!'
            })
        }else{
            res.status(500).json({
                message: 'internal server error!'
            })
        }

    }finally{
        await database.disconnectDatabase();
    }

}

const validateAdmin = async (req, res) => {
    const client = await database.connectDatabase();
    try {
        const admin = req.admin;
        const exist = await client.query('SELECT * FROM admins WHERE email = $1;', [admin.email]);

        if(exist.rows.length === 0){
            res.status(400).json({
                message : 'user not found!'
            })
        }
        res.json(exist.rows[0])

    } catch (err) {

         if (err.code === '23505') {
               res.status(400).json({
                    message: "email already exists!"
               })
          }
          else if (err.code === '23502') {
               res.status(400).json({
                    message: `${err.column} is require!`
               })
          }
          else if (err.code === '23503') {
               res.status(400).json({
                    message: "foreign key violation!"
               })
          }
          else if (err.code === '42P01') {
               res.status(400).json({
                    message: "table does not exist!"
               })
          } else {

               res.status(500).json({
                    message: "internal server error!"
               })
          }
        
    }finally{
        await database.disconnectDatabase();
    }
}


module.exports = {
    registerUser, 
    loginUser, 
    validateUser,
    adminRegister,
    adminLogin,
    validateAdmin
}
