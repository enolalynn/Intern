// server.mjs
import { createServer } from 'node:http';
import { getUser, getUserProfile } from './getUser.mjs';
import url from 'url'

const server = createServer((req, res) => {

     const parsedUrl = url.parse(req.url, true);
     const queryParams = parsedUrl.query;

     if (parsedUrl.pathname === '/user') {
          return getUser(req, res)
     } else if (parsedUrl.pathname === '/profile') {
          return getUserProfile(req, res, queryParams.userId)
     }

     res.writeHead(200, { 'Content-Type': 'text/plain' });
     res.end('Main Route!\n');
});

// starts a simple http server locally on port 3000
server.listen(3006, '127.0.0.1', () => {
     console.log('Listening on 127.0.0.1:3000');
});

// run with `node server.mjs`
