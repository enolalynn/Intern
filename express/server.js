import express, { json } from 'express'
const app = express()
const port = 3006


app.use(json())


app.get('/', (req, res) => {
     res.send('Hello World! 123')
})

let users = [
     {
          id: 1,
          name: "mg mg",
          age: 30
     },
     {
          id: 2,
          name: "ag ag",
          age: 20
     },
     {
          id: 3,
          name: "mya mya",
          age: 25
     },

]

app.get('/user', (req, res) => {
     const query = req.query
     if (query.search) {
          const serachData = users.filter((user) => {
               return user.name.toUpperCase().includes(query.search.toUpperCase())
          })

          console.log(serachData)
          return res.send(serachData)
     }
     return res.send(users)
})

app.post('/user', (req, res) => {
     const isUserExist = users.find((user) => {
          return user.name === req.body.name
     })

     if (isUserExist) {
          return res.status(400).json({
               message: "user already exist"
          })
     }

     users.push({
          id: users.length + 1,
          ...req.body
     })
     return res.json(users)
})

app.delete('/user/:userId', (req, res) => {
     const userId = +req.params.userId;


     const isUserExist = users.find((user) => {
          return user.id === userId
     })

     if (!isUserExist) {
          return res.status(400).json({
               message: "user already doesn't exist"
          })
     }

     users = users.filter((user) => {
          return user.id !== userId
     })

     return res.json(users)
})


app.patch('/user/:userId', (req, res) => {
     const userId = +req.params.userId;
     const body = req.body

     let isUserExist = users.find((user) => {
          return user.id === userId
     })

     if (!isUserExist) {
          return res.status(400).json({
               message: "user already doesn't exist"
          })
     }

     isUserExist = {
          id: isUserExist.id,
          name: body.name,
          age: body.age
     }

     const index = users.findIndex((user) => user.id === userId)
     users[index] = isUserExist

     return res.json(users)
})


app.listen(port, () => {
     console.log(`Example app listening on port ${port}`)
})
