var lobby = io.connect('/lobby');
var room = false;
var socket;

lobby.on('room',function (roomid) {
  console.log(roomid);
  if(room === false){
    socket = io.connect('/'+roomid);
    initalizeRoom();
  }
  room = roomid;
});


var doEmitPixels = function(){};
var m = function(){};
var dataURL = "";

function initalizeRoom(){

doEmitPixels = _.throttle(function(){socket.emit('image',dataURL)},100)

socket.on('image', function (dataURL) {
  visitor.style['background-image'] = "url('" + dataURL + "')";
});


m = function(text){
  socket.emit('voice',{text:text});
  var dialog = document.createElement('p');
  dialog.innerHTML = text;
  var fontsize = text.length > 20 ? 0.5 : 1;
  dialog.style['font-size'] = fontsize + "em"; 
  me.appendChild(dialog);
  var t = Math.max(2000,text.length * 100);
  window.setTimeout(function(){me.removeChild(dialog)},t);
}

socket.on('voice', function (data) {
  var dialog = document.createElement('p');
  dialog.innerHTML = data.text;
  var fontsize = data.text.length > 20 ? 0.5 : 1;
  dialog.style['font-size'] = fontsize + "em"; 

  var utterance = new SpeechSynthesisUtterance(data.text);

  var timeout;

  utterance.onstart = function(){
    visitor.appendChild(dialog);
    var t = Math.max(2000,data.text.length * 100);
    timeout = window.setTimeout(function(){
      timeout = null;
      visitor.removeChild(dialog)
    },t);
  }

  utterance.onend = function(){
    if(timeout){
      window.clearTimeout(timeout);
    }
    
    visitor.removeChild(dialog);
  }
  synth.speak(utterance);
});
}