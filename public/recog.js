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