"use strict";
//import { yin } from "../pitch/yin.js";
import { yin } from "./pitch/yin.js";
import * as gpgpu from "../gpgpu.js";
import * as ShaderProgram from "../vizitJs/ShaderProgram.js";
//import * as SamplesBuffer from "./SamplesBuffer.js";
//import { SamplesBuffer } from "./SamplesBuffer.js";
import * as Pitch from "./pitch/Pitch.js"

//import * as Settings from "./Settings.js"; // must be first or at least before Sound.js!
//import {ySharedMemory, yAudioWorklet, iSamplesInBlock, maxSampleWl, yWriteToFloatTexture, iPitchMethod} from "./Settings.js"; // must be first or at least before Sound.js!
import {Settings} from "./Settings.js"; // must be first or at least before Sound.js! ??
//window.settings = Settings.create();
import * as SamplesBuffer from "./SamplesBuffer.js";
window.samplesBuffer = SamplesBuffer.create();

//export let SamplesBufferz = SamplesBuffer;

const yDoTiming = true;
let yInsideRtn = false;

//export const window.maxSampleWl = 512; //600 - should b f(samplerate)
//export const iSamplesInBlock = 512; //128; //512; //256; //128;
let this_samplesBuffer;
let ringBuffer;
//let sab; // My shared buffer array (if implemented)!
let this_iSamples;
let iCtr2 = 0;
//const iSamplesInBuffer = iSamplesInBlock * iBlocksInBuffer;
export const SAMPLE_BLOCKS = 16; //const iBlocksInBuffer = 1;
export let source;
let yOscillatorOn = false;
export let pitchSamplesBuffer; // Filled from either shared array buffer or slice returned from soundWorker!

var audioContext = null;
var soundProcessorNode;
var soundWorker, pitchWorker;
var canvasContext;
var iCtr = 0;
var mediaStreamSource = null;
let oscillator;
let free;
let yEnoughData;

let inputTex;
let waveBuffer;

//class SoundObject extends AudioWorkletProcessor {
export class SoundObject extends Object {
  /**
   * @constructor
   */
  constructor() {
    super();
    this.pitch = 321;
    this.yInside = false;
  }

  setCanvasContext(context) {
    canvasContext = context;
  }

  /*
  processWaveInToDate(e) {
    if (this.yInside) {
      fred = 0;
    } else {
      this.inside = true;
      let inputs = new Float32Array(e.inputBuffer.getChannelData(0));
      if (this_samplesBuffer == undefined) {
        this_iSamples = iSamplesInBlock * SAMPLE_BLOCKS;
        this.iBlocksContainingTwoMaxWaves = Math.ceil((window.maxSampleWl * 2) / iSamplesInBlock);
        //if (this.iBlocksContainingMaxSampleWl > SAMPLE_BLOCKS) {
        // window.alert("iBlocksContainingMaxSampleWl > SAMPLE_BLOCKS not allowed!");
        // }
        this.iActualBufferLength = this_iSamples + iSamplesInBlock * this.iBlocksContainingTwoMaxWaves;
        this_samplesBuffer = new Float32Array(this.iActualBufferLength);
        this.iBlock = 0;
        this.toProcess = 0;
        free = 0;
        this.free2 = 0;
        yEnoughData = false;
      }
      //this_samplesBuffer.subarray(this.free, (this.free + 128)).set(inputs[0][0]);
      //this_samplesBuffer.set(inputs[0][0], this.free); // might this be faster with uint8?
      this_samplesBuffer.set(inputs, free); // might this be faster with uint8?

      // Copy also to other end of ring buffer is appropriate
      //if (this.free2 >= this_iSamples && this.free2 <= this.iActualBufferLength) {
      if (this.free2 >= this_iSamples && this.free2 < this.iActualBufferLength) {
        //this_samplesBuffer.set(inputs[0][0], this.free2); // might this be faster with uint8?
        this_samplesBuffer.set(inputs, this.free2); // might this be faster with uint8?
        this.free2 += iSamplesInBlock;
      } else {
        // this_samplesBuffer.set(inputs, this.free); // balance timing for testing (ie just repeat first copy above!)
      }

      free += iSamplesInBlock;
      if (free >= this_iSamples) {
        this.free2 = free;
        free = 0;
      }

      // copy to tex
      let iMaxWlStart = free - window.maxSampleWl * 2;
      if (iMaxWlStart < 0) {
        iMaxWlStart += this_iSamples;
      } else {
        yEnoughData = true;
      }
      //  this_pitch = yin(this_samplesBuffer, window.maxSampleWl, iMaxWlStart);
      if (yEnoughData) {
        //if (inputTex == null) {
        //inputTex = gpgpu.computeInputTexFromFloatSamples(this_samplesBuffer, iMaxWlStart);
        //       inputTex = gpgpu.computeInputTexFromFloatSamples_RGBA(this_samplesBuffer, iMaxWlStart);
        //console.log("ZZ=" + this_samplesBuffer[iMaxWlStart]);
        //}
        //gpgpu.getDotProducts(); // ie readpixels = should not be any wait (unless nore than samplesblock interval) for computation to finish
        function doStuff() {
          inputTex = gpgpu.computeInputTexFromFloatSamples_RGBA(this_samplesBuffer, iMaxWlStart);

          gpgpu.getDotProductsRGBA(); // ie readpixels = should not be any wait (unless nore than samplesblock interval) for computation to finish

          gpgpu.execShader2(inputTex); // just calls Shader.run!

          let pitch = gpgpu.yin2();
          console.log("\npitch = " + pitch);
        }
        var yDoTiming = true;
        if (yDoTiming) {
          var startNsTime = performance.now();
          var iIts = 1000;
          for (var i = 0; i < iIts; i++) {
            doStuff();
          }
          var ellapsedItsMs = performance.now() - startNsTime;
          alert("ellapsedItsMs = " + ellapsedItsMs);
        } else {
          doStuff();
        }
      }
      this.inside = false;
    }
  }

  deduceLatestPitch() {
    if (free) {
      let iMaxWlStart = free - window.maxSampleWl * 2;
      if (iMaxWlStart < 0) {
        iMaxWlStart += this_iSamples;
      }

      if (iMaxWlStart >= 0) {
        //check if called in here again!!??
        // if (iCtr2 & 1) {
        this.pitch = yin(this_samplesBuffer, window.maxSampleWl, iMaxWlStart);
        console.log("pitch = " + this.pitch);
        console.log("\niMaxWlStart = " + iMaxWlStart);
        return this.pitch;
        //} else {
        //  var fred = 0;
        //}
      }
    }
  }
*/
  async setUpSoundProcessor(callback) {
    //mediaStream, pitchMethod_) {
    // ie audioWorklet or scriptProcessor?
    Pitch.init();
  
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    //setCapabilities();
    SamplesBuffer.init(1024 * 3);

    //Set up soundWorker and pitchWorker from main thread. Also set up message channel BETWEEN them! Also beween audioWorker and soundWorker (possible?)
    //Audio from mic into ring buffer:
    if (window.yAudioWorklet) {
      try {
        await audioContext.audioWorklet.addModule("js/sound/mos-audio-worklet-processor.js");
        soundProcessorNode = new window.AudioWorkletNode(audioContext, "mos-audio-worklet-processor");
        pitchWorker = new Worker("js/sound/pitch/pitchWorker.js", { type: "module" });
        pitchWorker.postMessage({ command: "sab", value: window.sab });
        let thiz = this;
        /*pitchWorker.onmessage = function (e) {
          thiz.pitch = e.data;
          console.log("pitch = " + thiz.pitch); // + "\n");
        };*/

        //soundProcessorNode.port.postMessage({ command: "sab", value: window.sab });
        soundProcessorNode.postMessage({cmd: "Settings", val: Settings});
        soundProcessorNode.postMessage({cmd: "SamplesBuffer", val: window.samplesBuffer});

      } catch (e) {
        alert("Problem inside js/sound/mos-audio-worklet-processor.js !");
      }
    } else {
      // no audio worker
      soundProcessorNode = audioContext.createScriptProcessor(window.iSamplesInBlock, 2, 2);
      // let soundProcessorNode2 = audioContext.createScriptProcessor(4 * 1024, 2, 2);
      if (window.ySharedMemory) {
      } else {
        soundWorker = new Worker("js/sound/soundWorker.js", { type: "module" });
        //soundWorker = new Worker("js/sound/pitch/pitchWorker.js", { type: "module" });
        soundWorker.onmessage = function (e) {
          pitchSamplesBuffer = e.data; // this should/could be a transfer!?
          //soundWorker.stop();
        };
        soundWorker.postMessage({cmd: "Settings", val: Settings});
        soundWorker.postMessage({cmd: "SamplesBuffer", val: window.samplesBuffer});

      }
      this.setUpScriptProcessor(); //mediaStream, pitchMethod_);

      //pitchWorker = new Worker("js/sound/pitch/pitchWorker.js", { type: "module" });
      //pitchWorker.postMessage({ command: "sab", value: window.sab });
    }
  }
  /*
    try {
      audioContext = new AudioContext();
      await audioContext.resume();
      await audioContext.audioWorklet.addModule("module-url/module.js");
    } catch(e) {
      return null;
      */
  /*  if (ySharedMemory) {
        //audioworker (in own thread) writes samples into ring buffer (shared memory).
      } else {
        //audioworker (in own thread) posts sampleBlock to soundWorker (a simple webworker) which writes into ring buffer
      }
    } else {
      //(eg IOS)
      //scriptProcessor (in main thread - no choice) posts sampleBlock to soundWorker (a simple webworker) which writes into ring buffer (not shared!!)
    }*/
  /*Pitch request:
    Try to compute pitch as late as poss so that ready just before render (ie requestAnimation)!
    if ySharedMemory then
      Main thread requests (postMessage) pitch from pitchWorker from requestAnimation. pitchWorker schedules when to do computation so that will be ready just before following render!
    else
      Main thread requests (postMessage) pitch from pitchWorker from requestAnimation. pitchWorker schedules when to do computation so that will be ready just before following render!
  Pitch deduction:
    if ySharedMemory then pitchWorker gets latest samples from shared ring buffer, deduce pitch and writes to shared memory
    else pitchWorker requests latest samples from soundWorker with postMessage. When received (ie onMessage) deduce pitch and post to main thread.

First attempt can assume audioWorker but no shared memory! then will work also for ios already.
*/
  // }
/*
  async setUpSoundProcessorOld(mediaStream, pitchMethod_) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // Create a source from our MediaStream

    window.iSampleRate = audioContext.sampleRate;
    const yIos = false; //true;
    if (yIos) {
      soundProcessorNode = audioContext.createScriptProcessor(iSamplesInBlock, 2, 2);
      this.setUpScriptProcessor(mediaStream, pitchMethod_);
    } else {
      //await audioContext.audioWorklet.addModule("recorder-worklet-processor.js");//.then(() => {
      //await audioContext.audioWorklet.addModule('js/sound/recorder-worklet-processor.js');
      await audioContext.audioWorklet.addModule("js/sound/mos-audio-worklet-processor.js"); //.then(() => {
      // your code here
      soundProcessorNode = new window.AudioWorkletNode(audioContext, "mos-audio-worklet-processor");
      if (typeof AudioWorkletNode !== "undefined") {
        //soundProcessorNode.onmessage = function (e) {
        //  //SoundObject.prototype.setWaveBuffer(e.data)
        //  //sab = e.data.sab;
        //};
        //var sab = new SharedArrayBuffer(1024);
        //SamplesBuffer.init(1024 * 3);
        //worker.postMessage(sab);
        //postMessage;
      }

      //  this.setUpAudioWorkletProcessor(mediaStream, pitchMethod_)
      //});
    }
  }
*/
  setUpAudioWorkletProcessor(mediaStream, pitchMethod_) {
    var fred = 0;
  }

  setUpScriptProcessor() {
    //mediaStream, pitchMethod_) {
    // Can be either
    let thiz = this; // for use within onaudioprocess
    let prevCurrentTime = 0;
    let newCurrentTime;
    let prevPlaybackTime = 0;
    let newPlaybackTime;
    let prevTimeStamp = 0;
    let newTimeStamp;
    const yUseWorker = true;
    if (yUseWorker) {
      soundProcessorNode.onaudioprocess = function (e) {
        if (soundWorker != null) {
          //let i = e.inputBuffer.getChannelData(0)
          //soundWorker.postMessage(i); // For now for simplicity we post to worker even if sound received by audioWorker rather than script processor
          soundWorker.postMessage({cmd: "Samples", val: e.inputBuffer.getChannelData(0)});
          
          
          // if (e.inputBuffer.duration != 0.010666666666666666) {
          //   let fred = 0;
          // }
          const yLogSampleBlockTimes = false;
          if (yLogSampleBlockTimes) {
            newCurrentTime = e.currentTarget.context.currentTime;
            console.log("DcurrentTime: " + (newCurrentTime - prevCurrentTime));
            prevCurrentTime = newCurrentTime;

            newPlaybackTime = e.playbackTime;
            console.log("DPlaybackTime: " + (newPlaybackTime - prevPlaybackTime));
            prevPlaybackTime = newPlaybackTime;

            console.log("playBackTime - currentTime: " + (newPlaybackTime - newCurrentTime));

            newTimeStamp = e.timeStamp;
            console.log("DtimeStamp: " + (newTimeStamp - prevTimeStamp));
            prevTimeStamp = newTimeStamp;
          }
        }
      };
    } else {
      soundProcessorNode.onaudioprocess = this.processWaveInToDate;
    }

    // scriptNode.onaudioprocess = function (e) {
    /*
      var inputBuffer = e.inputBuffer;
      // The output buffer contains the samples that will be modified and played
      var outputBuffer = e.outputBuffer;

      for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        var input = inputBuffer.getChannelData(channel);
        //if (input[0] != 0.0) {
        //  var fred = 0;
        //}
        var output = outputBuffer.getChannelData(channel);
        const yUseSet = false;
        if (yUseSet) {
          output.set(input, 0); // runs! might end up as dma memcpy!
        } else {
          for (var i = 0; i < output.length; i++) {
            //output[i] = Math.random();
            output[i] = input[i]; // this loop might be compiled to use SIMD! (dma faster!?)
          }
        }
      }
*/

    //thiz.processWaveInToDate(leftChannel);
    /*
      if (this.yInside) {
        fred = 0;
      } else {
        this.inside = true;
        var inputs = e.inputBuffer.getChannelData(0); //.buffer; //.buffer;??
        if (this_samplesBuffer == undefined) {
          this_iSamples = iSamplesInBlock * SAMPLE_BLOCKS;
          this.iBlocksContainingTwoMaxWaves = Math.ceil((window.maxSampleWl * 2) / iSamplesInBlock);
          //if (this.iBlocksContainingMaxSampleWl > SAMPLE_BLOCKS) {
          // window.alert("iBlocksContainingMaxSampleWl > SAMPLE_BLOCKS not allowed!");
          // }
          this.iActualBufferLength = this_iSamples + iSamplesInBlock * this.iBlocksContainingTwoMaxWaves;
          this_samplesBuffer = new Float32Array(this.iActualBufferLength);
          this.iBlock = 0;
          this.toProcess = 0;
          this.free = 0;
          this.free2 = 0;
        }
        //this_samplesBuffer.subarray(this.free, (this.free + 128)).set(inputs[0][0]);
        //this_samplesBuffer.set(inputs[0][0], this.free); // might this be faster with uint8?
        this_samplesBuffer.set(inputs, this.free); // might this be faster with uint8?

        // Copy also to other end of ring buffer is appropriate
        //if (this.free2 >= this_iSamples && this.free2 <= this.iActualBufferLength) {
        if (this.free2 >= this_iSamples && this.free2 < this.iActualBufferLength) {
          //this_samplesBuffer.set(inputs[0][0], this.free2); // might this be faster with uint8?
          this_samplesBuffer.set(inputs, this.free2); // might this be faster with uint8?
          this.free2 += iSamplesInBlock;
        } else {
          this_samplesBuffer.set(inputs, this.free); // balance timing for testing (ie just repeat first copy above!)
        }

        this.free += iSamplesInBlock;
        if (this.free >= this_iSamples) {
          this.free2 = this.free;
          this.free = 0;
        }
        this.inside = false;
      }
    };
  } // end of onaudioprocess
*/
  }
  computeSineWaveF32(iSamples, fAmplitude) {
    var radius = 0.5;
    var iWaves = 4;
    var eltLen = 4;
    var iWidth = iTexWidth * 2;
    var fData = new Float32Array(iWidth * eltLen);
    var theta = 0;
    var thetaStep = (Math.PI * iWaves) / iWidth;
    var iElt = 0;
    for (var w = 0; w < iWidth; w++) {
      fData[iElt] = Math.sin(theta) * radius;
      iElt += eltLen;
      theta += thetaStep;
    }
    return gpgpUtility.makeSizedTexture(iWidth, 1, WebGLRenderingContext.FLOAT, fData);
  }

  audioButtonHandler() {
    // check if context is in suspended state (autoplay policy)
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    if (yOscillatorOn) {
      yOscillatorOn = false;
      ///iosdevoscillator.stop();
    } else {
      let yOscillator = false; //true;

      if (yOscillator) {
        oscillator = new OscillatorNode(audioContext);
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(666, audioContext.currentTime); // value in hertz
        source = oscillator;
        oscillator.start();
      } else {
        source = audioContext.createMediaStreamSource(window.stream); // ie mic (don't need to start)
      }
      yOscillatorOn = true;
      source.connect(soundProcessorNode);
      soundProcessorNode.connect(audioContext.destination);
    }

    function movedivOld(timestamp) {
      if (inputTex != null) {
        //let inputTex = gpgpu.computeInputTexFromFloatSamples_RGBA_Worker(waveBuffer);
        gpgpu.execShader2(inputTex); // just calls Shader.run!
        gpgpu.getDotProductsRGBA(); // ie readpixels = should not be any wait (unless nore than samplesblock interval) for computation to finish

        let pitch = gpgpu.yin2fromC();
        console.log("\npitch = " + pitch);
      }
      requestAnimationFrame(movediv); // call requestAnimationFrame again to animate next frame
    }
    ///  requestAnimationFrame(movediv); // call requestAnimationFrame and pass into it animation function

    function movediv(timestamp) {
      pitchWorker.postMessage({ command: "p" });
      requestAnimationFrame(movediv); // call requestAnimationFrame again to animate next frame
    }
    //requestAnimationFrame(movediv); // call requestAnimationFrame and pass into it animation function
  }

  setWaveBuffer(waveBufferParam) {
    //waveBuffer = new Float32Array(waveBufferParam);
    inputTex = gpgpu.computeInputTexFromFloatSamples_RGBA_Worker(waveBufferParam);
  }
} // end of class
var prevNsTime = 0;
export function computeLatestPitch() {
  // if and when webgl is accessible from webworker(maybe already in (firefox) we could do all of this inside pitchWorker - also see - https://gpuweb.github.io/gpuweb/
  // Whole of pitch deduction here takes about 4 or 5ms on lenovo.
  //var startNsTime = performance.now();
  let samplesBuffer;
  if (window.ySharedMemory) {
    samplesBuffer = SamplesBuffer.f32SamplesBuffer;
    let free = samplesBuffer[SamplesBuffer.freeInd];
    let iMaxWlStart = free - window.maxSampleWl * 2;
    if (iMaxWlStart < 0) {
      iMaxWlStart += SamplesBuffer.iSamples;
    }
    pitchSamplesBuffer = new Float32Array(samplesBuffer.buffer, iMaxWlStart * 4, window.maxSampleWl * 2); // start index is in bytes but not length
  } else {
    samplesBuffer = SamplesBuffer.f32SamplesBuffer;
  }
  if (pitchSamplesBuffer != null) {
    let pitch = Pitch.computeMethod(pitchSamplesBuffer);
    SamplesBuffer.f32SamplesBuffer[SamplesBuffer.pitchInd] = pitch; // maybe should be in caller?
  }

  if (pitchWorker) {
    //  pitchWorker.postMessage({ command: "p" });
  }
}

export function getLatestPitch() {
  if (SamplesBuffer.f32SamplesBuffer != null) {
    return SamplesBuffer.f32SamplesBuffer[SamplesBuffer.pitchInd];
  }
}
