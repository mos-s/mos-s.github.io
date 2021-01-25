/*
DESCRIPTION
    Way of making 'constant' variables available to any thread simply by importing this file with import * as Settings from "/js/Settings.js"; 


*/

export const yAudioWorkletOverride = false;
export const ySharedMemoryOverride = false;
export const iScriptProcessorSamplesInBlockOverride = 1024;
const iScriptProcessorDefaultSamplesInBlock = 512;

export let ySharedMemory, yAudioWorklet;
export let iSamplesInBlock;

initVars();
//if (window != null) {
// Run this in global scope of window or worker since window.self = window
if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
  console.log("I am in a web worker");
} else {
  console.log("I am NOT in a web worker");
  window.ySharedMemory = ySharedMemory;
  window.yAudioWorklet = yAudioWorklet;
  window.iSamplesInBlock = iSamplesInBlock;
}

/*export function ySharedMemory() {
    if (ySharedMemory_ == null &&) {
        ySharedMemory_ = typeof SharedArrayBuffer !== "undefined";
        ySharedMemoryOverride != null ? (ySharedMemory_ = ySharedMemoryOverride) : ySharedMemory_;
    }
    return ySharedMemory_;
}

export function yAudioWorklet() {
    if (yAudioWorklet_ == null) {
        yAudioWorklet_ = typeof SharedArrayBuffer !== "undefined";
        yAudioWorkletOverride != null ? (yAudioWorklet_ = yAudioWorkletOverride) : yAudioWorklet_;
    }
    return yAudioWorklet_;
}*/

function initVars() {
  // if (ySharedMemory == null) {
  ySharedMemory = typeof SharedArrayBuffer !== "undefined";
  yAudioWorklet = typeof AudioWorkletNode !== "undefined";
  
  ySharedMemoryOverride != null ? (ySharedMemory = ySharedMemoryOverride) : ySharedMemory;
  yAudioWorkletOverride != null ? (yAudioWorklet = yAudioWorkletOverride) : yAudioWorklet;

  iSamplesInBlock = yAudioWorklet? 128: (iScriptProcessorSamplesInBlockOverride? iScriptProcessorSamplesInBlockOverride : iScriptProcessorDefaultSamplesInBlock);
  

  

  // }
}
/*
export function copySettingsToWindow() {
  // Make global
  window.ySharedMemory = ySharedMemory;
  window.yAudioWorklet = yAudioWorklet;
}
*/
