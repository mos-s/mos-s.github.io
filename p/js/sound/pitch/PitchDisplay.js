"use strict";
//import * as THREE from './resources/threejs/r125/build/three.module.js';
import * as THREE from "https://unpkg.com/three/build/three.module.js";

import { pitchSamplesBuffer } from "../Sound.js";

let iDisplayWidth, iDisplayHeight;
let pitchDiskRadius = 20;
let iOctaves = 7;
let renderer, stage, graphics, wave;

//const canvas = document.querySelector("#c");
//const renderer = new THREE.WebGLRenderer({ canvas });

const y3dGraphics = false;
let pitchDisk;
var detectorElem, canvasElem, canvasContext, waveCanvas, pitchElem, noteElem, detuneElem, detuneAmount;
var DEBUGCANVAS;
var yoffset = 0;

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = window.webkitRequestAnimationFrame;
}

function initTwoJS() {
  var two = new Two({
    fullscreen: true,
    autostart: true
  }).appendTo(document.body);
  //var rect = two.makeRectangle(two.width / 2, two.height / 2, 50 ,50);
  var color = 'rgba(255, 128, 0, 0.66)';
  //rect.fill = color;
  //rect.noStroke();

  //var radius = 44;//two.height / 4;
  pitchDisk = two.makeCircle(two.width / 3, two.height / 2, pitchDiskRadius);
  pitchDisk.fill = color;
  pitchDisk.noStroke();
  pitchDisk.translation.x = 10;
  two.bind('update', function() {
    //rect.rotation += 0.01;
    //pitchDisk.translation.x += 5;
    //if (core.translation.x > two.width) {pitchDisk.translation.x = 0;}
  });

}
function display2dTwoJS(pitch) {
  let frequency = pitch; // 261.63;//pitch;
  const middleCfreq = 261.63;
  let midiNote = frequencyToMidiNoteNumber(frequency);
  let posInOctave = (midiNote + 0.5) % 12;
  let iOctave = Math.floor((midiNote + 0.5) / 12);
  //console.log("P = " + pitch);
  posInOctave = posInOctave; //frequencyToMidiNoteNumber(frequency);//12 * (Math.log( frequency / 440 )/Math.log(2) ); // relative to middle A?

  pitchDisk.translation.y = iDisplayHeight - (posInOctave / 12) * iDisplayHeight;
  pitchDisk.translation.x = ((iOctave - 2) / iOctaves) * iDisplayWidth;

}

function initPixiJS() {
    // Autodetect, create and append the renderer to the body element
  //var renderer = PIXI.autoDetectRenderer(120, 364, { backgroundColor: #0000FF, antialias: true });
  renderer = PIXI.autoDetectRenderer({ width: iDisplayWidth, height: iDisplayHeight, backgroundColor: 0x00ffdd, antialias: true });
  //renderer = PIXI.
  //var renderer = PIXI.autoDetectRenderer({backgroundColor : 0x1099bb, antialias: true}); // default 800 x 600?
  //window.innerWidth, window.innerHeight
  document.body.appendChild(renderer.view);

  // Create the main stage for your display objects
  stage = new PIXI.Container();
  //var stage = new PIXI.Container();
  //stage.scale.set(1.0, 1.0);

  // Initialize the pixi Graphics class
  graphics = new PIXI.Graphics();

  // Set the fill color
  graphics.beginFill(0x0000ff); //0xe74c3c); // Red

  // Draw a circle
  pitchDisk = graphics.drawCircle(0, 0, pitchDiskRadius); // drawCircle(x, y, radius)

  // Applies fill to lines and shapes since the last call to beginFill.
  graphics.endFill();

  stage.addChild(graphics);

  wave = new PIXI.Graphics();

  animate();
  function animate() {
    /*pitchDisk.x += 4;
    if (pitchDisk.x > 720) {
      pitchDisk.x = 0;
    }*/
    
    //wave.clear();
    //Render the stage
    renderer.render(stage);
    requestAnimationFrame(animate);
  }
}

function init3JS() {
  // const canvas = document.querySelector('#c');
  //  const renderer = new THREE.WebGLRenderer({canvas});

  var width = window.innerWidth;
  var height = window.innerHeight;
  var viewAngle = 45;
  var nearClipping = 0.1;
  var farClipping = 9999;
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(viewAngle, width / height, nearClipping, farClipping);
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  var sphereGeometry = new THREE.SphereGeometry(0.5, 8, 8);
  var sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });
  var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.z = -15;
  sphere.position.x = -9.5;
  sphere.position.y = -2;

  scene.add(sphere);

  var light = new THREE.PointLight(0xffffff);
  light.position.x = 0;
  light.position.y = 10;
  light.position.z = 0;
  scene.add(light);
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}

function init2dGraphics() {
  //kickoff? requestAnimationFrameId = window.requestAnimationFrame( updatePitch ); //??
  canvasElem = document.getElementById("outputCanvas");
  canvasContext = canvasElem.getContext("2d");
  canvasContext.strokeStyle = "black";
  canvasContext.lineWidth = 1;
  //soundObject.setCanvasContext(canvasContext);
  //soundObject.onPitchDeduced = onPitchDeduced;
  DEBUGCANVAS = document.getElementById("waveform");
  if (DEBUGCANVAS) {
    waveCanvas = DEBUGCANVAS.getContext("2d");
    waveCanvas.strokeStyle = "black";
    waveCanvas.lineWidth = 1;
  }
  //waveCanvas = canvasContext;
}

function init3dGraphics() {
  var canvas = document.getElementById("renderCanvas");
  var engine = new BABYLON.Engine(canvas, true);
  /*function createScene(): Scene {
    var scene: Scene = new Scene(engine);
    var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
    var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
    return scene;
}*/
  function createScene() {
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, BABYLON.Vector3.Zero(), scene);
    //camera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;
    //camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    //var camera = new BABYLON.Camera("Camera", Math.PI / 2, Math.PI / 2, 2, BABYLON.Vector3.Zero(), scene);
    //camera.attachControl(canvas, true);
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 0.1 }, scene);
    //    addLabelToMesh(sphere);
    sphere.position.x = 0.5;
    sphere.position.y = 0.5;
    sphere.position.z = 0;
    return scene;
  }

  var scene = createScene();
  engine.runRenderLoop(() => {
    scene.render();
  });
}

function initGraphics() {
  iDisplayWidth = Math.min(window.innerWidth, 200);
  iDisplayHeight = window.innerHeight - 100;

  if (y3dGraphics) {
    init3JS(); //init3dGraphics();
  } else {
    //initPixiJS(); //init2dGraphics();
    //displayPitch2d(13.5); //dev
    initTwoJS();
    //display2dTwoJS(440);
  }
}
initGraphics();

export function displayPitch(pitch) {
  if (y3dGraphics) {
    displayPitch3d(pitch);
  } else {
    //displayPitch2dCanvas(pitch);
    //displayPitch2dPixi(pitch);
    display2dTwoJS(pitch);
  }
}
export function displayPitch3d(pitch) {}

//function pitchToY(pitch) {
//}

export function displayPitch2dPixi(pitch) {
  //pitch = 13.5;
  let maxPitch = 1000;
  let frequency = pitch; // 261.63;//pitch;
  const middleCfreq = 261.63;
  let midiNote = frequencyToMidiNoteNumber(frequency);
  let posInOctave = (midiNote + 0.5) % 12;
  let iOctave = Math.floor((midiNote + 0.5) / 12);
  //console.log("P = " + pitch);
  posInOctave = posInOctave; //frequencyToMidiNoteNumber(frequency);//12 * (Math.log( frequency / 440 )/Math.log(2) ); // relative to middle A?

  pitchDisk.y = iDisplayHeight - (posInOctave / 12) * iDisplayHeight;
  pitchDisk.x = ((iOctave - 2) / iOctaves) * iDisplayWidth;

  graphics.clear();
  graphics.beginFill(0x0000ff); //0xe74c3c); // Red
  pitchDisk = graphics.drawCircle(0, 0, pitchDiskRadius); // drawCircle(x, y, radius)
  graphics.endFill();

}

function frequencyToMidiNoteNumber(frequency) {
  //return 69 + 12 * Math.log2(frequency / 440);
  return 60 + 12 * Math.log2(frequency / 261.6); //440); .. ie middle c
  //return Math.round(69 + 12 * Math.log2(frequency / 440));
  //return 12 * Math.log2(frequency / 440);
}
var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function noteFromPitch(frequency) {
  var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  //return Math.round( noteNum ) + 69;
  return noteNum + 69;
}

function frequencyFromNoteNumber(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function centsOffFromPitch(frequency, note) {
  return Math.floor((1200 * Math.log(frequency / frequencyFromNoteNumber(note))) / Math.log(2));
}

export function displayPitch2dCanvas(pitch) {
  if (pitch > 0) {
    var fred = 0;
  }
  if (canvasContext) {
    //let pitch = soundObject.deduceLatestPitch();
    canvasContext.clearRect(0, yoffset, 40, 40);
    /*var xoffset = 5;
    yoffset = 600 - pitch / 2;
    var radius = 20;
    */
    var xoffset = 0;

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
}

/*
export function displayWaveOld() {
  //var cycles = new Array;

  //analyser.getFloatTimeDomainData( buf ); // this sometimes causes: Uncaught TypeError: Cannot read property 'getFloatTimeDomainData' of null
  //var ac = autoCorrelate( buf, audioContext.sampleRate );
  // TODO: Paint confidence meter on canvasElem here.

  var samplesBuffer, freeInd;
  // We assume here that window.iMaxSampleWl * 2 is at least width of wave display
  if (window.Settings.ySharedMemory) {
    samplesBuffer = window.samplesBuffer.f32SamplesBuffer;
    freeInd = samplesBuffer[window.samplesBuffer.freeInd];
  } else {
    if (pitchSamplesBuffer == null) {
      return;
    } else {
      samplesBuffer = pitchSamplesBuffer;
      freeInd = window.iMaxSampleWl * 2;
    }
  }
  var ind = freeInd - 1;

  if (ind >= 0) {
    //dev
    if (waveCanvas) {
      // This draws the current waveform, useful for debugging
      waveCanvas.clearRect(0, 0, 512, 256);
      waveCanvas.strokeStyle = "red";
      waveCanvas.beginPath();
      waveCanvas.moveTo(0, 0);
      waveCanvas.lineTo(0, 256);
      waveCanvas.moveTo(128, 0);
      waveCanvas.lineTo(128, 256);
      waveCanvas.moveTo(256, 0);
      waveCanvas.lineTo(256, 256);
      waveCanvas.moveTo(384, 0);
      waveCanvas.lineTo(384, 256);
      waveCanvas.moveTo(512, 0);
      waveCanvas.lineTo(512, 256);
      waveCanvas.stroke();
      waveCanvas.strokeStyle = "black";
      waveCanvas.beginPath();
      //waveCanvas.moveTo(0,buf[0]);

      // ----- sync on trough ---
      // Find next pos-going zero cross
      var i = 0;
      var j = 0;
      var prevSampleVal;
      let sampleVal = samplesBuffer[ind];
      if (samplesBuffer[ind - 1] > samplesBuffer[ind]) {
        //rising wave (in reverse dir!)
        ind--;
        // find end of pos going
        prevSampleVal = -1.5; // >1
        for (i = 0; i < 512; i++) {
          sampleVal = samplesBuffer[ind];
          if (sampleVal < prevSampleVal) {
            break;
          }
          prevSampleVal = sampleVal;
          ind--;
        }
      }
      // we are now neg going so look for pos going.
      prevSampleVal = 1.5;
      for (var j = 0; j < 512 - i; j++) {
        sampleVal = samplesBuffer[ind];
        if (sampleVal > prevSampleVal) {
          break;
        }
        prevSampleVal = sampleVal;
        ind--;
      }

      for (i = 0; i < 512; i++) {
        //waveCanvas.lineTo(i,128+(buf[i]*128));
        sampleVal = samplesBuffer[ind];
        waveCanvas.lineTo(i, 128 + sampleVal * 128);
        ind--; // display backwards!
      }
      waveCanvas.stroke();
    }
  }

  if (ac == -1) {
 		detectorElem.className = "vague";
	 	pitchElem.innerText = "--";
		noteElem.innerText = "-";
		detuneElem.className = "";
		detuneAmount.innerText = "--";
 	} else {
	 	detectorElem.className = "confident";
	 	pitch = ac;
	 	pitchElem.innerText = Math.round( pitch ) ;
	 	var note =  noteFromPitch( pitch );
		noteElem.innerHTML = noteStrings[note%12];
		var detune = centsOffFromPitch( pitch, note );
		if (detune == 0 ) {
			detuneElem.className = "";
			detuneAmount.innerHTML = "--";
		} else {
			if (detune < 0)
				detuneElem.className = "flat";
			else
				detuneElem.className = "sharp";
			detuneAmount.innerHTML = Math.abs( detune );
		}
    }
    
}*/

export function displayWave() {
  
  wave.clear();
  wave.lineStyle(2, 0xd5402b, 1);

 
  var samplesBuffer, freeInd;
  // We assume here that window.iMaxSampleWl * 2 is at least width of wave display
  if (window.Settings.ySharedMemory) {
    samplesBuffer = window.samplesBuffer.f32SamplesBuffer;
    freeInd = samplesBuffer[window.samplesBuffer.freeInd];
  } else {
    if (pitchSamplesBuffer == null) {
      return;
    } else {
      samplesBuffer = pitchSamplesBuffer;
      freeInd = window.iMaxSampleWl * 2;
    }
  }
  var ind = freeInd - 1;

  if (ind >= 0) {
    //dev
    if (wave) {
      // This draws the current waveform, useful for debugging
      //line.clearRect(0, 0, 512, 256);
      //line.strokeStyle = "red";
      //line.beginPath();
      /*
      wave.moveTo(0, 0);
      wave.lineTo(0, 256);
      wave.moveTo(128, 0);
      wave.lineTo(128, 256);
      wave.moveTo(256, 0);
      wave.lineTo(256, 256);
      wave.moveTo(384, 0);
      wave.lineTo(384, 256);
      wave.moveTo(512, 0);
      wave.lineTo(512, 256);
      //line.stroke();
      //line.strokeStyle = "black";
      //line.beginPath();
      //line.moveTo(0,buf[0]);
*/
      // ----- sync on trough ---
      // Find next pos-going zero cross
      var i = 0;
      var j = 0;
      var prevSampleVal;
      let sampleVal = samplesBuffer[ind];
      if (samplesBuffer[ind - 1] > samplesBuffer[ind]) {
        //rising wave (in reverse dir!)
        ind--;
        // find end of pos going
        prevSampleVal = -1.5; // >1
        for (i = 0; i < 512; i++) {
          sampleVal = samplesBuffer[ind];
          if (sampleVal < prevSampleVal) {
            break;
          }
          prevSampleVal = sampleVal;
          ind--;
        }
      }
      // we are now neg going so look for pos going.
      prevSampleVal = 1.5;
      for (var j = 0; j < 512 - i; j++) {
        sampleVal = samplesBuffer[ind];
        if (sampleVal > prevSampleVal) {
          break;
        }
        prevSampleVal = sampleVal;
        ind--;
      }
      let waveHeight = iDisplayWidth/2;
      let halfWaveHeight = waveHeight/2;
      let verticalMargin = halfWaveHeight/3;
      let midWaveOffset = verticalMargin + halfWaveHeight;
      wave.moveTo(0, midWaveOffset);
      for (i = 0; i < iDisplayWidth; i++) {
        //line.lineTo(i,128+(buf[i]*128));
        sampleVal = samplesBuffer[ind];
        wave.lineTo(i, midWaveOffset + sampleVal * halfWaveHeight);
        ind--; // display backwards!
      }
      stage.addChild(wave);//line.stroke();
    }
  }

  
}

/*
export function displayWaveZ() {
  var line = new PIXI.Graphics();

  // Define line style (think stroke)
  // width, color, alpha
  line.lineStyle(2, 0xd5402b, 1);

  // Define line position - this aligns the top left corner of our canvas
  line.position.x = renderer.width / 2;
  line.position.y = renderer.height / 2;

  // Define pivot to the center of the element (think transformOrigin)
  line.pivot.set(0, 140);
  line.rotation = 0.785398; // in radiants - use google to convert degrees to radiants

  // Draw line
  line.moveTo(5, 0);
  line.lineTo(5, 280);

  stage.addChild(line);
}
*/