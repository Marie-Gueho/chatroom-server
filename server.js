const express = require('express');
const bodyParser = require('body-parser');
const Server = require('http').Server;
const socket = require('socket.io');

const app = express();
const server = Server(app);
const io =  socket(server);
const port = 3001;

const db = {
  users: {
    'bob@dylan.com': {
      password: 'hurricane',
      username: 'Bob',
      color: '#c23616',
    },
    'david@bowie.com': {
      password: 'starman',
      username: 'David',
      color: '#009432',
    },
    'lou@reed.com': {
      password: 'vicious',
      username: 'Lou',
      color: '#f0f',
    }
  }
};

/* EXPRESS */

app.use(bodyParser.json());

app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  response.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

/* PAGE D'ACCUEIL DU SERVEUR */
app.get('/', (request, response) => {
  response.send(`
    <div style="margin: 5em auto; width: 400px; line-height: 1.5">
      <h1 style="text-align: center">Hello!</h1>
      <div>Désormais, tu dois venir utiliser l'API</div>
      <ul style="display: inline-block; margin-top: .2em">
        <li><code>POST http://localhost:${port}/login</code></li>
        <li><code>POST http://localhost:${port}/forgot</code></li>
        <li><code>GET http://localhost:${port}/theme/{email}</code></li>
      </ul>
    </div>
  `);
});

/* LOGIN */
app.post('/login', (request, response) => {
  console.log('>> POST /login', request.body);
  const { email, password } = request.body;
  let username;
  // vérification des identifiants
  if(db.users[email] && db.users[email].password === password) {
    username = db.users[email].username;
  }
  //réponse http
  if (username) {
    console.log('<< 200 OK', username);
    response.json({
      pseudo: username,
    });
  }
  else {
    console.log('<< 401 UNAUTHORIZED');
    response.status(401).end();
  }
});

/* SOCKET.IO */
let id = 0;
io.on('connection', (ws) => {
  console.log('>> socket.io - connected');
  ws.on('client_message', (message) => {
    console.log('test', message)
    message.id = ++id;
    io.emit('server_message', message);
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
