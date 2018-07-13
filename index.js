const express = require('express')
const app = express()
var bodyParser = require('body-parser');
app.use(bodyParser.json());
var expressWs = require('express-ws')(app);
var isBuffer = require('is-buffer')
var header = require("waveheader");
var fs = require('fs');
var file;



//Serve a Main Page
app.get('/', function(req, res) {
    res.send("Node Websocket");
});


//Serve the NCCO on the /ncco answer URL
app.get('/ncco', function(req, res) {

    var ncco = require('./ncco.json');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(ncco), 'utf-8');
});


//Log the Events
app.post('/event', function(req, res) {
    console.log(req.body);
    res.send("ok");
});

// Handle the Websocket
app.ws('/socket', function(ws, req) {
    var rawarray = []; 
    console.log("Websocket Connected")
    ws.on('message', function(msg) {
     if (isBuffer(msg)) {
             rawarray.push(msg);
     }
     else {
         console.log(msg); 
     }
    });
    ws.on('close', function(){
      console.log("Websocket Closed")
      file = fs.createWriteStream('./output.wav');
      file.write(header(16000 * rawarray.length/50 * 2,{
                        sampleRate: 16000,
                        channels: 1,
                        bitDepth: 16}));
      rawarray.forEach(function(data){
          file.write(data);
      });
  })
});

app.listen(8000, () => console.log('App listening on port 8000!'))