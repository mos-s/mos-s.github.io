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
import { RENDER_QUANTUM_FRAMES, MAX_CHANNEL_COUNT, SAMPLE_BLOCKS, HeapAudioBuffer, SamplesBuffer } from "./js/wasm-audio-helper.js";
import { yin } from "./js/pitch/yin.js";

const yDoTiming = true;
const MAX_SAMPLE_WL = 512; //600 - should b f(samplerate)
const iSamplesInBlock = 128;
const iBlocksInBuffer = 1;
const iSamplesInBuffer = iSamplesInBlock * iBlocksInBuffer;

const WASM_RING = 0;
const JS_RING = 1;
const samplesBufferMethod = JS_RING;
/**
 * A simple demonstration of WASM-powered AudioWorkletProcessor.
 *
 * @class WASMWorkletProcessor
 * @extends AudioWorkletProcessor
 */
class WASMWorkletProcessor extends AudioWorkletProcessor {
  /**
   * @constructor
   */
  constructor() {
    super();

    // Allocate the buffer for the heap access. Start with stereo, but it can
    // be expanded up to 32 channels.
    this._heapInputBuffer = new SamplesBuffer(Module, RENDER_QUANTUM_FRAMES, 1, SAMPLE_BLOCKS);
    this._heapOutputBuffer = new HeapAudioBuffer(Module, RENDER_QUANTUM_FRAMES, 2, MAX_CHANNEL_COUNT);

    //this.heap = Module._malloc(iSamplesInBuffer * 4);
    //this.pfSamples = Module.HEAPF32.subarray(this.heap >> 2, (this.heap + 128 * 4) >> 2);

    this._kernel = new Module.SimpleKernel();
    
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
  process(inputs, outputs, parameters) {
    // Just the left channel of the 2 d inputs array.
    var iIts = yDoTiming ? 1000 : 1;
    //performance.now()
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
          if (this.samplesBuffer == undefined) {
            this.iSamples = iSamplesInBlock * SAMPLE_BLOCKS;
            this.iBlocksContainingTwoMaxWaves = Math.ceil((MAX_SAMPLE_WL * 2) / iSamplesInBlock);
            //if (this.iBlocksContainingMaxSampleWl > SAMPLE_BLOCKS) {
            // window.alert("iBlocksContainingMaxSampleWl > SAMPLE_BLOCKS not allowed!");
            // }
            this.iActualBufferLength = this.iSamples + iSamplesInBlock * this.iBlocksContainingTwoMaxWaves;
            this.samplesBuffer = new Float32Array(this.iActualBufferLength);
            this.iBlock = 0;
            this.toProcess = 0;
            this.free = 0;
            this.free2 = 0;
          }
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
          let iMaxWlStart = this.free - MAX_SAMPLE_WL * 2;
          if (iMaxWlStart < 0) {
            iMaxWlStart += this.iSamples;
          }
          if (iMaxWlStart >= 0) {
            let pitch = yin(this.samplesBuffer, MAX_SAMPLE_WL, iMaxWlStart);
            //console.log("pitch = " + pitch);
          }
          //subarray(startByteOffset >> BYTES_PER_UNIT, endByteOffset >> BYTES_PER_UNIT);
          /*let a = [1,  2,  3,  4,  5]
let b = [10, 20, 30]

a.splice(0, b.length, ...b)*/

          break;
      }
    }
    if (yDoTiming) {
      //var ellapsedItsMs = performance.now() - startNsTime;
      //alert("ellapsedItsMs = " + ellapsedItsMs);
     // console.log("ellapsedItsMs = " + ellapsedItsMs);
     //this.fred();
    }

    return true;
  }
}

registerProcessor("wasm-worklet-processor", WASMWorkletProcessor);
