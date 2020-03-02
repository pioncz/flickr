const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const request = require('request');

const PORT = 8080;

app.use('/', express.static(path.join(__dirname, 'dist')));
app.use('/', express.static(path.join(__dirname, 'static')));
app.use('/api', (req, res) => {
  const { tags } = req.query;
  const propertiesObject = { format:'json' };
  
  request({
    url:'https://www.flickr.com/services/feeds/photos_public.gne',
    qs:propertiesObject}, function(err, response, body) {
    if(err) { 
      console.log(err);  
      res.status(500).send({});
    }
    let resbody = JSON.parse(
      response.body.substring(15, response.body.length - 1)
    );
    res.json(resbody);
  });
});

http.listen(PORT, '0.0.0.0', function(){
    console.log('Listening on *:' + PORT);
  });
  