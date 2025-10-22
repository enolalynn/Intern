const { contextsKey } = require('express-validator/lib/base');
const database = require('../database');
const {validationResult} = require('express-validator');
const _ = require('lodash');

const createAuthor = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            message : 'validation error', 
            errors: errors.array()
        });
    }
    const client = await database.connectDatabase();

    try {
        const {name, bio, age} = req.body;
        const author = await client.query('INSERT INTO authors (name, bio, age) VALUES ($1, $2, $3) RETURNING * ', [name, bio, age]);
        res.json(author.rows[0])
        
    } catch (err) {
          console.log(err)
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

const getAllAuthors = async (req, res) => {
    const client = await database.connectDatabase();

    try {
        const searchKey = req.query.search || '';
        const authors = await client.query('SELECT * FROM authors WHERE name ILIKE $1', [`%${searchKey}%`]);
        res.json(authors.rows)
        
    } catch (err) {
        if (err.code === '42P01') {
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

const getSingleAuthor = async( req, res) => {
    const client = await database.connectDatabase();
    try {
        const authorId = +req.params.id;
        if(!authorId){
            return res.status(400).json({
                message : 'provide init id!'
            })
        }

        const author = await client.query('SELECT * FROM authors WHERE id = $1', [authorId]);
        if(author.rowCount === 0){
            res.status(404).json({
                message: 'author not found!'
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
    } finally {
        await database.disconnectDatabase();
    }
}

const createBook = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            message:'validation error', 
            errors : errors.array(),
        });
    }
    const client = await database.connectDatabase();
    try {
        const {title , description, authorId} = req.body;
        const author = await client.query('SELECT * FROM authors WHERE id = $1',[authorId]);

        if (author.rowCount === 0){
            res.status(404).json({
                message: "author not found!"
            })
        }

        const book = await client.query('INSERT INTO books (title, description, "authorId") VALUES ($1, $2, $3) RETURNING *', [title, description, authorId]);

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
    }finally{
        await database.disconnectDatabase();
    }

}

const getAllBook = async (req, res) => {
    const client = await database.connectDatabase();
    try {
        const books = await client.query('SELECT bo.id as "bookId", title, description, bo."authorId", at.name as "authorName", at.bio as "authorBio", at.age FROM books as bo LEFT JOIN authors as at ON bo."authorId" = at.id;');
        books.rows.forEach((book) => {
          book.author = {
               id: book.authorId,
               name: book.authorName,
               bio: book.authorBio,
               age: book.age
          }   
        });

     
        const bookList = books.rows.map(({ authorId, authorName, authorBio, age, ...rest }) => rest);
     //    console.log(bookList)
          
        res.json(bookList)

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
        
    }finally{
        await database.disconnectDatabase();
    }
}

const updateBook = async (req, res) =>{
     const errors = validationResult(req);
     if(!errors.isEmpty()){
          return res.status(400).json({
               message:'validation error', 
               errors : errors.array(),
          });
     }
    const client = await database.connectDatabase();
          
     try {
          const bookId = +req.params.id;
          const {title, description, authorId} = req.body;

          if(!bookId){
               return res.status(400).json({
                    message: 'Invalid id'
               })
          }

          const updateBook = await client.query('UPDATE books SET title= $1, description = $2, "authorId"= $3 WHERE id = $4 RETURNING *',[ title, description, authorId, bookId]);

          res.json(updateBook.rows[0])



     } catch (err) {

          console.log(err);
          if (err.code === '23502') {
               res.status(400).json({
                    message: `${err.column} is required!`
               });
          } 
          else if (err.code === '23503') {
               res.status(400).json({
                    message: 'foreign key violation!'
               });
          } 
          else if (err.code === '42P01') {
               res.status(400).json({
                    message: 'table does not exist!'
               });
          } 
          else {
            res.status(500).json({
                message: 'internal server error!'
            });
          }

          
     }finally{
          await database.disconnectDatabase();
     }

}

const deleteBook = async (req, res) => {
     const errors = validationResult(req);
     if(!errors.isEmpty()){
          return res.status(400).json({
               message:'validation error', 
               errors : errors.array(),
          });
     }

     const client = await database.connectDatabase();
     try {
          const bookId = parseInt(req.params.id);
          console.log(bookId)
           if(!bookId){
               return res.status(400).json({
                    message: 'Invalid id'
               })
          }
          const deleteBook = await client.query('DELETE FROM books WHERE id = $1',[bookId]);
          if(deleteBook.rowCount === 0){
               return res.status(404).json({
                    message: "Book not found!"
               })
          }
          res.status(200).json({message:`Book id : ${bookId} is deleted successfully`})
         
          
     } catch (err) {
          console.log(err)
          if (err.code === '23502') {
               res.status(400).json({
                    message: `${err.column} is required!`
               });
          } 
          else if (err.code === '23503') {
               res.status(400).json({
                    message: 'foreign key violation!'
               });
          } 
          else if (err.code === '42P01') {
               res.status(400).json({
                    message: 'table does not exist!'
               });
          } 
          else {
            res.status(500).json({
                message: 'internal server error!'
            });
          }
          
     }finally{
          await database.disconnectDatabase();
     }



}

module.exports = { createAuthor, getAllAuthors, getSingleAuthor, createBook, getAllBook, updateBook , deleteBook}