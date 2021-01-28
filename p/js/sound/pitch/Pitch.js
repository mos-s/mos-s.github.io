"use strict";

import * as gpgpu from "../../gpgpu.js";

export const iGpgpuMethod = 0;
export const iYinMethod = 1;
export const iYBitstreamMethod = 2;

export let computeMethod = computeWithGpgpu;
export let dotProduct, iDotProductLength;

const yDoTiming = false;//true;
export function init() {
  dotProduct = new Float32Array(window.maxSampleWl);
  iDotProductLength = dotProduct.length;
  let method;

  switch (window.iPitchMethod) {
    case iGpgpuMethod:
      gpgpu.exec();
      method = computeWithGpgpu;
      break;
    case iYinMethod:
      method = yin;
      break;
    case iGpgpuMethod:
      break;
    default:
  }

  computeMethod = function (pitchSamplesBuffer) {
    var startNsTime = performance.now();
    let pitch;
    var iIts = yDoTiming ? 1000 : 1;
    for (var i = 0; i < iIts; i++) {
      pitch = method(pitchSamplesBuffer);
    }
    var ellapsedItsMs = performance.now() - startNsTime;
    if (pitch < 3000) {
      alert("\nellapsedItsMs = " + ellapsedItsMs);
    }
    return pitch;
  };
}

// ================================ gpgpu (ie shader!) =================================

function computeWithGpgpu(pitchSamplesBuffer) {
  let inputTex = gpgpu.computeInputTexFromFloatSamples_RGBA_Worker(pitchSamplesBuffer);
  gpgpu.execShader2(inputTex); // just calls Shader.run!
  gpgpu.getDotProductsRGBA(); // ie readpixels = should not be any wait (unless nore than samplesblock interval) for computation to finish

  //var startNsTime = performance.now();
  let pitch = gpgpu.yin2fromC(); // takes about 0.5ms on lenovo
  return pitch;
}

// ================================ yin JS =================================

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
  //const yinBufferLength = window.maxSampleWl; //max_sample_wl_param;//bufferSize / 2;
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
}
