"use strict";
/*
DESCRIPTION
    Way of making 'constant' variables available to any thread simply by importing this file with import * as Settings from "??/Settings.js"; 

IMPROVEMENTS
    
*/
import {iGpgpuMethod, iYinMethod} from "./sound/pitch/Pitch.js"
// pitch methods
//export const iGpgpuMethod = 0;
//export const iYinMethod = 1;


// overrides
export const yAudioWorkletOverride = false;
export const ySharedMemoryOverride = false;
//export const iScriptProcessorSamplesInBlockOverride = 1024;
//export const maxWlOverride = 256;
//export const yWriteToFloatTextureOverride = false;
export const iPitchMethodOverride = iYinMethod; 

// default values
const iScriptProcessorDefaultSamplesInBlock = 512;
const maxWlDefault = 512;
const yWriteToFloatTextureDefault = true; // Not true of IOS! Should test this like in https://stackoverflow.com/questions/28827511/webgl-ios-render-to-floating-point-texture
const iPitchMethodDefault = iGpgpuMethod;

// 'global values'!
export let ySharedMemory, yAudioWorklet;
export let iSamplesInBlock, maxSampleWl;
export let yWriteToFloatTexture;
export let iPitchMethod;

initVars();
if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
  console.log("I am in a web worker");
} else {
  console.log("I am NOT in a web worker");
  window.ySharedMemory = ySharedMemory;
  window.yAudioWorklet = yAudioWorklet;
  window.iSamplesInBlock = iSamplesInBlock;
  window.maxSampleWl = maxSampleWl;
  window.yWriteToFloatTexture = yWriteToFloatTexture;
  window.iPitchMethod = iPitchMethod;
}

function initVars() {
  
  //ySharedMemoryOverride != null ? (ySharedMemory = ySharedMemoryOverride) : typeof SharedArrayBuffer !== "undefined";
  ySharedMemory = typeof ySharedMemoryOverride !== "undefined" ? ySharedMemoryOverride : typeof SharedArrayBuffer !== "undefined";

  //yAudioWorkletOverride != null ? (yAudioWorklet = yAudioWorkletOverride) : typeof AudioWorkletNode !== "undefined";
  yAudioWorklet = typeof yAudioWorkletOverride !== "undefined" ? yAudioWorkletOverride : typeof AudioWorkletNode !== "undefined";

  iSamplesInBlock = yAudioWorklet
    ? 128
    : typeof iScriptProcessorSamplesInBlockOverride !== "undefined"
    ? iScriptProcessorSamplesInBlockOverride
    : iScriptProcessorDefaultSamplesInBlock;
  //iSamplesInBlock = (typeof iScriptProcessorSamplesInBlockOverride !== "undefined") ? iScriptProcessorSamplesInBlockOverride : yAudioWorklet?typeof AudioWorkletNode !== "undefined";

  maxSampleWl = typeof maxWlOverride !== "undefined" ? maxWlOverride : maxWlDefault;

  yWriteToFloatTexture = typeof yWriteToFloatTextureOverride !== "undefined" ? yWriteToFloatTextureOverride : yWriteToFloatTextureDefault;

  iPitchMethod = typeof iPitchMethodOverride !== "undefined" ? iPitchMethodOverride : iPitchMethodDefault;



}



