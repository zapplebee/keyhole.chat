"use strict"
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const uuidV4 = require('uuid/v4');


server.listen(80);

app.use('/script/angular.min.js', express.static(__dirname + '/node_modules/angular/angular.min.js'));
app.use('/socket.io.min.js', express.static(__dirname + '/node_modules/socket.io-client/dist/socket.io.min.js'));
app.use('/', express.static(__dirname + '/public'));

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