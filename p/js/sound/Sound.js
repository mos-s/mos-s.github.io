"use strict";
//import { yin } from "../pitch/yin.js";
import { yin } from "./pitch/yin.js";
import * as gpgpu from "../gpgpu.js";
import * as ShaderProgram from "../vizitJs/ShaderProgram.js";
//import * as SamplesBuffer from "./SamplesBuffer.js";
//import { SamplesBuffer } from "./SamplesBuffer.js";
import * as Pitch from "./pitch/Pitch.js";
let pitchMethod;
//import * as Settings from "./Settings.js"; // must be first or at least before Sound.js!
//import {ySharedMemory, yAudioWorklet, iSamplesInBlock, iMaxSampleWl, yWriteToFloatTexture, iPitchMethod} from "./Settings.js"; // must be first or at least before Sound.js!
import { Settings } from "./Settings.js"; // must be first or at least before Sound.js! ??
window.settings = Settings;
import * as SamplesBuffer from "./SamplesBuffer.js";
window.samplesBuffer = SamplesBuffer.create();

//export let SamplesBufferz = SamplesBuffer;

const yDoTiming = true;
let yInsideRtn = false;

//export const window.iMaxSampleWl = 512; //600 - should b f(samplerate)
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
//var currentSoundProcessor;
//var currentSoundProcessor; // ie audio script processor (when audioWorklet not available)
var soundProcessor; // ie audioWorklet or currentSoundProcessor!
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
        this.iBlocksContainingTwoMaxWaves = Math.ceil((window.iMaxSampleWl * 2) / iSamplesInBlock);
        //if (this.iBlocksContainingiMaxSampleWl > SAMPLE_BLOCKS) {
        // window.alert("iBlocksContainingiMaxSampleWl > SAMPLE_BLOCKS not allowed!");
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
      let iMaxWlStart = free - window.iMaxSampleWl * 2;
      if (iMaxWlStart < 0) {
        iMaxWlStart += this_iSamples;
      } else {
        yEnoughData = true;
      }
      //  this_pitch = yin(this_samplesBuffer, window.iMaxSampleWl, iMaxWlStart);
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
      let iMaxWlStart = free - window.iMaxSampleWl * 2;
      if (iMaxWlStart < 0) {
        iMaxWlStart += this_iSamples;
      }

      if (iMaxWlStart >= 0) {
        //check if called in here again!!??
        // if (iCtr2 & 1) {
        this.pitch = yin(this_samplesBuffer, window.iMaxSampleWl, iMaxWlStart);
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
    // ie AudioWorklet or ScriptProcessor?
    pitchMethod = Pitch.init();

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    //setCapabilities();
    //SamplesBuffer.init(1024 * 3);

    //Set up soundWorker and pitchWorker from main thread. Also set up message channel BETWEEN them! Also beween audioWorker and soundWorker (possible?)
    //Audio from mic into ring buffer:
    let msg = typeof AudioWorkletNode !== "undefined" ? "true" : "false";
    alert("AudioWorkletNode defined = " + msg);
    //let ySecureContext = window.isSecureContext;

    // ============== Set up soundWorker - a dedicated Web Worker ==============
    if (typeof Worker == "undefined") {
      alert("Sorry, your browser does not support Web Workers..."); // Better place for this? We want to abort.
      return false;
    }
  
    soundWorker = new Worker("js/sound/soundWorker.js", { type: "module" });
    soundWorker.postMessage({ cmd: "Settings", val: Settings });
    soundWorker.postMessage({ cmd: "SamplesBuffer", val: window.samplesBuffer });
    let pingAndIncStartNsTime;
    let arrayToPost = new Float32Array(1024 * 1);
    for (var i = 0; i < arrayToPost.length; i++) {
      arrayToPost[i] = i;
    }

    soundWorker.onmessage = function (e) {
      // This is for response to "ComputePitch" cmd.
      switch (e.data.cmd) {
        case "Pitch":
          //if (Settings.iPitchMethod == Settings.PitchMethods.iYinJsWorkerMethod) {
          SamplesBuffer.f32SamplesBuffer[SamplesBuffer.pitchInd] = e.data.val;
          //} else {
          //  pitchSamplesBuffer = e.data.val; // this should/could be a transfer!?
          //}
          break;
        case "PingAndInc":
          let i = e.data.val;
          if (i == 1) {
            pingAndIncStartNsTime = performance.now();
          }
          if (i <= 1001) {
            soundWorker.postMessage({ cmd: "PingAndInc", val: i + 1, array: arrayToPost });
          } else {
            var endNsTime = performance.now();
            var ellapsedItsMs = endNsTime - pingAndIncStartNsTime;
            console.log("\nPingAndInc ellapsedItsMs for " + arrayToPost.length + " float array = " + ellapsedItsMs);
            // On lenovo a basic post took around 0.5ms and with 512 float array not noticeabley longer! and with 10k float array about 0.7 and a million float around 10 ms.
          }
          break;
        default:
          alert("Illegal cmd in soundWorker.onmessage: " + e.data.cmd);
      }
    };

    //soundWorker.postMessage({ cmd: "PingAndInc", val: 0, "array": arrayToPost }); // postMessage timing

    // ============== Set up soundProcessor - ie AudioWorkletNode or ScriptProcessor ==============
    if (window.yAudioWorklet) {
      try {
        if (window.isSecureContext) {
          let fred = 0;
        }
        await audioContext.audioWorklet.addModule("js/sound/mos-audio-worklet.js");
        //await audioContext.audioWorklet.addModule("js/sound/mos-audio-worklet.js", {
        //  credentials: 'omit',
        //});
        //audioContext.resume(); // firefox?
        soundProcessor = new window.AudioWorkletNode(audioContext, "mos-audio-worklet");
        if (window.ySharedMemory) {
          //AudioWorklet will write directly to Settings.f32buffer which is shared memory so will need Settings and SamplesBuffer.
          soundProcessor.port.postMessage({ cmd: "Settings", val: Settings });
          soundProcessor.port.postMessage({ cmd: "SamplesBuffer", val: window.samplesBuffer });
        } else {
          //audioWorklet will post to soundWorker
          soundProcessor.port.postMessage({ cmd: "Settings", val: Settings });
          soundProcessor.port.postMessage({ cmd: "SamplesBuffer", val: window.samplesBuffer });
          soundWorker.postMessage({ cmd: "AudioPort", val: 1 }, [soundProcessor.port]); // after which audioWorklet postMessage will go to soundWorker!
        }
      } catch (e) {
        alert("Problem inside js/sound/mos-audio-worklet.js !: " + e); // this catch should only contain audioWorklet Node creation!!?
      }
    } else {
      // AudioWorklet not available so make a ScriptProcessor (which runs in this thread).
      soundProcessor = audioContext.createScriptProcessor(window.iSamplesInBlock, 2, 2);
      // let soundProcessorNode2 = audioContext.createScriptProcessor(4 * 1024, 2, 2);
      if (window.ySharedMemory) {
      } else {
      }
      this.setUpScriptProcessor(); //mediaStream, pitchMethod_);
    }
    return true;
  }

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
    let samplesBuffer = SamplesBuffer.f32SamplesBuffer;
    soundProcessor.free2 = 0;
    soundProcessor.onaudioprocess = function (e) {
      let newSamples = e.inputBuffer.getChannelData(0);
      if (window.ySharedMemory) {
        //let samplesBuffer = SamplesBuffer.f32SamplesBuffer;
        let free = samplesBuffer[SamplesBuffer.freeInd];
        samplesBuffer.set(newSamples, free); // might this be faster with uint8?

        // Copy also to other end of ring buffer if appropriate (so can always read pitchSamples in one go!)
        if (this.free2 >= SamplesBuffer.iSamples && this.free2 < SamplesBuffer.iAugmentedSamples) {
          samplesBuffer.set(newSamples, this.free2); // might this be faster with uint8?
          this.free2 += Settings.iSamplesInBlock;
        }

        free += Settings.iSamplesInBlock;
        if (free >= SamplesBuffer.iSamples) {
          this.free2 = free;
          free = 0;
        }
        samplesBuffer[SamplesBuffer.freeInd] = free;
      } else {
        if (soundWorker != null) {
          soundWorker.postMessage({ cmd: "Samples", val: newSamples });
        }
      }

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
    };

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
          this.iBlocksContainingTwoMaxWaves = Math.ceil((window.iMaxSampleWl * 2) / iSamplesInBlock);
          //if (this.iBlocksContainingiMaxSampleWl > SAMPLE_BLOCKS) {
          // window.alert("iBlocksContainingiMaxSampleWl > SAMPLE_BLOCKS not allowed!");
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
      source.connect(soundProcessor);
      soundProcessor.connect(audioContext.destination); //!???
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
  if (soundWorker) {
    soundWorker.postMessage({ cmd: "ComputePitch" });
  } else {
    // currentSoundProcessor.port.postMessage({ cmd: "ComputePitch" });
  }
}

export function computeLatestPitchOld() {
  // if and when webgl is accessible from webworker(maybe already in (firefox) we could do all of this inside pitchWorker - also see - https://gpuweb.github.io/gpuweb/
  // Whole of pitch deduction here takes about 4 or 5ms on lenovo.
  //var startNsTime = performance.now();
  let samplesBuffer;
  if (window.ySharedMemory) {
    samplesBuffer = SamplesBuffer.f32SamplesBuffer;
    let free = samplesBuffer[SamplesBuffer.freeInd];
    let iMaxWlStart = free - window.iMaxSampleWl * 2;
    if (iMaxWlStart < 0) {
      iMaxWlStart += SamplesBuffer.iSamples;
    }
    pitchSamplesBuffer = new Float32Array(samplesBuffer.buffer, iMaxWlStart * 4, window.iMaxSampleWl * 2); // start index is in bytes but not length
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
