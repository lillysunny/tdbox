const http = require('http');

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');

const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) require('dotenv').config();

var app = express();
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
const io = require('socket.io')(server, {
  origins: '*:*'
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Attach the io instance to the express app object
// to make it accessible from the routes
app.io = io;

io.on('connection', (socket) => {
  console.log('New client connected');
});


app.use(bodyParser.urlencoded({
    extended: true
  }))
  .use(bodyParser.json())
  .use(cors({
    origin: true,
    credentials: true
  }))
  .use('/', require('./routes'));


// Must use http server as listener rather than express app
server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
