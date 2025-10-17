const database = require('../../database');
const { validationResult } = require('express-validator');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const createAuthor = async (req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
          return res.status(400).json({

               message: 'Validation error',
               errors: errors.array(),

          });
     }
     const client = await database.connectDatabase();
     try {
          const { name, bio, age } = req.body;
          const author = await client.query('INSERT INTO authors (name,bio,age) VALUES ($1, $2,$3) RETURNING *', [name, bio, age]);

          res.json(author.rows[0])
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

     }
     finally {
          await database.disconnectDatabase();
     }
}


/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getAllAuthors = async (req, res) => {

     const client = await database.connectDatabase();
     try {
          const searchKey = req.query.search || '';


          const authors = await client.query('SELECT * FROM authors WHERE name ILIKE $1', [`%${searchKey}%`]);

          res.json(authors.rows)

     } catch (err) {
          console.log(err)
          if (err.code === '42P01') {
               res.status(400).json({
                    message: "table does not exist!"
               })
          } else {

               res.status(500).json({
                    message: "internal server error!"
               })
          }

     }
     finally {
          await database.disconnectDatabase();
     }
}


/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getSingleAuthor = async (req, res) => {

     const client = await database.connectDatabase();
     try {
          const authorId = +req.params.id;

          if (!authorId) {
               return res.status(400).json({
                    message: "provide init id!"
               })
          }


          const author = await client.query('SELECT * FROM authors WHERE id = $1', [authorId]);
          if (author.rowCount === 0) {
               res.status(404).json({
                    message: "author not found!"
               })
          }
          res.json(author.rows[0])
     } catch (err) {
          console.log(err)
          if (err.code === '42P01') {
               res.status(400).json({
                    message: "table does not exist!"
               })
          } else {

               res.status(500).json({
                    message: "internal server error!"
               })
          }

     }
     finally {
          await database.disconnectDatabase();
     }
}



/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const createBook = async (req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
          return res.status(400).json({

               message: 'Validation error',
               errors: errors.array(),

          });
     }
     const client = await database.connectDatabase();
     try {
          const { title, description, authorId } = req.body;
          const author = await client.query('SELECT * FROM authors WHERE id = $1', [authorId]);

          if (author.rowCount === 0) {
               res.status(404).json({
                    message: "author not found!"
               })
          }

          const book = await client.query('INSERT INTO books (title, description, "authorId") VALUES ($1, $2,$3) RETURNING *', [title, description, authorId]);


          res.json(book.rows[0])

     } catch (err) {
          console.log(err)
          if (err.code === '23502') {
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

     }
     finally {
          await database.disconnectDatabase();
     }
}


const getAllBook = async (req, res) => {

     const client = await database.connectDatabase();
     try {
          const books = await client.query('SELECT * FROM books as bo LEFT JOIN authors as at ON bo."authorId" = at.id');
          res.json(books.rows)

     } catch (err) {
          console.log(err)
          if (err.code === '23502') {
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

     }
     finally {
          await database.disconnectDatabase();
     }
}

module.exports = { createAuthor, getAllAuthors, createBook, getSingleAuthor, getAllBook }
