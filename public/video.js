var threshold = 100;

var threshController = document.querySelector("#thresh");
threshController.value = 100;

var state = {
  processedPixels : [],
  width           : 0,
  height          : 0
}


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
    state.width = sW;
    state.height = sH;
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
    state.processedPixels = [];
    var rawSensorPixels = _.chunk(ctx.getImageData(0, 0, cvs.width, cvs.height).data, 4);
    var rawSensorRows = _.chunk(rawSensorPixels, cvs.width, true);
    _.each(rawSensorRows, function(row, y, rawSensorRows) {
      var y = y;
      _.each(row, function(pixel, x, row) {
        var x = x;
        var pxl = SensorGrid.util.RGBApixel(pixel);
        var luminosity = (0.2126 * pxl.r + 0.7152 * pxl.g + 0.0722 * pxl.b);
        if (luminosity < threshController.value) {
          state.processedPixels.push({x:x,y:y});
        }
      });
    });


    doEmitPixels();

    me.style['background-image'] = "url('" + renderCanvas(state) + "')";
    
    requestAnimationFrame(renderFrame);
  }
};



function renderCanvas(imageData){
  var canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  var ctx = canvas.getContext('2d');
  _.each(imageData.processedPixels,function(pixel,index,processedPixels){
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.fillRect(pixel.x, pixel.y, 1, 1);

  })

  return canvas.toDataURL();

}


SensorGrid.util = {
  RGBApixel : function(pixelArray) {
  return {r:pixelArray[0], g:pixelArray[1], b:pixelArray[2], a:pixelArray[3]}
  }
}



var sensorGrid = new SensorGrid();
