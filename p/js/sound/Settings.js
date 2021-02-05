"use strict";
/*
DESCRIPTION
  Typical use:
    In Sound.js:
      import {Settings} from "./Settings.js"; // must be first or at least before Sound.js! ??
      window.settings = Settings;
    In SamplesBuffer.js which is imported by other threads (audioWorklet, soundWorker):
      import {Settings} from "./Settings.js";
    In soundWorker.js:
       Settings is posted from Sound.js (ie main thread where it is initialised with init())
       Note that COULD import it as for SamplesBuffer, but would only only currently work in chrome .. eg firefox has not implemented modules in workers as yet.
     


    thread in a file : import {Settings} from "./Settings.js"; 
  For use in worker eg: worker.postMessage({cmd: "Settings", val: Settings});

IMPROVEMENTS
    
*/
import { iYinJsMainThreadMethod, iYinJsWorkerMethod, iGpgpuMethod } from "./pitch/Pitch.js";
export let PitchMethods = {};
PitchMethods.iYinJsMainThreadMethod = iYinJsMainThreadMethod;
PitchMethods.iGpgpuMethod = iGpgpuMethod;
PitchMethods.iYinJsWorkerMethod = iYinJsWorkerMethod;

export let Settings;

// pitch methods
//export const iGpgpuMethod = 0;
//export const iYinMethod = 1;

// overrides
const yAudioWorkletOverride = false; // this and SharedMemoryOverride = false simulates IOS (and Mac OS?)
const ySharedMemoryOverride = false; // eg simulate current firefox
const yTransferSampleBlocksOverride = true; // ie transfer them
const iScriptProcessorSamplesInBlockOverride = 1024; // 1024  seems to almost completely eliminate dropped sample blocks on lenovo.
//const maxWlOverride = 256;
//const yWriteToFloatTextureOverride = false;
const iPitchMethodOverride = iYinJsWorkerMethod; //iYinJsWorkerMethod;//iYinJsMainThreadMethod;

// default values
const yTransferSampleBlocksDefault = false; // ie currently copy them
const iScriptProcessorDefaultSamplesInBlock = 512;
const maxWlDefault = 512;
const yWriteToFloatTextureDefault = true; // Not true of IOS! Should test this like in https://stackoverflow.com/questions/28827511/webgl-ios-render-to-floating-point-texture
const iPitchMethodDefault = iGpgpuMethod;

// 'global values'!
let ySharedMemory, yAudioWorklet, yWriteToFloatTexture; // ie capabilities!
let yTransferSampleBlocks;
let iSamplesInBlock, iMaxSampleWl;
let iPitchMethod;

initVars();
if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
  console.log("I am in a web worker");
} else {
  console.log("I am NOT in a web worker");
  window.ySharedMemory = ySharedMemory;
  window.yAudioWorklet = yAudioWorklet;
  window.yTransferSampleBlocks = yTransferSampleBlocks;
  window.iSamplesInBlock = iSamplesInBlock;
  window.iMaxSampleWl = iMaxSampleWl;
  window.yWriteToFloatTexture = yWriteToFloatTexture;
  window.iPitchMethod = iPitchMethod;
  window.PitchMethods = PitchMethods;
  window.usefulAlert = usefulAlert;
}

function initVars() {
  //ySharedMemoryOverride != null ? (ySharedMemory = ySharedMemoryOverride) : typeof SharedArrayBuffer !== "undefined";
  ySharedMemory = typeof ySharedMemoryOverride !== "undefined" ? ySharedMemoryOverride : typeof SharedArrayBuffer !== "undefined";

  //yAudioWorkletOverride != null ? (yAudioWorklet = yAudioWorkletOverride) : typeof AudioWorkletNode !== "undefined";
  yAudioWorklet = typeof yAudioWorkletOverride !== "undefined" ? yAudioWorkletOverride : typeof AudioWorkletNode !== "undefined";

  yTransferSampleBlocks = typeof yTransferSampleBlocksOverride !== "undefined" ? yTransferSampleBlocksOverride : yTransferSampleBlocksDefault;

  iSamplesInBlock = yAudioWorklet
    ? 128
    : typeof iScriptProcessorSamplesInBlockOverride !== "undefined"
    ? iScriptProcessorSamplesInBlockOverride
    : iScriptProcessorDefaultSamplesInBlock;
  //iSamplesInBlock = (typeof iScriptProcessorSamplesInBlockOverride !== "undefined") ? iScriptProcessorSamplesInBlockOverride : yAudioWorklet?typeof AudioWorkletNode !== "undefined";

  iMaxSampleWl = typeof maxWlOverride !== "undefined" ? maxWlOverride : maxWlDefault;

  yWriteToFloatTexture = typeof yWriteToFloatTextureOverride !== "undefined" ? yWriteToFloatTextureOverride : yWriteToFloatTextureDefault;

  iPitchMethod = typeof iPitchMethodOverride !== "undefined" ? iPitchMethodOverride : iPitchMethodDefault;

  Settings = { ySharedMemory, yAudioWorklet, yTransferSampleBlocks, iSamplesInBlock, iMaxSampleWl, yWriteToFloatTexture, iPitchMethod, PitchMethods };
  var fred = 0;
}

/*export function create() {
  initVars();
  let o = {};
  o.ySharedMemory = ySharedMemory;
  o.yAudioWorklet = yAudioWorklet;
  o.iSamplesInBlock = iSamplesInBlock;
  o.iMaxSampleWl = iMaxSampleWl;
  o.yWriteToFloatTexture = yWriteToFloatTexture;
  o.iPitchMethod = iPitchMethod;
  return o;
}*/
export function usefulAlert() {
  // let msg = `
  //   "AudioWorkletNode defined = " + (typeof AudioWorkletNode !== "undefined" ? "true" : "false")
  //   `
  let s1 =
    "AudioWorkletNode defined: " +
    (typeof AudioWorkletNode !== "undefined" ? "true" : "false") +
    "\n" +
    "yAudioWorklet: " +
    yAudioWorklet +
    "\n" +
    "SharedArrayBuffer defined: " +
    (typeof SharedArrayBuffer !== "undefined" ? "true" : "false") +
    "\n" +
    "ySharedMemory: " +
    ySharedMemory +
    "\n" +
    "yTransferSampleBlocks: " +
    yTransferSampleBlocks +
    "\n" +
    "yWriteToFloatTexture: " +
    yWriteToFloatTexture +
    "\n" +
    "iSamplesInBlock: " +
    iSamplesInBlock +
    "\n" +
    "iMaxSampleWl: " +
    iMaxSampleWl;
  // would like something like yWriteToOutputFloatTexture!

  alert(s1);
  /*
  window.ySharedMemory = ySharedMemory;
  window.yAudioWorklet = yAudioWorklet;
  window.iSamplesInBlock = iSamplesInBlock;
  window.iMaxSampleWl = iMaxSampleWl;
  window.yWriteToFloatTexture = yWriteToFloatTexture;
  window.iPitchMethod = iPitchMethod;
  window.PitchMethods = PitchMethods;
*/
}
