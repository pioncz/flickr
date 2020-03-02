const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');

const PORT = 8080;

app.use('/', express.static(path.join(__dirname, 'dist')));
app.use('/', express.static(path.join(__dirname, 'static')));

http.listen(PORT, '0.0.0.0', function(){
    console.log('Listening on *:' + PORT);
  });
  