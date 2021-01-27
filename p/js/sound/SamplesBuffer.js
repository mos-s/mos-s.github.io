"use strict";
/*
DESCRIPTION
  Similar to C++ version -  circular buffer for (f32 currently) samples


*/

//import { iSamplesInBlock, MAX_CHANNEL_COUNT, SAMPLE_BLOCKS, HeapAudioBuffer, SamplesBuffer, window.maxSampleWl } from "sound/Sound.js";
//import { SAMPLE_BLOCKS} from "./Sound.js";
import * as Settings from "../Settings.js";
 // because this is called from other (ie non main) threads!

export let iVar = 11;
let sab;
export let f32SamplesBuffer;

export let freeInd, toProcessInd, pitchInd;
const iNumberVars = 3; // Increment this if add var!!!

export let iSamples, iAugmentedSamples; // do not change after init!
export let iWrapAvoidSamples; // = Math.ceil((window.maxSampleWl * 2) / iSamplesInBlock) * iSamplesInBlock;

export function init(iSamplesOrSharedArrayBuffer) {
  //We call this from any module which imports this module!
  // Typically from main thread once with no of samples and eg workers with existing shared array buffer.
  iWrapAvoidSamples = Math.ceil((Settings.maxSampleWl * 2) / Settings.iSamplesInBlock) * Settings.iSamplesInBlock;

  /*if (typeof(window) == "undefined") { //if (window == null) {
    window = {};
  } else {
    window = window;
  }*/
  //setCapabilities();
  if (typeof iSamplesOrSharedArrayBuffer == "number") {
    iSamples = Math.ceil(iSamplesOrSharedArrayBuffer / Settings.iSamplesInBlock) * Settings.iSamplesInBlock;
    iAugmentedSamples = iSamples + iWrapAvoidSamples;
    if (Settings.ySharedMemory) {
      sab = new SharedArrayBuffer((iAugmentedSamples + iNumberVars) * 4); // Place vars after samples!
      if (window != null) {
        // nec?
        window.sab = sab;
      }
    } else {
      sab = new ArrayBuffer((iAugmentedSamples + iNumberVars) * 4); // Place vars after samples!
    }
  } else {
    sab = iSamplesOrSharedArrayBuffer;
  }

  f32SamplesBuffer = new Float32Array(sab); // zeroed
  f32SamplesBuffer[0] = 111; //dev

  iAugmentedSamples = f32SamplesBuffer.length - iNumberVars;
  iSamples = iAugmentedSamples - iWrapAvoidSamples;

  // Compute shared var indexes
  freeInd = iAugmentedSamples; // immediately after samples
  toProcessInd = freeInd + 1;
  pitchInd = toProcessInd + 1;
}

export function writeSamplesBlock() {
  /*this.samplesBuffer = SAB.samplesBuffer;
    //this.samplesBuffer.subarray(this.free, (this.free + 128)).set(inputs[0][0]);
    this.samplesBuffer.set(inputs[0][0], this.free); // might this be faster with uint8?

    // Copy also to other end of ring buffer is appropriate
    //if (this.free2 >= this.iSamples && this.free2 <= this.iActualBufferLength) {
    if (this.free2 >= this.iSamples && this.free2 < this.iActualBufferLength) {
      this.samplesBuffer.set(inputs[0][0], this.free2); // might this be faster with uint8?
      this.free2 += iSamplesInBlock;
    }

    this.free += iSamplesInBlock;
    if (this.free >= this.iSamples) {
      this.free2 = this.free;
      this.free = 0;
    }
    //this.samplesBuffer[sab.length - 1] = this.free;// copy into shared memory for pitchWorker!
    SAB.sab[freeInd] = this.free;
    break;
    */
}



export function readLatestSamplesBlock() {
  letfred = 0;
}
