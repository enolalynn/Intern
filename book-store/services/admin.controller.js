const { contextsKey } = require("express-validator/lib/base");
const database = require("../database");
const { validationResult } = require("express-validator");
const { password } = require("pg/lib/defaults");

const createAuthor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "validation error",
      errors: errors.array(),
    });
  }
  const client = await database.connectDatabase();

  try {
    const { name, bio, age } = req.body;
    const author = await client.query(
      "INSERT INTO authors (name, bio, age) VALUES ($1, $2, $3) RETURNING * ",
      [name, bio, age]
    );
    res.json(author.rows[0]);
  } catch (err) {
    console.log(err);
    if (err.code === "23505") {
      res.status(400).json({
        message: "email already exists!",
      });
    } else if (err.code === "23502") {
      res.status(400).json({
        message: `${err.column} is require!`,
      });
    } else if (err.code === "23503") {
      res.status(400).json({
        message: "foreign key violation!",
      });
    } else if (err.code === "42P01") {
      res.status(400).json({
        message: "table does not exist!",
      });
    } else {
      res.status(500).json({
        message: "internal server error!",
      });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

const getAllAuthors = async (req, res) => {
  const client = await database.connectDatabase();

  try {
    const searchKey = req.query.search || "";
    const authors = await client.query(
      "SELECT * FROM authors WHERE name ILIKE $1",
      [`%${searchKey}%`]
    );
    res.json(authors.rows);
  } catch (err) {
    if (err.code === "42P01") {
      res.status(400).json({
        message: "table does not exist!",
      });
    } else {
      res.status(500).json({
        message: "internal server error!",
      });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

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
        message: "provide init id!",
      });
    }

    const author = await client.query("SELECT * FROM authors WHERE id = $1", [
      authorId,
    ]);
    if (author.rowCount === 0) {
      res.status(404).json({
        message: "author not found!",
      });
    }
    res.json(author.rows[0]);
  } catch (err) {
    console.log(err);
    if (err.code === "42P01") {
      res.status(400).json({
        message: "table does not exist!",
      });
    } else {
      res.status(500).json({
        message: "internal server error!",
      });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

const createBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "validation error",
      errors: errors.array(),
    });
  }
  const client = await database.connectDatabase();
  try {
    const { title, description, authorId } = req.body;
    const author = await client.query("SELECT * FROM authors WHERE id = $1", [
      authorId,
    ]);

    if (author.rowCount === 0) {
      res.status(404).json({
        message: "author not found!",
      });
    }

    const book = await client.query(
      'INSERT INTO books (title, description, "authorId") VALUES ($1, $2, $3) RETURNING *',
      [title, description, authorId]
    );

    res.json(book.rows[0]);
  } catch (err) {
    console.log(err);
    if (err.code === "23502") {
      res.status(400).json({
        message: `${err.column} is require!`,
      });
    } else if (err.code === "23503") {
      res.status(400).json({
        message: "foreign key violation!",
      });
    } else if (err.code === "42P01") {
      res.status(400).json({
        message: "table does not exist!",
      });
    } else {
      res.status(500).json({
        message: "internal server error!",
      });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

const getAllBook = async (req, res) => {
  const client = await database.connectDatabase();
  try {
    //    const books = await client.query('SELECT bo.id as "bookId", title, description, bo."authorId", at.name as "authorName", at.bio as "authorBio", at.age FROM books as bo LEFT JOIN authors as at ON bo."authorId" = at.id;');
    const books = await client.query(
      'SELECT * FROM books as bo LEFT JOIN authors as at ON bo."authorId" = at.id LEFT JOIN book_instock as bi ON bi."bookId" = bo.id'
    );
    // const books = await client.query('SELECT * FROM books as bo LEFT JOIN authors as at ON bo."authorId" = at.id LEFT JOIN book_instock as bi ON bi."bookId" = bo.id ')
    // with map
    const response = books.rows.map((element) => {
      return {
        id: element.id,
        bookId: element.bookId,
        title: element.title,
        description: element.description,
        author: {
          id: element.authorId,
          name: element.name,
        },
        stockManagement: {
          stock: element.stock,
          available_stock: element.available_stock,
          lease_stock: element.lease_stock,
        },
      };
    });

    res.json(response);

    // with forloop
    // const bookList = [];
    // for (let index = 0; index < books.rows.length; index++){
    //      const element = books.rows[index];
    //      const obj = {
    //           id: element.id,
    //           title: element.title,
    //           description: element.description,
    //           author: {
    //                id: element.authorId,
    //                name: element.name,
    //           },
    //           stockManagement: {
    //                stock : element.stock,
    //                available_stock : element.available_stock,
    //                lease_stock : element.lease_stock
    //           }
    //      }

    //      bookList.push(obj)
    // }
    // res.json(bookList)

    //first version
    //    books.rows.forEach((book) => {
    //      book.author = {
    //           id: book.authorId,
    //           name: book.authorName,
    //           bio: book.authorBio,
    //           age: book.age
    //      }
    //    });
    //    const bookList = books.rows.map(({ authorId, authorName, authorBio, age, ...rest }) => rest);
    //    console.log(bookList)

    //    res.json(bookList)
  } catch (err) {
    console.log(err);
    if (err.code === "23502") {
      res.status(400).json({
        message: `${err.column} is require!`,
      });
    } else if (err.code === "23503") {
      res.status(400).json({
        message: "foreign key violation!",
      });
    } else if (err.code === "42P01") {
      res.status(400).json({
        message: "table does not exist!",
      });
    } else {
      res.status(500).json({
        message: "internal server error!",
      });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

const updateBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "validation error",
      errors: errors.array(),
    });
  }
  const client = await database.connectDatabase();

  try {
    const bookId = +req.params.id;
    const { title, description, authorId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        message: "Invalid id",
      });
    }

    const updateBook = await client.query(
      'UPDATE books SET title= $1, description = $2, "authorId"= $3 WHERE id = $4 RETURNING *',
      [title, description, authorId, bookId]
    );

    res.json(updateBook.rows[0]);
  } catch (err) {
    console.log(err);
    if (err.code === "23502") {
      res.status(400).json({
        message: `${err.column} is required!`,
      });
    } else if (err.code === "23503") {
      res.status(400).json({
        message: "foreign key violation!",
      });
    } else if (err.code === "42P01") {
      res.status(400).json({
        message: "table does not exist!",
      });
    } else {
      res.status(500).json({
        message: "internal server error!",
      });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

const deleteBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "validation error",
      errors: errors.array(),
    });
  }

  const client = await database.connectDatabase();
  try {
    const bookId = parseInt(req.params.id);
    console.log(bookId);
    if (!bookId) {
      return res.status(400).json({
        message: "Invalid id",
      });
    }
    const deleteBook = await client.query("DELETE FROM books WHERE id = $1", [
      bookId,
    ]);
    if (deleteBook.rowCount === 0) {
      return res.status(404).json({
        message: "Book not found!",
      });
    }
    res
      .status(200)
      .json({ message: `Book id : ${bookId} is deleted successfully` });
  } catch (err) {
    console.log(err);
    if (err.code === "23502") {
      res.status(400).json({
        message: `${err.column} is required!`,
      });
    } else if (err.code === "23503") {
      res.status(400).json({
        message: "foreign key violation!",
      });
    } else if (err.code === "42P01") {
      res.status(400).json({
        message: "table does not exist!",
      });
    } else {
      res.status(500).json({
        message: "internal server error!",
      });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

const insertInStock = async (req, res) => {
  const client = await database.connectDatabase();
  try {
    const { bookId, stock } = req.body;
    const exist = await client.query(
      'SELECT * FROM book_instock WHERE "bookId" = $1',
      [bookId]
    );
    if (exist.rowCount !== 0) {
      const prevStock = exist.rows[0].stock;
      const allStock = prevStock + stock;
      const availableStock = allStock - exist.rows[0].lease_stock;
      const books = await client.query(
        'UPDATE book_instock SET stock = $1, available_stock = $2 WHERE "bookId" = $3 RETURNING * ',
        [allStock, availableStock, bookId]
      );
      res.json(books.rows[0]);
    } else {
      const books = await client.query(
        'INSERT INTO book_instock ("bookId", stock, available_stock) VALUES ($1, $2, $3) RETURNING * ',
        [bookId, stock, stock]
      );
      res.json(books.rows[0]);
    }
  } catch (err) {
    console.log(err);
    if (err.code === "23502") {
      res.status(400).json({
        message: `${err.column} is require!`,
      });
    } else if (err.code === "23503") {
      res.status(400).json({
        message: "foreign key violation!",
      });
    } else if (err.code === "42P01") {
      res.status(400).json({
        message: "table does not exist!",
      });
    } else {
      res.status(500).json({
        message: "internal server error!",
      });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

const lease = async (req, res) => {
  const client = await database.connectDatabase();
  try {
    const { user_id, due_date, items } = req.body;
    const bookIds = items.map((item) => item.book_id);

    const placeholders = bookIds.map((_, i) => `$${i + 1}`).join(",");

    //db books
    const books = await client.query(
      `SELECT * FROM book_instock WHERE "bookId" IN (${placeholders})`,
      bookIds
    );
    let errorMessages = [];

    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      const givenBook = books.rows.find(
        (item) => item.bookId === element.book_id
      );
      console.log(givenBook);
      if (givenBook) {
        const perTotal = element.quantity * element.per_price;
        element.perTotal = perTotal;
        if (element.quantity > givenBook.available_stock) {
          errorMessages.push(
            `Only ${givenBook.available_stock} books are available for book id : ${element.book_id}`
          );
        } else {
          givenBook.available_stock =
            givenBook.available_stock - element.quantity;
          givenBook.lease_stock += element.quantity;
          await client.query(
            `UPDATE book_instock
SET lease_stock = $1, available_stock = $2 WHERE "bookId" = $3;`,
            [
              // book_instock.rows[0].id,
              givenBook.lease_stock,
              givenBook.available_stock,
              element.book_id,
            ]
          );
          // console.log(givenBook.lease_stock);
          // console.log(givenBook.stock);
        }
      } else {
        errorMessages.push(`not found with book id ${element.book_id}`);
      }
    }

    if (errorMessages.length > 0) {
      return res.status(400).json({
        message: errorMessages,
      });
    }

    const count = await client.query("SELECT COUNT(*) FROM lease_invoice");
    //     console.log(count);

    const INVOICE_NO = "LEASE_" + (parseInt(count.rows[0].count) + 1);
    console.log(INVOICE_NO);
    const totalPrice = items.reduce((a, b) => {
      return a + b.perTotal;
    }, 0);

    const invoice = await client.query(
      "INSERT INTO lease_invoice (invoice_no, user_id, due_date,total_price) VALUES ($1, $2, $3, $4) RETURNING id",
      [INVOICE_NO, user_id, due_date, totalPrice]
    );

    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      await client.query(
        "INSERT INTO lease_invoice_items (invoice_id,book_id,quantity,total_price) VALUES ($1,$2,$3,$4) ",
        [
          invoice.rows[0].id,
          element.book_id,
          element.quantity,
          element.perTotal,
        ]
      );
    }

    //handle available

    const details = await client.query(
      `SELECT * FROM lease_invoice LEFT JOIN users ON lease_invoice.user_id = users.id LEFT JOIN lease_invoice_items ON lease_invoice.id = lease_invoice_items.invoice_id LEFT JOIN books ON lease_invoice_items.book_id = books.id LEFT JOIN book_instock ON book_instock."bookId" = books.id WHERE lease_invoice.invoice_no = $1;`,
      [INVOICE_NO]
    );

    const data = details.rows;
    console.log(data);

    const result = {
      invoice_id: data[0].invoice_id,
      invoice_no: data[0].invoice_no,
      status: data[0].status,
      due_date: data[0].due_date,
      borrow_date: data[0].created_at,
      invoice_total_price: data[0].invoice_total_price,
      user: {
        id: data[0].user_id,
        name: data[0].user_name,
        email: data[0].user_email,
        books: [],
      },
    };

    data.map((element) => {
      const book = {
        book_id: element.book_id,
        title: element.book_title,
        description: element.description,
        quantity: element.quantity,
        item_total_price: element.item_total_price,
        due_price: element.due_price,
        stockManagement: {
          stock: element.stock,
          available_stock: element.available_stock,
          lease_stock: element.lease_stock,
        },
      };
      result.user.books.push(book);
    });
    // books.rows.forEach((book) => {
    //      book.author = {
    //           id: book.authorId,
    //           name: book.authorName,
    //           bio: book.authorBio,
    //           age: book.age
    //      }
    //    });
    //    const bookList = books.rows.map(({ authorId, authorName, authorBio, age, ...rest }) => rest);
    //    console.log(bookList)
    //     console.log(response);
    res.json(result);
  } catch (err) {
    console.log(err);
    if (err.code === "23502") {
      res.status(400).json({
        message: `${err.column} is required!`,
      });
    } else if (err.code === "23503") {
      res.status(400).json({
        message: "foreign key violation!",
      });
    } else if (err.code === "42P01") {
      res.status(400).json({
        message: "table does not exist!",
      });
    } else {
      res.status(500).json({
        message: "internal server error!",
      });
    }
  } finally {
    await database.disconnectDatabase();
  }
};

module.exports = {
  createAuthor,
  getAllAuthors,
  getSingleAuthor,
  createBook,
  getAllBook,
  updateBook,
  deleteBook,
  insertInStock,
  lease,
};
