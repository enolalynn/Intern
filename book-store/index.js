const { Client } = require('pg')


async function main() {

     const client = await databsae();


     const res = await client.query('SELECT * FROM authors')
     console.log('total authors ', res.rows)


     const name = 'mg mg'
     const age = 20

     await client.query(`INSERT INTO authors (name,age) VALUES ($1,$2)`, [name, age])

     const authors = await client.query('SELECT * FROM authors')


     console.log(authors.rows)
     await client.end()
}

//connect db
async function databsae() {
     const client = new Client({
          port: 5432,
          database: "book-store",
          host: "localhost",
          user: "openmaptiles",
          password: "openmaptiles"
     })
     await client.connect()

     return client
}

main();

