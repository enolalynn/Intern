export async function getUser(req, res) {
     if (1 === 1) {
          console.log('work here')
          throw new Error("1 is not equal 1")
     }
     res.writeHead(200, { 'Content-Type': 'application/json' });
     res.end(JSON.stringify({
          name: "mg mg",
          age: 30,
     }));
}

export async function getUserProfile(req, res, userId) {
     console.log('user id from get user profile ', userId)
     try {
          if (userId !== '1') {
               throw new Error("user not found")
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
               userId: userId,
               username: "mg mg",
               age: 40
          }));
     } catch (error) {
          console.log(error)
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
               message: error.message
          }));

     }

}