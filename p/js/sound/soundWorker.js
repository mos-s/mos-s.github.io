import {  MAX_SAMPLE_WL } from "./Sound.js";
import * as SamplesBuffer from "./SamplesBuffer.js";
import * as Settings from "../Settings.js";
//SamplesBuffer.init(1024 * 3); // causes "uncaught ref to window!"
/*var i = 0;

function timedCount() {
  i = i + 1;
  postMessage(i);
  setTimeout("timedCount()", 500);
}

timedCount();
*/
//import { iSamplesInBlock, SAMPLE_BLOCKS, MAX_SAMPLE_WL } from "./js/sound/Sound.js";
//import * as gpgpu from "../gpgpu.js";
//import { yin } from "./js/sound/pitch/yin.js";
/*
const MAX_SAMPLE_WL = 512; //600 - should b f(samplerate)
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
      this.iBlocksContainingTwoMaxWaves = Math.ceil((MAX_SAMPLE_WL * 2) / iSamplesInBlock);
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

   
    let iMaxWlStart = free - MAX_SAMPLE_WL * 2;
    if (iMaxWlStart < 0) {
      iMaxWlStart += this_iSamples;
    }
    var iWidth = 512 * 2;//window.max_wl * 2;
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
onmessage = function (e) {
  if (SamplesBuffer.f32SamplesBuffer == null) {
    SamplesBuffer.init(1024 * 3);
  }
  let samplesBuffer = SamplesBuffer.f32SamplesBuffer;
  let free = samplesBuffer[SamplesBuffer.freeInd];
  samplesBuffer.set(e.data, free); // might this be faster with uint8?

  // Copy also to other end of ring buffer if appropriate
  if (this.free2 >= SamplesBuffer.iSamples && this.free2 < SamplesBuffer.iAugmentedSamples) {
    samplesBuffer.set(e.data, this.free2); // might this be faster with uint8?
    this.free2 += Settings.iSamplesInBlock;
  }

  free += Settings.iSamplesInBlock;
  if (free >= SamplesBuffer.iSamples) {
    this.free2 = free;
    free = 0;
  }
  samplesBuffer[SamplesBuffer.freeInd] = free;

  //---------------------------Send pitch samples to main thread on every samples block! ----------------------------
  let iMaxWlStart = free - MAX_SAMPLE_WL * 2;
  if (iMaxWlStart < 0) {
    iMaxWlStart += SamplesBuffer.iSamples;//iSamplesInBlock; //this_iSamples;
  }
  var iWidth = 512 * 2; //window.max_wl * 2;
  //var iByteWidth = 4;//iWidth * 4; // float is 4 bytes
  //works - var slice = this_samplesBuffer.slice(iMaxWlStart, iMaxWlStart + iWidth) ;
  //var fInputTexBuffer = new Float32Array(slice, iMaxWlStart * 4, iWidth); // can use dataview!? also - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array/Float32Array
  //QUESTION: Better if main asked for samples? (would save wasted posts)

  var slice = new Float32Array(samplesBuffer.buffer, iMaxWlStart * 4, iWidth); // Would like to transfer this! I think it is fast because basically just sends pointer!!??
  /*if (slice[1] != 0) {
    let fred = 0;
  }*/
  postMessage(slice); // ie we send (to main.onMessage) just enough of  most recent samples for pitch deduction! Avoids shared memory!!?
};
