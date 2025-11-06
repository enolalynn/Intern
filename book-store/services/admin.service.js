const { CreateAuthorDto } = require("../dtos/create-author.dto");
const authorRepository = require("../repositories/author.repository");
const database = require("../database");

async function createAdmin(dto) {
  const client = await database.connectDatabase();
  try {
    const createdAuthor = await authorRepository.createAuthor(client, dto);
    return createdAuthor;
  } finally {
    await database.disconnectDatabase();
  }
}

module.exports = { createAdmin };
