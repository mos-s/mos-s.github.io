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

import Module from "./simple-kernel.wasmmodule.js";
import { RENDER_QUANTUM_FRAMES, MAX_CHANNEL_COUNT, SAMPLE_BLOCKS, HeapAudioBuffer, SamplesBufferWasm } from "./wasm-audio-helper.js";
//import { iSamplesInBlock, MAX_CHANNEL_COUNT, SAMPLE_BLOCKS, HeapAudioBuffer, SamplesBuffer } from "./sound/Sound.js";
import { yin } from "./pitch/yin.js";
//import * as SamplesBuffer from "./SamplesBuffer.js";
//import { iSamplesInBlock, window.maxSampleWl } from "./Sound.js";
//import * as Settings from "../Settings.js";
let Settings;
let SamplesBuffer;

const yDoTiming = false;
//const window.maxSampleWl = 512; //600 - should b f(samplerate)
//const iSamplesInBlock = 128;
const iBlocksInBuffer = 1;
//const iSamplesInBuffer = iSamplesInBlock * iBlocksInBuffer;

const WASM_RING = 0;
const JS_RING = 1;
const samplesBufferMethod = JS_RING;
//let SAB;
/**
 * A simple demonstration of WASM-powered AudioWorkletProcessor.
 *
 * @class WASMWorkletProcessor
 * @extends AudioWorkletProcessor
 */
//AudioWorkletProcessor = Object;
class MosAudioWorkletProcessor extends AudioWorkletProcessor {
  /**
   * @constructor
   */
  constructor() {
    super();
    this.port.onmessage = (e) => {
      switch (e.data.cmd) {
        case "SamplesBuffer":
          SamplesBuffer = e.data.val;//init(e.data.val);
          this.free2 = 0; //??
          break;
        case "Settings":
          Settings = e.data.val;
          break;
        default:
          alert("Illegal cmd in mos-audio-worklet-processor");
        //SamplesBuffer.init(event.data.value);
      }
    };

    // Allocate the buffer for the heap access. Start with stereo, but it can
    // be expanded up to 32 channels.
    this._heapInputBuffer = new SamplesBufferWasm(Module, RENDER_QUANTUM_FRAMES, 1, SAMPLE_BLOCKS);
    this._heapOutputBuffer = new HeapAudioBuffer(Module, RENDER_QUANTUM_FRAMES, 2, MAX_CHANNEL_COUNT);

    //this.heap = Module._malloc(iSamplesInBuffer * 4);
    //this.pfSamples = Module.HEAPF32.subarray(this.heap >> 2, (this.heap + 128 * 4) >> 2);

    this._kernel = new Module.SimpleKernel();

    this.port.postMessage("Hi from mos-audio-worklet-processor!"); // to main?
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
    if (inputs[0][0] != null) {
      var iIts = yDoTiming ? 1000 : 1;
      //let startNsTime = window.performance.now(); window not defined
      for (let i = 0; i < iIts; i++) {
        switch (samplesBufferMethod) {
          case WASM_RING:
            //this.pfSamples.set(inputs[0][0]);

            //this._heapInputBuffer.getChannelData(0).set(inputs[0][0]); //this could put new samples in correct place in circular malloced wasm buffer!?
            let fred = this._heapInputBuffer.getChannelData(0);
            fred.set(inputs[0][0]);

            this._kernel.process(this._heapInputBuffer.getHeapAddress(), this._heapOutputBuffer.getHeapAddress(), 1);

            outputs[0][0].set(this._heapOutputBuffer.getChannelData(0));

            break;
          case JS_RING:
            let samplesBuffer = SamplesBuffer.f32SamplesBuffer;
            let free = samplesBuffer[SamplesBuffer.freeInd];
            samplesBuffer.set(inputs[0][0], free); // might this be faster with uint8?

            // Copy also to other end of ring buffer if appropriate
            if (this.free2 >= SamplesBuffer.iSamples && this.free2 < SamplesBuffer.iAugmentedSamples) {
              samplesBuffer.set(inputs[0][0], this.free2); // might this be faster with uint8?
              this.free2 += Settings.iSamplesInBlock;
            }

            free += Settings.iSamplesInBlock;
            if (free >= SamplesBuffer.iSamples) {
              this.free2 = free;
              free = 0;
            }
            samplesBuffer[SamplesBuffer.freeInd] = free;

            break;
        }
      }
    }
    return true;
  }
}

//}

registerProcessor("mos-audio-worklet-processor", MosAudioWorkletProcessor);
