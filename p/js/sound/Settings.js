"use strict";
/*
DESCRIPTION
  Typical use:
    In Sound.js:
      import {Settings} from "./Settings.js"; // must be first or at least before Sound.js! ??
      window.settings = Settings;
    In SamplesBuffer.js which is imported by other threads (audioWorklet, soundWorker):
      import {Settings} from "./Settings.js";
    In soundWorker.js and mos-audio-worklet.js:
       Settings is posted from Sound.js (ie main thread where it is initialised with init())
       Note that COULD import it as for SamplesBuffer, but would only only currently work in chrome .. eg firefox has not implemented modules in workers as yet.

OVERRIDES
  Can comment in/out code overrides.
  Can override with URL params eg ySharedMemory=false etc 
  UrlParam overrides override code overrides.
  UrlParam IOS=whatever overrides all!



IMPROVEMENTS
  Should prevent override which will cause failure ... eg yAudioWorklet when AudioWorklet is undefined etc!
    
*/
import { iYinJsMainThreadMethod, iYinJsWorkerMethod, iGpgpuMethod } from "./pitch/Pitch.js";
export let PitchMethods = {};
PitchMethods.iYinJsMainThreadMethod = iYinJsMainThreadMethod;
PitchMethods.iGpgpuMethod = iGpgpuMethod;
PitchMethods.iYinJsWorkerMethod = iYinJsWorkerMethod;

export let Settings; // this is what is used in other files (and posted to other threads!)

// pitch methods
//export const iGpgpuMethod = 0;
//export const iYinMethod = 1;

// overrides (Now only from url!)
//const yAudioWorkletOverride = false; // this and SharedMemoryOverride = false simulates IOS (and Mac OS?)
//const ySharedMemoryOverride = false; // eg simulate current firefox
//const yTransferSampleBlocksOverride = true; // ie transfer them
//const iScriptProcessorSamplesInBlockOverride = 1024; // 1024  seems to almost completely eliminate dropped sample blocks on lenovo.
//const iMaxSampleWlOverride = 256;
//const yWriteToFloatTextureOverride = false;
//const iPitchMethodOverride = iYinJsWorkerMethod; //iYinJsWorkerMethod;//iYinJsMainThreadMethod;
let yAudioWorkletOverride, ySharedMemoryOverride, yTransferSampleBlocksOverride, iSamplesInBlockOverride, iMaxSampleWlOverride, yWriteToFloatTextureOverride, iPitchMethodOverride;

// default values
const yTransferSampleBlocksDefault = false; // ie currently copy them
const iScriptProcessorDefaultSamplesInBlock = 1024;
const iMaxSampleWlDefault = 512;
const yWriteToFloatTextureDefault = true; // Not true of IOS! Should test this like in https://stackoverflow.com/questions/28827511/webgl-ios-render-to-floating-point-texture
const iPitchMethodDefault = iYinJsWorkerMethod;//iGpgpuMethod;

// 'global unchanging (after init) values'!
let ySharedMemory, yAudioWorklet, yWebgpuDefined, yWebgpuAdapterDefined, yWriteToFloatTexture,yWebgpu; // ie capabilities!
let yTransferSampleBlocks;
let iSamplesInBlock, iMaxSampleWl;
let iPitchMethod;

const webgpu = false;//navigator.gpu;


initVars();

if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
  console.log("I am in a web worker");
} else {
  console.log("I am NOT in a web worker");
  window.Settings = Settings;
  window.usefulSettingsAlert = usefulSettingsAlert; // We can't include this in Settings as we are posting Settings to other threads! (ie with different environments)
}


function setOverridesFromUrlParams () {
  let urlParams = getUrlVars();
  if (urlParams.ySharedMemory) {
    ySharedMemoryOverride = (urlParams.ySharedMemory == 'true');
  }
  if (urlParams.yAudioWorklet) {
    yAudioWorkletOverride = (urlParams.yAudioWorklet == 'true');
  }
  if (urlParams.iMaxSampleWl) {
    iMaxSampleWlOverride = parseInt(urlParams.iMaxSampleWl);
  }
  if (urlParams.iSamplesInBlock) {
    if (Settings.yAudioWorklet) {
      alert("Can not override iSamplesInBlock when yAudioWorklet=true");
    } else {
      iSamplesInBlockOverride = parseInt(urlParams.iSamplesInBlock);
    }
  }
  if (urlParams.IOS) {
    ySharedMemoryOverride = false;
    yAudioWorkletOverride = false;
  }

}

async function initVars() {

  if (webgpu) { // where should this variable be? ... maybe in own module for webgpu?
    alert("navigator.gpu IS DEFINED!!")
    const adapter = await webgpu.requestAdapter();
    yWebgpuAdapterDefined = typeof adapter != "undefined";
  }

  setOverridesFromUrlParams();
  ySharedMemory = typeof ySharedMemoryOverride !== "undefined" ? ySharedMemoryOverride : typeof SharedArrayBuffer !== "undefined";

  yAudioWorklet = typeof yAudioWorkletOverride !== "undefined" ? yAudioWorkletOverride : typeof AudioWorkletNode !== "undefined";

  yTransferSampleBlocks = typeof yTransferSampleBlocksOverride !== "undefined" ? yTransferSampleBlocksOverride : yTransferSampleBlocksDefault;

  iSamplesInBlock = yAudioWorklet
    ? 128
    : typeof iSamplesInBlockOverride !== "undefined"
    ? iSamplesInBlockOverride
    : iScriptProcessorDefaultSamplesInBlock;
  //iSamplesInBlock = (typeof iScriptProcessorSamplesInBlockOverride !== "undefined") ? iScriptProcessorSamplesInBlockOverride : yAudioWorklet?typeof AudioWorkletNode !== "undefined";

  iMaxSampleWl = typeof iMaxSampleWlOverride !== "undefined" ? iMaxSampleWlOverride : iMaxSampleWlDefault;

  yWriteToFloatTexture = typeof yWriteToFloatTextureOverride !== "undefined" ? yWriteToFloatTextureOverride : yWriteToFloatTextureDefault;

  yWebgpuDefined = typeof navigator.gpu !== "undefined";

  iPitchMethod = typeof iPitchMethodOverride !== "undefined" ? iPitchMethodOverride : iPitchMethodDefault;

  Settings = { ySharedMemory, yAudioWorklet, yWebgpuAdapterDefined, yWebgpuAdapterDefined, yTransferSampleBlocks, iSamplesInBlock, iMaxSampleWl, yWriteToFloatTexture, iPitchMethod, PitchMethods };

  // --------------------- Do any url param overrides -------------------
  /*for (var key in Settings) {
    let value = Settings[key];
    Settings[key] = getUrlParam(key, value);
    let fred = 0;
    Settings.ySharedMemory = getUrlParam(key, Settings.ySharedMemory);
  }*/
  }

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  return vars;
}
/*function getUrlParam(parameter, defaultvalue){
  var urlparameter = defaultvalue;
  if(window.location.href.indexOf(parameter) > -1){
      urlparameter = getUrlVars()[parameter];
      }
  return urlparameter;
}*/

export function usefulSettingsAlert() {
  // let msg = `
  //   "AudioWorkletNode defined = " + (typeof AudioWorkletNode !== "undefined" ? "true" : "false")
  //   `
  let s =
    "AudioWorkletNodez defined: " +
    (typeof AudioWorkletNode !== "undefined" ? "true" : "false") +
    "\n" +
    "yAudioWorklet: " +
    Settings.yAudioWorklet +
    "\n" +
    "yWebgpuDefined: " +
    Settings.yWebgpuDefined +
    "\n" +
    "yWebgpuAdapterDefined: " +
    Settings.yWebgpuAdapterDefined +
    "\n" +
    "SharedArrayBuffer defined: " +
    (typeof SharedArrayBuffer !== "undefined" ? "true" : "false") +
    "\n" +
    "ySharedMemory: " +
    Settings.ySharedMemory +
    "\n" +
    "yTransferSampleBlocks: " +
    Settings.yTransferSampleBlocks +
    "\n" +
    "yWriteToFloatTexture: " +
    Settings.yWriteToFloatTexture +
    "\n" +
    "iSamplesInBlock: " +
    Settings.iSamplesInBlock +
    "\n" +
    "iMaxSampleWl: " +
    Settings.iMaxSampleWl;
  // would like something like yWriteToOutputFloatTexture!

  alert(s);
}
