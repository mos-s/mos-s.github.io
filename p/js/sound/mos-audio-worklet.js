"use strict";
/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

///import Module from "./simple-kernel.wasmmodule.js";
///import { RENDER_QUANTUM_FRAMES, MAX_CHANNEL_COUNT, SAMPLE_BLOCKS, HeapAudioBuffer, SamplesBufferWasm } from "./wasm-audio-helper.js";

//import { iSamplesInBlock, MAX_CHANNEL_COUNT, SAMPLE_BLOCKS, HeapAudioBuffer, SamplesBuffer } from "./sound/Sound.js";
//import { yin } from "./pitch/yin.js";
//import * as SamplesBuffer from "./SamplesBuffer.js";
//import { iSamplesInBlock, window.iMaxSampleWl } from "./Sound.js";
//import * as Settings from "../Settings.js";
//let Settings;
//let SamplesBuffer;

let Settings, SamplesBuffer, pitchComputeMethod; // initialised by postMessage from Sound.js
pitchComputeMethod = yin; // for now
let soundWorkerPort;
let samplesBuffer;

const yDoTiming = false;
//const window.iMaxSampleWl = 512; //600 - should b f(samplerate)
//const iSamplesInBlock = 128;
const iBlocksInBuffer = 1;
//const iSamplesInBuffer = iSamplesInBlock * iBlocksInBuffer;

const WASM_RING = 0;
const JS_WRITE_TO_SHARED_ARRAY_BUFFER = 1; // ie if ySharedMemory is true.??
const POST_TO_WORKER = 2; // To be sure we don't miss/drop any sample blocks!
const ALL_IN_THIS_THREAD = 3; // Would be fine to write sample block to ring buffer and even compute pitch when requested (or as often as possible) if we could be sure that sample blocks were queued like messages are so we would not drop sample blocks!

//const samplesBufferMethod = POST_TO_WORKER;
//let soundWorker;
//let SAB;
/**
 * A simple demonstration of WASM-powered AudioWorkletProcessor.
 *
 * @class WASMWorkletProcessor
 * @extends AudioWorkletProcessor
 */
//AudioWorkletProcessor = Object;
let dotProduct, iDotProductLength, samplesBufferMethod;
//let soundWorkerz;// = new Worker("js/sound/sharedSoundWorker.js", { type: "module" }); // gave error: InvalidStateError: Failed to construct 'AudioWorkletNode': AudioWorkletNode cannot be created: The node name 'mos-audio-worklet' is not defined in AudioWorkletGlobalScope.
//let fred = 0;
class MosAudioWorkletProcessor extends AudioWorkletProcessor {
  /**
   * @constructor
   */
  constructor() {
    super();
    this.free2 = 0;
    this.port.onmessage = (e) => {
      switch (e.data.cmd) {
        case "SamplesBuffer":
          SamplesBuffer = e.data.val; //.init(e.data.val);
          samplesBuffer = SamplesBuffer.f32SamplesBuffer;
          break;
        case "PitchMethod":
          pitchComputeMethod = e.data.val;
          break;
        case "Settings":
          Settings = e.data.val;
          dotProduct = new Float32Array(Settings.iMaxSampleWl);
          iDotProductLength = dotProduct.length;
          samplesBufferMethod = Settings.ySharedMemory ? JS_WRITE_TO_SHARED_ARRAY_BUFFER : POST_TO_WORKER;
          break;
        case "WorkerPort":
          //soundWorker = new Worker("js/sound/soundWorker.js", { type: "module" }); // Worker not defined!
          //[sharedWorkerPort] = e.ports; // meaning?
          soundWorkerPort = e.ports[0];
          soundWorkerPort.postMessage("bingo");
          //sharedWorkerPort.onmessage = event => postMessage(event.data);
          /*sharedWorkerPort.onmessage = function (e) {
            console.log("onmessage!!" + e.data);
            let fred = 0;
          };*/
          break;
        case "SendMessage":
          soundWorkerPort.postMessage("bingo");
          break;
        case "FromWorker":
          console.log("Message received from Worker Ok!"); // defensive
          //this.port.postMessage("bingo");
          break;

        default:
          console.log("Illegal cmd in mos-audio-worklet: " + e.data.cmd);
        //SamplesBuffer.init(event.data.value);
      }
    };

    // Allocate the buffer for the heap access. Start with stereo, but it can
    // be expanded up to 32 channels.
///    this._heapInputBuffer = new SamplesBufferWasm(Module, RENDER_QUANTUM_FRAMES, 1, SAMPLE_BLOCKS);
///    this._heapOutputBuffer = new HeapAudioBuffer(Module, RENDER_QUANTUM_FRAMES, 2, MAX_CHANNEL_COUNT);

    //this.heap = Module._malloc(iSamplesInBuffer * 4);
    //this.pfSamples = Module.HEAPF32.subarray(this.heap >> 2, (this.heap + 128 * 4) >> 2);

///    this._kernel = new Module.SimpleKernel();

    // this.port.postMessage("Hi from mos-audio-worklet!"); // to main?
  }

  /*fred() {
    let f = performance.now();
  }*/

  /**
   * System-invoked process callback function.
   * @param  {Array} inputs Incoming audio stream.
   * @param  {Array} outputs Outgoing audio stream.
   * @param  {Object} parameters AudioParam data.
   * @return {Boolean} Active source flag.
   */
  processOrig(inputs, outputs, parameters) {
    // Use the 1st input and output only to make the example simpler. |input|
    // and |output| here have the similar structure with the AudioBuffer
    // interface. (i.e. An array of Float32Array)
    let input = inputs[0];
    let output = outputs[0];

    // For this given render quantum, the channel count of the node is fixed
    // and identical for the input and the output.
    let channelCount = input.length;

    // Prepare HeapAudioBuffer for the channel count change in the current
    // render quantum.
    this._heapInputBuffer.adaptChannel(channelCount);
    this._heapOutputBuffer.adaptChannel(channelCount);

    // Copy-in, process and copy-out.
    for (let channel = 0; channel < channelCount; ++channel) {
      this._heapInputBuffer.getChannelData(channel).set(input[channel]);
    }
    this._kernel.process(this._heapInputBuffer.getHeapAddress(), this._heapOutputBuffer.getHeapAddress(), channelCount);
    for (let channel = 0; channel < channelCount; ++channel) {
      output[channel].set(this._heapOutputBuffer.getChannelData(channel));
    }

    return true;
  }

  processStripped(inputs, outputs, parameters) {
    // Just the left channel of the 2 d inputs array.

    this._heapInputBuffer.getChannelData(0).set(inputs[0][0]); //this could put new samples in correct place in circular malloced wasm buffer!?

    this._heapInputBuffer.getChannelData(0).set(inputs[0][0]); //this could put new samples in correct place in circular malloced wasm buffer!?

    this._kernel.process(this._heapInputBuffer.getHeapAddress(), this._heapOutputBuffer.getHeapAddress(), 1);

    outputs[0][0].set(this._heapOutputBuffer.getChannelData(0));

    return true;
  }
  /*process(inputs, outputs, parameters) {
    // Note that this kicks off as soon as node is created (ie BEFORE connect!!)
    // Just the left channel of the 2 d inputs array.
//QUESTION: If we do a lot in here will next call to process be lost? 
// Need to allow parallel use of shared memory!
    if (inputs[0][0] != null) {
      //if (window.soundWorker != null) {
        //window.soundWorker.postMessage(e.inputBuffer.getChannelData(0)); // For now for simplicity we post to worker even if sound received by audioWorker rather than script processor
        postMessage(e.inputBuffer.getChannelData(0));
      //}
    }
    return true; // or will not call again!?
  }*/

  process(inputs, outputs, parameters) {
    // Just the left channel of the 2 d inputs array.
    //sharedWorkerPort.postMessage("bingo");
    let newSamples = inputs[0][0];
    if (newSamples != null) {
      //var iIts = yDoTiming ? 1000 : 1;
      //let startNsTime = window.performance.now(); window not defined
      //for (let i = 0; i < iIts; i++) {
      switch (samplesBufferMethod) {
        case WASM_RING:
          //this.pfSamples.set(newSamples);

          //this._heapInputBuffer.getChannelData(0).set(newSamples); //this could put new samples in correct place in circular malloced wasm buffer!?
/* 
         let fred = this._heapInputBuffer.getChannelData(0);
          fred.set(newSamples);

          this._kernel.process(this._heapInputBuffer.getHeapAddress(), this._heapOutputBuffer.getHeapAddress(), 1);

          outputs[0][0].set(this._heapOutputBuffer.getChannelData(0));
*/
          break;
        case JS_WRITE_TO_SHARED_ARRAY_BUFFER:
          {
            //let samplesBuffer = SamplesBuffer.f32SamplesBuffer;
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
          }
          break;
        case POST_TO_WORKER:
          this.port.postMessage({ cmd: "Samples", val: newSamples });
          break;

        case ALL_IN_THIS_THREAD:
          // This currently is wrong because pitch computation takes longer then 128 frame sample block interval!!
          {
            let newSamples = newSamples;
            //let samplesBuffer = SamplesBuffer.f32SamplesBuffer;
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
            let iMaxWlStart = free - Settings.iMaxSampleWl * 2;
            if (iMaxWlStart < 0) {
              iMaxWlStart += SamplesBuffer.iSamples; //iSamplesInBlock; //this_iSamples;
            }
            var iWidth = Settings.iMaxSampleWl * 2; //window.iMaxSampleWl * 2;
            //var iByteWidth = 4;//iWidth * 4; // float is 4 bytes
            //works - var slice = this_samplesBuffer.slice(iMaxWlStart, iMaxWlStart + iWidth) ;
            //var fInputTexBuffer = new Float32Array(slice, iMaxWlStart * 4, iWidth); // can use dataview!? also - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array/Float32Array
            //QUESTION: Better if main asked for samples? (would save wasted posts)

            var pitchSamplesBuffer = new Float32Array(samplesBuffer.buffer, iMaxWlStart * 4, iWidth); // Would like to transfer this! I think it is fast because basically just sends pointer!!??
            /*if (slice[1] != 0) {
        let fred = 0;
      }*/
            if (Settings.iPitchMethod == Settings.iYinJsWorkerMethod) {
              let pitch = pitchComputeMethod(pitchSamplesBuffer);
              //samplesBuffer[SamplesBuffer.pitchInd] = pitch;
              this.port.postMessage(pitch);
            } else {
              // Send samples to main thread for computation
              this.port.postMessage(pitchSamplesBuffer); // ie we send (to main.onMessage) just enough of  most recent samples for pitch deduction! Avoids shared memory!!?
            }
          }
          break;
        default:
          console.log("Illegal samplesBufferMethod in mos-audio-worklet: " + samplesBufferMethod);
      }
      //}
    }
    return true;
  }
}

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
  //const yinBufferLength = window.iMaxSampleWl; //max_sample_wl_param;//bufferSize / 2;
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
} // end of class

registerProcessor("mos-audio-worklet", MosAudioWorkletProcessor);
