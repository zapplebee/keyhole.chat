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
var doEmitTranscript = function(){};
var dataURL = "";

function initalizeRoom(){

  doEmitPixels = _.throttle(function(){socket.emit('image',dataURL)},100)

  socket.on('image', function (dataURL) {
    visitor.style['background-image'] = "url('" + dataURL + "')";
  });


  doEmitTranscript = function(text){
    socket.emit('voice',text);
    var dialog = document.createElement('p');
    dialog.innerHTML = text;
    var fontsize = text.length > 20 ? 0.5 : 1;
    dialog.style['font-size'] = fontsize + "em"; 
    me.appendChild(dialog);
    var t = Math.max(2000,text.length * 100);
    window.setTimeout(function(){me.removeChild(dialog)},t);
  }

  socket.on('voice', function (text) {
    var dialog = document.createElement('p');
    dialog.innerHTML = text;
    var fontsize = text.length > 20 ? 0.5 : 1;
    dialog.style['font-size'] = fontsize + "em"; 

    var utterance = new SpeechSynthesisUtterance(data.text);

    var timeout;

    utterance.onstart = function(){
      visitor.appendChild(dialog);
      var t = Math.max(2000,text.length * 100);
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



var recognizing = false;
var recognition = new webkitSpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';

recognition.onstart = function() {
  recognizing = true;
};

recognition.onerror = function(event) {
   console.log(event);
};

recognition.onresult = function(event) {
  doEmitTranscript(event.results[0][0].transcript);
};

recognition.onend = function(event){
  recognizing = false;
  start();
}

function start(event) {
  if (recognizing) { return; } 
  recognition.start();
}

var synth = window.speechSynthesis;
var visitor = document.querySelector('#visitor');
var me = document.querySelector('#me');




var threshController = document.querySelector("#thresh");
threshController.value = 100;


function SensorGrid(config) {
  "use strict"
  var sensorGrid = this;
  var scale = 0.1;
  var video = document.createElement('video');
  video.setAttribute("style",'display:none');
  video.classList.add('sensor-grid-video');
  video.setAttribute('autoplay', true);
  var cvs = document.createElement('canvas');
  var ctx = cvs.getContext("2d");

  function describeSize(width, height) {
    console.log(arguments);
    cvs.width = Math.floor(width * scale);
    cvs.height = Math.floor(height * scale)
  }

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  if (navigator.getUserMedia) {
    function videoSuccess(stream) {
      if (window.URL) {
        video.src = window.URL.createObjectURL(stream);
        console.log(video);
      } else if (video.mozSrcObject !== undefined) {
        video.mozSrcObject = stream;
      } else {
        video.src = stream;
      }


      video.addEventListener('play', function() {
        describeSize(video.videoWidth, video.videoHeight);
        requestAnimationFrame(renderFrame);
      });
    };

    function videoError(error) {
      console.log(error);
    }

    navigator.getUserMedia({
      video: true
    }, videoSuccess, videoError);

  }

  function renderFrame() {
    ctx.drawImage(video, 0, 0, cvs.width, cvs.height);
    var pixelArray = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
    for(var i = 0 ; i < pixelArray.length ; i = i + 4){
      pixelArray[i + 3] = 150;
      var luminosity = (0.2126 * pixelArray[i] + 0.7152 * pixelArray[i+1] + 0.0722 * pixelArray[i+2]);
      if(luminosity < threshController.value){
        pixelArray[i] = 0;
        pixelArray[i + 1] = 0;
        pixelArray[i + 2] = 0;
        pixelArray[i + 3] = 150;
      } else {
        pixelArray[i] = 0;
        pixelArray[i + 1] = 0;
        pixelArray[i + 2] = 0;
        pixelArray[i + 3] = 0;
      }
    }

    var simImage = new ImageData(pixelArray, cvs.width, cvs.height);
    ctx.putImageData(simImage, 0, 0);
    dataURL = cvs.toDataURL();
    doEmitPixels();
    me.style['background-image'] = "url('" + dataURL + "')";    
    requestAnimationFrame(renderFrame);
  }
};

var sensorGrid = new SensorGrid();