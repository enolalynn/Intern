const express = require('express');
const database = require('./database');
const app = express()

app.use(express.json()) // imp
app.use(express.urlencoded({ extended: true }));

const port = 5050




app.get('/', (req, res) => {
     res.send("hello world")
})


app.post('/', (req, res) => {
     console.log(req.body)
     res.send("ok")
})


app.get('/authors', async (req, res) => {

     const client = await database.connectDatabase();
     try {
          const authors = await client.query('SELECT * FROM authors');
          res.json(authors.rows)
     } catch (error) {
          console.log(error)
     }
     finally {
          await database.disconnectDatabase();
     }
})

app.get('/authors/:id', async (req, res) => {

     const client = await database.connectDatabase();
     try {
          const authorId = req.params.id

          const authors = await client.query('SELECT * FROM authors WHERE id=$1', [authorId]);
          if (authors.rows.length === 0) {

               return res.status(404).json({

                    message: "author not found"
               })
          }
          res.json(authors.rows[0])
     } catch (error) {
          console.log(error)
     }
     finally {
          await database.disconnectDatabase();
     }
})

app.post('/authors', async (req, res) => {
     const client = await database.connectDatabase();
     try {
          const body = req.body;
          // RETURNING *
          const authors = await client.query('INSERT INTO authors (name,bio,age) VALUES ($1, $2,$3) RETURNING *', [body.name, body.bio, body.age]);
          res.json(authors.rows)
     } catch (error) {
          console.log(error)
     }
     finally {
          await database.disconnectDatabase();
     }
})


app.listen(port, () => {
     console.log('work')
})

// app.listen(port, () => {
//      console.log(`Example app listening on port ${port}`)

// })
