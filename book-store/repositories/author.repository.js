async function createAuthor(client, payload) {
  const result = await client.query(
    "INSERT INTO authors (name, bio, age) VALUES ($1, $2, $3) RETURNING * ",
    [payload.name, payload.bio, payload.age]
  );
  return result.rows[0];
}

module.exports = {
  createAuthor,
};
