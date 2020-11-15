/*

TODO
 
  note (and wave?)
    draw circle on canvas
  game loop? pitch queue?
  ring buffer

MAX_WL
  In audioworklet allows 128 sample min buff otherwise processor allows minimum of 256 samples.
  The higher the sample rate the lower the latency due to this buffer!
  However our pitch algorithm needs MAX_WL samples to detect lowest note in range (eg recorder).
  So we need to queue the buffers (ie need ring buffer) to cover the lowest notes!
  It might be possible to modify algorithm so looks for high notes (up to length of available samples - eg one native buffer's worth) first and then lower notes.
    What kind of effect on reliability does shorter correlation range have?
 For the purposes of testing web audio on different platforms - would be nice if it handled my voice range!
    Could we do correlation in my voice range with just 256 sample buffer?
      Can do algorithm on each buffer when arrives - as I do in C. So might as well implement ring buffer!
    Note that if all the platforms I'm interested in do implement web asm (and sharedBuffer?) then we should do it in C!

LINKS
  Why requestAnimationFrame  - http://www.javascriptkit.com/javatutors/requestanimationframe.shtml


*/

//import * as yin from "./yin.js";
import { YINDetector } from "./pitch/yin.js";
//import { name, draw, reportArea, reportPerimeter } from './modules/square.js';
var yDoTiming = true;
/*navigator.mediaDevices.getUserMedia({ audio: true })
    .then(successCallback)
    .catch(failureCallback);
On success, our successCallback will be called with a MediaStream object which we can use to access the microphone:
*/
var iCtr = 0;
var requestAnimationFrameId = null;
//var DEBUGCANVAS = null;
export var iSampleRate;
// vars from pitchdetect
var audioContext = null;
var isPlaying = false;
var sourceNode = null;
var analyser = null;
var theBuffer = null;
var DEBUGCANVAS = null;
var mediaStreamSource = null;
var detectorElem, canvasElem, canvasContext, waveCanvas, pitchElem, noteElem, detuneElem, detuneAmount;

if (navigator.mediaDevices) {
  //alert("getUserMedia supported.");
  navigator.mediaDevices
    .getUserMedia({
      audio: {
        autoGainControl: false,
        echoCancellation: false,
        zoom: 0.1,
      },
      video: false,
    })
    .then(function (stream) {
      init();
      doStuff(stream);
    })
    .catch(function (err) {
      alert("The following gUM error occured: " + err);
    });
} else {
  alert("getUserMedia not supported on your browser!!");
}

function init() {
  if (!window.requestAnimationFrame) window.requestAnimationFrame = window.webkitRequestAnimationFrame;
  //kickoff? requestAnimationFrameId = window.requestAnimationFrame( updatePitch ); //??
  canvasElem = document.getElementById("output");
  canvasContext = canvasElem.getContext("2d");
  canvasContext.strokeStyle = "black";
  canvasContext.lineWidth = 1;

  DEBUGCANVAS = document.getElementById("waveform");
  if (DEBUGCANVAS) {
    waveCanvas = DEBUGCANVAS.getContext("2d");
    waveCanvas.strokeStyle = "black";
    waveCanvas.lineWidth = 1;
  }
}

function doStuff(mediaStream) {
  var audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // Create a source from our MediaStream
  var source = audioContext.createMediaStreamSource(mediaStream);
  window.iSampleRate = audioContext.sampleRate;
  // Now create a Javascript processing node with the following parameters:
  // 4096 = bufferSize (See notes below)
  // 2 = numberOfInputChannels (i.e. Stereo input)
  // 2 = numberOfOutputChannels (i.e. Stereo output)
  //var node = audioContext.createScriptProcessor(256, 2, 2);
  var node = audioContext.createScriptProcessor(512, 2, 2);
  /*node.onaudioprocess = function (data) {
    console.log(data);
  };*/
  var yoffset = 0;
  node.onaudioprocess = function (e) {
    //var inputBuffer = e.inputBuffer;
    //var outputBuffer = e.outputBuffer;
    var leftChannel = e.inputBuffer.getChannelData(0); //.buffer;??
    //var rightChannel = e.inputBuffer.getChannelData(1);//.buffer;
    //var s1 = leftChannel[1];
    //var s2 = leftChannel[2];
    //var s3 = leftChannel[3];
    canvasContext.clearRect(0, yoffset, 100, 100);

    var pitch;
    if (yDoTiming) {
      var startNsTime = performance.now();
      var iIts = 1000;
      for (var i = 0; i < iIts; i++) {
        pitch = YINDetector(leftChannel);
      }
      var ellapsedItsMs = performance.now() - startNsTime;
      //alert("ellapsedItsMs = " + ellapsedItsMs);
      console.log("ellapsedItsMs = " + ellapsedItsMs);
    } else {
      pitch = YINDetector(leftChannel);
    }

    var xoffset = 5;
    yoffset = 600 - pitch / 2;
    var radius = 40;

    /*yoffset++;
    if (yoffset > 80) {
      yoffset = 0;
    }*/
    //canvasContext.clearRect(xoffset, yoffset, radius* 2, radius * 2);
    canvasContext.beginPath();
    canvasContext.arc(xoffset + radius, yoffset + radius, radius, 0, 2 * Math.PI, false);
    canvasContext.fillStyle = "green";
    canvasContext.fill();
    //canvasContext.lineWidth = 5;
    //canvasContext.strokeStyle = 'green';//'#000033';
    //canvasContext.stroke();
    console.log("pitch: " + pitch + "yoffset: " + yoffset);

    iCtr++;
    //console.log("pitch=" + pitch);
    /*    // Loop through the samples
        for (var sample = 0; sample < inputBuffer.length; sample++) {
            // make output equal to the same as the input
            outputData[sample] = inputData[sample];
      
            // add noise to each output sample
            outputData[sample] += ((Math.random() * 2) - 1) * 0.2;         
          }
    */
  };
  // Connect the microphone to the script processor
  source.connect(node);
  node.connect(audioContext.destination);
  //The onaudioprocess event gives us access to the Raw PCM data stream from the microphone. We can access the buffered data like so:

  /*node.onaudioprocess = function (data) {
    var leftChannel = data.inputBuffer.getChannelData(0).buffer;
    var rightChannel = data.inputBuffer.getChannelData(1).buffer;
    var s1 = leftChannel[1];
    var s2 = leftChannel[2];
    var s3 = leftChannel[3];
  };*/
}
/* When we're finished recording, we must disconnect from the source and discard the script processor:

node.disconnect();
source.disconnect();
*/
