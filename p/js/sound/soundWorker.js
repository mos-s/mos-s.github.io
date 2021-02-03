//import {  window.maxSampleWl } from "./Sound.js";

//const { pitchSamplesBuffer } = require("./Sound");
//const {computeMethod} = require("./pitch/Pitch.js");
//import * as SamplesBuffer from "./SamplesBufferOld.js";
let Settings, SamplesBuffer, pitchComputeMethod; // initialised by postMessage from Sound.js
pitchComputeMethod = yin; // for now
//import * as Settings from "../SettingsOld.js";
//SamplesBuffer.init(1024 * 3); // causes "uncaught ref to window!"
/*var i = 0;

function timedCount() {
  i = i + 1;
  postMessage(i);
  setTimeout("timedCount()", 500);
}

timedCount();
*/
//import { iSamplesInBlock, SAMPLE_BLOCKS, window.maxSampleWl } from "./js/sound/Sound.js";
//import * as gpgpu from "../gpgpu.js";
//import { yin } from "./js/sound/pitch/yin.js";
/*
const window.maxSampleWl = 512; //600 - should b f(samplerate)
const iSamplesInBlock = 512; //256; //128;
const SAMPLE_BLOCKS = 16;

let this_iSamples, this_samplesBuffer, this_iBlocksContainingTwoMaxWaves, this_iActualBufferLength, this_iBlock, this_pitch;
let free, this_free2;
let yInside = false;
let yEnoughData = false;
*/
/*
onmessage = function (e) {
  //processWaveInToDate_1;
  postMessage(123);
};

onmessage = function(e) {
    //processWaveInToDate_1;
      postMessage(123);
    }
*/
//let yDoDelay = false;
//let iCtr = 0;
/*
onmessage = function (e) {
  //processWaveInToDate_1;
  //postMessage(123);
  iCtr++;
  if (yInside) {
    var fred = 0;
    yInside = false;
  } else {
    yInside = true;
    //let inputs = new Float32Array(e.inputBuffer.getChannelData(0));
    let inputs = e.data;
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

    if (yDoDelay) {
      for (var i = 0; i < 10000; i++) {
        console.log(i);
      }
      yDoDelay = false;
    }

   
    let iMaxWlStart = free - window.maxSampleWl * 2;
    if (iMaxWlStart < 0) {
      iMaxWlStart += this_iSamples;
    }
    var iWidth = 512 * 2;//window.maxSampleWl * 2;
    //var iByteWidth = 4;//iWidth * 4; // float is 4 bytes
    //works - var slice = this_samplesBuffer.slice(iMaxWlStart, iMaxWlStart + iWidth) ;
    //var fInputTexBuffer = new Float32Array(slice, iMaxWlStart * 4, iWidth); // can use dataview!? also - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array/Float32Array
    //QUESTION: Better if main asked for samples? (would save wasted posts)
    
    var slice = new Float32Array(slice, iMaxWlStart * 4, iWidth); // Would like to transfer this! I think it is fast because basically just sends pointer!!??

    postMessage(slice);// ie we send (to main.onMessage) just enough of  most recent samples for pitch deduction! Avoids shared memory!!?
    yInside = false;
  }
};
*/
let dotProduct, iDotProductLength;
let audioPort;
onmessage = function (e) {
  switch (e.data.cmd) {
    case "SamplesBuffer":
      SamplesBuffer = e.data.val; //.init(e.data.val);
      break;
    case "PitchMethod":
      pitchComputeMethod = e.data.val;
      break;
    case "Settings":
      Settings = e.data.val;
      dotProduct = new Float32Array(Settings.maxSampleWl);
      iDotProductLength = dotProduct.length;
      break;
    case "AudioPort":
      {
        //let port = e.data.val;
        audioPort = e.ports[0];
        audioPort.postMessage({ cmd: "FromWorker", val: 1 });
        //sharedWorkerPort.onmessage = event => postMessage(event.data);
        audioPort.onmessage = function (e) {
          //console.log("onmessage!!" + e.data);
          switch (e.data.cmd) {
            case "Samples":
              /*if (SamplesBuffer.f32SamplesBuffer == null) {

          SamplesBuffer.init(1024 * 3);
        }*/
              let newSamples = e.data.val;
              let samplesBuffer = SamplesBuffer.f32SamplesBuffer;
              let free = samplesBuffer[SamplesBuffer.freeInd];
              samplesBuffer.set(newSamples, free); // might this be faster with uint8?

              // Copy also to other end of ring buffer if appropriate
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

              //---------------------------Send pitch samples to main thread on every samples block! ----------------------------
              let iMaxWlStart = free - Settings.maxSampleWl * 2;
              if (iMaxWlStart < 0) {
                iMaxWlStart += SamplesBuffer.iSamples; //iSamplesInBlock; //this_iSamples;
              }
              var iWidth = Settings.maxSampleWl * 2; //window.maxSampleWl * 2;
              //var iByteWidth = 4;//iWidth * 4; // float is 4 bytes
              //works - var slice = this_samplesBuffer.slice(iMaxWlStart, iMaxWlStart + iWidth) ;
              //var fInputTexBuffer = new Float32Array(slice, iMaxWlStart * 4, iWidth); // can use dataview!? also - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array/Float32Array
              //QUESTION: Better if main asked for samples? (would save wasted posts)

              var pitchSamplesBuffer = new Float32Array(samplesBuffer.buffer, iMaxWlStart * 4, iWidth); // Would like to transfer this! I think it is fast because basically just sends pointer!!??
              /*if (slice[1] != 0) {
          let fred = 0;
        }*/
              if (Settings.iPitchMethod == Settings.PitchMethods.iYinJsWorkerMethod) {
                let pitch = pitchComputeMethod(pitchSamplesBuffer);
                //samplesBuffer[SamplesBuffer.pitchInd] = pitch;
                postMessage(pitch);
              } else {
                // Send samples to main thread for computation
                postMessage(pitchSamplesBuffer); // ie we send (to main.onMessage) just enough of  most recent samples for pitch deduction! Avoids shared memory!!?
              }
              break;
            default:
              console.log("invalid cmd in soundWorker!: " + e.data.cmd);
              
          }
        };
      }
      break;
    default:
      console.log("invalid cmd in soundWorker!: " + e.data.cmd);
  }
};

function yin(pitchSamplesBuffer) {
  yinDotProduct(pitchSamplesBuffer);
  return yinComputeFromDotProduct();
}

function yinDotProduct(pitchSamplesBuffer) {
  //}, max_sample_wl_param, iStartIndex) {
  // Set buffer size to the highest power of two below the provided buffer's length.
  /*let bufferSize;
    for (bufferSize = 1; bufferSize < float32AudioBuffer.length; bufferSize *= 2);
    bufferSize /= 2;
  */
  // Set up the yinBuffer as described in step one of the YIN paper.
  //const yinBufferLength = window.maxSampleWl; //max_sample_wl_param;//bufferSize / 2;
  //const dotProduct = new Float32Array(yinBufferLength);

  // Compute the difference function as described in step 2 of the YIN paper.
  for (let t = 0; t < iDotProductLength; t++) {
    dotProduct[t] = 0;
  }
  for (let t = 1; t < iDotProductLength; t++) {
    //  for (let i = iStartIndex; i < iStartIndex + yinBufferLength; i++) {
    for (let i = 0; i < iDotProductLength; i++) {
      const delta = pitchSamplesBuffer[i] - pitchSamplesBuffer[i + t];
      dotProduct[t] += delta * delta;
    }
  }
}

function yinComputeFromDotProduct() {
  // Compute the cumulative mean normalized difference as described in step 3 of the paper.
  dotProduct[0] = 1;
  dotProduct[1] = 1;
  let runningSum = 0;
  for (let t = 1; t < iDotProductLength; t++) {
    runningSum += dotProduct[t];
    dotProduct[t] *= t / runningSum; //yinBuffer[t] = yinBuffer[t] * (t / runningSum);
  }

  const threshold = 0.07;
  const sampleRate = 48000;
  const probabilityThreshold = 0.1;

  let probability = 0,
    tau;

  // Compute the absolute threshold as described in step 4 of the paper.
  // Since the first two positions in the array are 1,
  // we can start at the third position.
  for (tau = 2; tau < iDotProductLength; tau++) {
    if (dotProduct[tau] < threshold) {
      while (tau + 1 < iDotProductLength && dotProduct[tau + 1] < dotProduct[tau]) {
        tau++;
      }
      // found tau, exit loop and return
      // store the probability
      // From the YIN paper: The threshold determines the list of
      // candidates admitted to the set, and can be interpreted as the
      // proportion of aperiodic power tolerated
      // within a periodic signal.
      //
      // Since we want the periodicity and and not aperiodicity:
      // periodicity = 1 - aperiodicity
      probability = 1 - dotProduct[tau];
      break;
    }
  }

  // if no pitch found, return null.
  if (tau === iDotProductLength || dotProduct[tau] >= threshold) {
    // if tau === iDotProductLength prevents evaluation of dotProduct[tau] which would be one past last elt of dotProduct!
    return null;
  }

  // If probability too low, return -1.
  if (probability < probabilityThreshold) {
    return null;
  }

  /**
   * Implements step 5 of the AUBIO_YIN paper. It refines the estimated tau
   * value using parabolic interpolation. This is needed to detect higher
   * frequencies more precisely. See http://fizyka.umk.pl/nrbook/c10-2.pdf and
   * for more background
   * http://fedc.wiwi.hu-berlin.de/xplore/tutorials/xegbohtmlnode62.html
   */
  let betterTau, x0, x2;
  if (tau < 1) {
    x0 = tau;
  } else {
    x0 = tau - 1;
  }
  if (tau + 1 < iDotProductLength) {
    x2 = tau + 1;
  } else {
    x2 = tau;
  }
  if (x0 === tau) {
    if (dotProduct[tau] <= dotProduct[x2]) {
      betterTau = tau;
    } else {
      betterTau = x2;
    }
  } else if (x2 === tau) {
    if (dotProduct[tau] <= dotProduct[x0]) {
      betterTau = tau;
    } else {
      betterTau = x0;
    }
  } else {
    const s0 = dotProduct[x0];
    const s1 = dotProduct[tau];
    const s2 = dotProduct[x2];
    // fixed AUBIO implementation, thanks to Karl Helgason:
    // (2.0f * s1 - s2 - s0) was incorrectly multiplied with -1
    betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
  }

  return sampleRate / betterTau;
}
