const express = require('express');
const database = require('./database');
const { authMiddleware } = require('./middleware/auth.middleware');
const routes = require('./routes');
const app = express()

app.use(express.json()) // imp
app.use(express.urlencoded({ extended: true }));

const port = 5050;

app.use('/api', routes);



app.get('/', (req, res) => {
     console.log("work oin function")
     res.status(200).send("hello world")
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



app.put('/authors/:id', async (req,res) =>{

     const client = await database.connectDatabase();

     try{
          const id = parseInt(req.params.id)
          const {name,bio,age} = req.body;
          const authors = await client.query('UPDATE authors SET name= $1, bio = $2, age = $3 WHERE id = $4 RETURNING *',[name,bio, age,id]);
         
         console.log(authors.rows)
          res.status(200).json(authors.rows)
              
     }catch(error){
          
          console.log(error)

     }finally{

          await database.disconnectDatabase();
     }

})

app.delete('/authors/:id', async (req, res) =>{
     const client = await database.connectDatabase();
    
     try{
          const id = parseInt(req.params.id)
          const deleteRow = await client.query('DELETE FROM authors WHERE id = $1',[id]);
         
               res.status(201).json({message:"author deleted"})
       
     }catch(error){
          console.log(error)

     }finally{
          await database.disconnectDatabase();

     }

})


app.listen(port, () => {
     console.log('work')
})


