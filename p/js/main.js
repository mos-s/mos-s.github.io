"use strict";
/*

TODO
 
  note (and wave?)
    draw circle on canvas
  game loop? pitch queue?
  ring buffer

window.Settings.iMaxSampleWl
  In audioworklet allows 128 sample min buff otherwise processor allows minimum of 256 samples.
  The higher the sample rate the lower the latency due to this buffer!
  However our pitch algorithm needs window.Settings.iMaxSampleWl samples to detect lowest note in range (eg recorder).
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

//import * as Settings from "./Settings.js"; // must be first or at least before Sound.js!
//window.settings = Settings.create();
//import * as yin from "./yin.js";
import { yin } from "./sound/pitch/yin.js";
//import { gpgpu } from "./vizitJs/GPGPU.js";
//import * as gpgpu from "./gpgpu.js";
import { SoundObject, computeLatestPitch, getLatestPitch } from "./sound/Sound.js";
import * as Pitch from "./sound/pitch/PitchDisplay.js";

//import { name, draw, reportArea, reportPerimeter } from './modules/square.js';
var yDoTiming = false;
let yDisplayWave = false;
/*navigator.mediaDevices.getUserMedia({ audio: true })
    .then(successCallback)
    .catch(failureCallback);
On success, our successCallback will be called with a MediaStream object which we can use to access the microphone:
*/

let soundObject;
var requestAnimationFrameId = null;
//var DEBUGCANVAS = null;
export var iSampleRate;

if (navigator.mediaDevices) {
  //alert("getUserMedia supported.");
  navigator.mediaDevices
    .getUserMedia({
      audio: {
        echoCancellation: false, // well certainly not if WE are doing echo cancellation at all...
        noiseSuppression: false, // true? typicallly lowpass?
        autoGainControl: false // has no effect on my ipad and iphone
       },
      video: false,
    })
    .then(function (stream) {
      init(stream);
      //doStuff(stream);
    })
    .catch(function (err) {
      alert("The following gUM error occured: " + err);
    });
} else {
  alert("navigator.getUserMedia = " + navigator.getUserMedia);
  alert("getUserMedia not supported on your browser!!");
}

/*function determineFastestMethod() {
  // returns fastest method or null
  const iTimingIts = 1000;
  var pitchMethods = [
    yin,
    //gpgpu,
    //wasm,
  ];
  let minMs = 1111111;
  //var pitchMethodDurationss = [];
  for (var i = 0; i < pitchMethods.length; i++) {
    for (var j = 0; j < iTimingIts; j++) {
      var ms = pitchMethods[i](a32fSin);
      if (ms < minMs) {
        minMs = ms;
        minMsIndex = i;
      }
    }
  }

  return pitchMethods[minMsIndex];
}*/

function init(stream) {
  window.stream = stream;
  if (getRequestParam("timing") == "true") {
    yDoTiming = true;
  }
 // makeButtons();
  window.usefulSettingsAlert();
  soundObject = new SoundObject();
  if (soundObject.setUpSoundProcessor(stream, yin)) {
    makeButtons();
  }
}


/*node.onaudioprocess = function (data) {
    var leftChannel = data.inputBuffer.getChannelData(0).buffer;
    var rightChannel = data.inputBuffer.getChannelData(1).buffer;
    var s1 = leftChannel[1];
    var s2 = leftChannel[2];
    var s3 = leftChannel[3];
  };*/

/* When we're finished recording, we must disconnect from the source and discard the script processor:

node.disconnect();
source.disconnect();
*/

function getRequestParam(name) {
  if ((name = new RegExp("[?&]" + encodeURIComponent(name) + "=([^&]*)").exec(location.search))) return decodeURIComponent(name[1]);
}

function setEltVisible(x, yDisplay, sMode) {
  if (x == null) {
    let fred = 0;
  }
  x.style.display = yDisplay ? sMode || "block" : "none";
}

function makeButtons() {
  /*const playButton = document.getElementById("playButton");
  playButton.addEventListener("click", soundObject.audioButtonHandler);
  //soundObject.audioButtonHandler();
  setEltVisible(playButton, false);
*/
  const waveOnOffButton = document.getElementById("waveOnOffButton");
  setEltVisible(waveOnOffButton, true, "inline"); //setEltVisible(waveOnOffButton, window.Settings.ySharedMemory, "inline");
  //if (window.Settings.ySharedMemory) {
    function waveOnOffButtonHandler() {
      yDisplayWave = !yDisplayWave;
      //alert("Boo!");
      //setEltVisible(document.getElementById("waveform"), yDisplayWave);
    }
    waveOnOffButton.addEventListener("click", waveOnOffButtonHandler);
  //}
}

let delayPitchComputeToJustBeforeNextRenderMs = 0;
var displayPitchMsTime = 0;
window.computedAndSavedPitchMsTime = 0;
function displayPitch(timestamp) {
  if (soundObject != null) {
    displayPitchMsTime = performance.now();
    Pitch.displayPitch(getLatestPitch());
    if (yDisplayWave) {
      Pitch.displayWave();
    }
    let earlyMs = displayPitchMsTime - window.computedAndSavedPitchMsTime;
    if (earlyMs < 16.66 + 2.0) {
      delayPitchComputeToJustBeforeNextRenderMs += earlyMs - 1.0;
    }
    //delayPitchComputeToJustBeforeNextRenderMs = 0; // during dev
    //setTimeout(computeLatestPitch, delayPitchComputeToJustBeforeNextRenderMs); //try and delay conversion until last moment before next frame!
    computeLatestPitch();
    //console.log("\nearlyMs = " + earlyMs);
    //console.log("\ndelayPitchComputeToJustBeforeNextRenderMs = " + delayPitchComputeToJustBeforeNextRenderMs);
  }
  requestAnimationFrame(displayPitch);
}
window.yReadyForNextPitch = true;
requestAnimationFrame(displayPitch);

//function onPitchDeduced(pitchParam) {
/*
function displayPitch(timestamp) {
  if (canvasContext) {
    let pitch = soundObject.deduceLatestPitch();
    canvasContext.clearRect(0, yoffset, 100, 100);
    var xoffset = 5;
    yoffset = 600 - pitch / 2;
    var radius = 40;
    //canvasContext.clearRect(xoffset, yoffset, radius* 2, radius * 2);
    canvasContext.beginPath();
    canvasContext.arc(xoffset + radius, yoffset + radius, radius, 0, 2 * Math.PI, false);
    canvasContext.fillStyle = "green";
    canvasContext.fill();
    //canvasContext.lineWidth = 5;
    //canvasContext.strokeStyle = 'green';//'#000033';
    //canvasContext.stroke();
    //console.log("pitch: " + pitch + "\nyoffset: " + yoffset);
  }
  requestAnimationFrame(displayPitch);
}

function computePitch(timestamp) {
  if (soundObject) {
    let pitch = soundObject.deduceLatestPitch();
    //console.log("pitch: " + pitch + "\nyoffset: " + yoffset);
  }
  //console.log("timestamp = " + timestamp); // about 16ms interval.
  //requestAnimationFrame(computePitch);
  //setInterval(computePitch, 1000);
}
*/
//requestAnimationFrame(computePitch);
//setInterval(computePitch, 1000);

/*// time yin
let this_samplesBuffer = new Float32Array(10 * 512);
let window.Settings.iMaxSampleWl = 256;
let iMaxSampleWlStart = 0;
var startNsTime = performance.now();
var iIts = 1000;
let this_pitch;
for (var i = 0; i < iIts; i++) {
  this_pitch = yin(this_samplesBuffer, window.Settings.iMaxSampleWl, iMaxSampleWlStart);
  //console.log("\nthis_pitch = " + i);
}
var ellapsedItsMs = performance.now() - startNsTime;
console.log("\nthis_pitch = " + this_pitch);
console.log("\nellapsedItsMs = " + ellapsedItsMs);
//alert("ellapsedItsMs = " + ellapsedItsMs); // this does not pop up and causes 'yInside' break in other branch!
*/
