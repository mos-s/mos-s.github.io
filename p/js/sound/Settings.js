"use strict";
/*
DESCRIPTION
  Typical use in a file : import {Settings} from "./Settings.js"; 
  For use in worker eg: worker.postMessage({cmd: "Settings", val: Settings});

IMPROVEMENTS
    
*/
import { iGpgpuMethod, iYinMethod } from "./pitch/Pitch.js";

export let Settings;

// pitch methods
//export const iGpgpuMethod = 0;
//export const iYinMethod = 1;

// overrides
const yAudioWorkletOverride = false;
const ySharedMemoryOverride = false;
//const iScriptProcessorSamplesInBlockOverride = 1024;
//const maxWlOverride = 256;
//const yWriteToFloatTextureOverride = false;
const iPitchMethodOverride = iYinMethod;

// default values
const iScriptProcessorDefaultSamplesInBlock = 512;
const maxWlDefault = 512;
const yWriteToFloatTextureDefault = true; // Not true of IOS! Should test this like in https://stackoverflow.com/questions/28827511/webgl-ios-render-to-floating-point-texture
const iPitchMethodDefault = iGpgpuMethod;

// 'global values'!
let ySharedMemory, yAudioWorklet;
let iSamplesInBlock, maxSampleWl;
let yWriteToFloatTexture;
let iPitchMethod;

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

  Settings = { ySharedMemory, yAudioWorklet, iSamplesInBlock, maxSampleWl, yWriteToFloatTexture, iPitchMethod };
  var fred = 0;
}

/*export function create() {
  initVars();
  let o = {};
  o.ySharedMemory = ySharedMemory;
  o.yAudioWorklet = yAudioWorklet;
  o.iSamplesInBlock = iSamplesInBlock;
  o.maxSampleWl = maxSampleWl;
  o.yWriteToFloatTexture = yWriteToFloatTexture;
  o.iPitchMethod = iPitchMethod;
  return o;
}*/
