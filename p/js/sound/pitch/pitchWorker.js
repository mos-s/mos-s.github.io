/*
DESCRIPTION
    Computes and returns pitch when requested by main

IMPROVEMENTS
    When shared memory, place pitch there!
    import buffer dims from Sound to deduce buffer size and var locations? (poss?)
*/
//import { iSamplesInBlock, MAX_CHANNEL_COUNT, SAMPLE_BLOCKS, HeapAudioBuffer, SamplesBuffer } from "../Sound.js";
import { iSamplesInBlock, window.maxSampleWl } from "../Sound.js";
import * as SamplesBuffer from "../SamplesBuffer.js";
//import { SamplesBuffer } from "../SamplesBuffer.js";
//import * as Fred from "../Fred.js";
//importScripts("../Fred.js")
import { yin } from "./yin.js";
//import * as gpgpu from "../../gpgpu.js";

let sab; // shared array buffer
//let f32Buffer;
let samplesBuffer;

onmessage = function (e) {
  switch (e.data.command) {
    case "sab":
      SamplesBuffer.init(e.data.value);
      break;
    case "SB":
      samplesBuffer = e.data.value;
      let fred = SamplesBuffer.sab;
      break;

    case "p":
      if (SamplesBuffer.f32SamplesBuffer[1] != 0) {
        let samplesBuffer = SamplesBuffer.f32SamplesBuffer;

        let free = samplesBuffer[SamplesBuffer.freeInd];
        let iMaxWlStart = free - window.maxSampleWl * 2;
        if (iMaxWlStart < 0) {
          iMaxWlStart += SamplesBuffer.iSamples;
        }

        var startNsTime = performance.now();

        let pitch = yin(samplesBuffer, window.maxSampleWl, iMaxWlStart);

        //let pitch = pitchByShader(new Float32Array(samplesBuffer, iMaxWlStart, window.maxSampleWl * 2));

        //postMessage(pitch); //ie to main
        samplesBuffer[SamplesBuffer.pitchInd] = pitch;

        var ellapsedItsMs = performance.now() - startNsTime;
        console.log("\npitch = " + pitch);
        console.log("\nellapsedItsMs = " + ellapsedItsMs);
      }
      break;
    default:
      alert("illegal command in pitchWorker!");
  }
};

/*function pitchByShader(waveBuffer) {
  let inputTex = gpgpu.computeInputTexFromFloatSamples_RGBA_Worker(waveBuffer);
  if (inputTex) {
    gpgpu.execShader2(inputTex); // just calls Shader.run!
    gpgpu.getDotProductsRGBA(); // ie readpixels = should not be any wait (unless nore than samplesblock interval) for computation to finish
    let pitch = gpgpu.yin2fromC();
    return pitch;
  } else {
    return 600;
  }
}*/
