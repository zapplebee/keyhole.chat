"use strict"
const express = require('express');
const app = express();
const sassMiddleware = require('node-sass-middleware');
const path = require('path');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const uuidV4 = require('uuid/v4');


server.listen(80);


//pug renderer, index
app.set('views', './views')
app.set('view engine', 'pug')
app.get('/', function (req, res) {
  res.render('index', {});
});
app.use('/script/angular.min.js', express.static(__dirname + '/node_modules/angular/angular.min.js'));
app.use('/script/socket.io.min.js', express.static(__dirname + '/node_modules/socket.io-client/dist/socket.io.min.js'));
app.use('/script/lodash.min.js', express.static(__dirname + '/node_modules/lodash/lodash.min.js'));
app.use('/script', express.static(__dirname + '/public'));

//sass
app.use(sassMiddleware({
    src: path.join(__dirname, 'style'),
    dest: path.join(__dirname, 'style'),
    debug: true,
    outputStyle: 'extended',
    prefix: "/style"
}));
app.use("/style", express.static(path.join(__dirname, '/style')));
app.use("/images", express.static(path.join(__dirname, 'images')));

var queue = false;

const lobby = io.of('/lobby');
lobby.on('connection', function(socket){
  console.log('someone entered the lobby');

  //socket.emit('room',socket.id);
  console.log(socket.id);
  if(queue === false){
    queue = uuidV4();
    createRoom(queue);
    console.log('new room created:', queue);
    socket.emit('room',queue);
  } else {
    socket.emit('room',queue);
    queue = false;
  }
});


function createRoom(id){
  var room = io.of("/" + id);
  room.on('connection',function(socket){
    console.log(socket.id, 'connected to ', id);
    socket.on('voice',function(msg){
      socket.broadcast.emit('voice',msg);
    });
    socket.on('image',function(pixels){
      socket.broadcast.emit('image',pixels);
    });
  })
}