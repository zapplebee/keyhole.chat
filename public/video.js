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

    var sW = Math.floor(width * scale);
    var sH = Math.floor(height * scale)
    cvs.width = sW;
    cvs.height = sH;
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