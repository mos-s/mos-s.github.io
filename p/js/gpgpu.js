"use strict";
/*z
DESCRIPTION 
  from lesson at - http://www.vizitsolutions.com/portfolio/webgl/gpgpu and the few files it refers to. (html and main.js were missing)

  Works with both FLOAT or UNSIGNED_BYTES outputTexture. (set window.yOES_texture_float accordingly)

TODO
  if gpgpUtility.isFloatingTexture() fails currently does nothing - must make it try to use UNSIGNED_BYTE texture(s)

PROBLEMS
  Some older GPUs will say they have OES_texture_float extension but will fail to write to (and read from?) a FLOAT  texture (see http://www.vizitsolutions.com/portfolio/webgl/gpgpu )
*/


/*window.yOES_texture_float = true;
window.yNoInputTexture = true;
if (window.yNoInputTexture && !window.yOES_texture_float) {
  alert("warning - yNoInputTexture == true expects window.yOES_texture_float == true");
  //throw new Error("Stop script");
  window.yOES_texture_float = true;
}*/
//var shaders = require('Shaders');
import { shaders } from "./vizitJs/Shaders.js";
import * as ShaderProgram from "./vizitJs/ShaderProgram.js";
import * as Tests from "./vizitJs/Tests.js";
//import { window.Settings.iMaxSampleWl } from "./sound/Sound.js";

var _1000j_Plus_i_NoInputTex = 0;
var _1000j_Plus_i_FloatInputAndOutputTex = 1;
var _1000j_Plus_i_FloatInputAndUnsignedByteOutputTex = 2;
var firstDotProducts = 3;
var dotProductsUniformFloatArrayInput = 4;
var floatInputAndOutputTexDotProduct = 5;
var floatInputAndOutputTexDotProduct4 = 6;
var floatInputAndOutputTexDotProductFunction = 7;
var floatInputAndOutputTexDotProductFunctionRgba = 8;
var floatUniformInputAndTexOutputYin = 9;
var floatInputAndOutputTexDotProductFunctionRgba2 = 10;
var fragShaderSrc, inputTexture;

var outputTexture;
var iDim = 256; //16; //512;//256;//128;

// FLOAT no input tex:    512=41.53ms,  256=12.59ms, 128=3.35ms, 16=0.92ms - window.yOES_texture_float = true AND window.yNoInputTexture = true;
// FLOAT with input tex:  512=41.53ms,  256=11.97ms, 128=3.44ms, 16=0.96ms - window.yOES_texture_float = true AND window.yNoInputTexture = false;
// UNSIGNED_BYTE:         512=12.13ms,  256=3.33ms,  128=1.48ms, 16=0.96ms - window.yOES_texture_float = false AND window.yNoInputTexture = false;
var iOutputTexWidth = iDim;
var iOutputTexHeight = iDim;

var bufferStatus;
var framebuffer;
var gpgpUtility;
var initializer;

var computeInputTexture = null;
export var testRtn = null;
var yDoTiming = true;
var iIts = 1;
var iTest = floatInputAndOutputTexDotProductFunctionRgba2;
//var iTest = _1000j_Plus_i_FloatInputAndOutputTex//;
iOutputTexWidth = 64; //iDim;
iOutputTexHeight = 1; //iDim;

export function exec() {
  iOutputTexWidth = window.Settings.iMaxSampleWl;
  iOutputTexHeight = 1;
  switch (iTest) {
    case _1000j_Plus_i_NoInputTex:
      window.yNoInputTexture = true;
      window.yOES_texture_float = true;
      computeInputTexture = function () {
        return null;
      };
      fragShaderSrc = shaders.fragmentShaderSourceForFloatOutputTexNoInputTex;
      testRtn = Tests.testFloat;
      if (initShader()) {
        execShader();
      }
      break;
    case _1000j_Plus_i_FloatInputAndOutputTex:
      window.yNoInputTexture = false;
      window.yOES_texture_float = true;
      computeInputTexture = compute1000iPlusjInputTexture;
      fragShaderSrc = shaders.fragmentShaderSourceForFloatOutputTex;
      testRtn = Tests.testFloat;
      if (initShader()) {
        execShader();
      }
      break;
    case _1000j_Plus_i_FloatInputAndUnsignedByteOutputTex:
      window.yNoInputTexture = false;
      window.yOES_texture_float = false;
      computeInputTexture = compute1000iPlusjInputTexture;
      fragShaderSrc = shaders.fragmentShaderSourceForByteOutputTex;
      testRtn = Tests.testByte;
      if (initShader()) {
        execShader();
      }
      break;
    case firstDotProducts:
      window.yNoInputTexture = false;
      window.yOES_texture_float = true;
      computeInputTexture = computeFirstDotProductsInputTexture;
      fragShaderSrc = shaders.fragmentShaderSourceForFirstDotProducts;
      testRtn = Tests.testDotProducts;
      if (initShader()) {
        execShader();
      }
      break;
    case dotProductsUniformFloatArrayInput:

      window.yNoInputTexture = true;
      window.yOES_texture_float = true;
      computeInputTexture = function () {
        return null;
      };
      fragShaderSrc = shaders.dotProductsUniformBufferInput;
      testRtn = Tests.testDotProducts;
      //yDoTiming = false;
      if (initShader()) {
        execShader();
      }
      break;
    case floatInputAndOutputTexDotProduct:
      //iTexWidth = window.Settings.iMaxSampleWl;
      window.yNoInputTexture = false;
      window.yOES_texture_float = true;
      computeInputTexture = computeTexDotProductInputTextureSineWave;
      //fragShaderSrc = shaders.buildShader("floatInputAndOutputTexDotProduct", window.Settings.iMaxSampleWl);
      fragShaderSrc = shaders.floatInputAndOutputTexDotProduct(window.Settings.iMaxSampleWl);
      testRtn = Tests.testDotProducts;
      //SyDoTiming = false;
      if (initShader()) {
        execShader();
      }
      break;

    case floatInputAndOutputTexDotProduct4:
      //iTexWidth = window.Settings.iMaxSampleWl;
      iOutputTexWidth = window.Settings.iMaxSampleWl / 4;
      window.yNoInputTexture = false;
      window.yOES_texture_float = true;
      computeInputTexture = computeTexDotProductInputTextureSineWave;
      //fragShaderSrc = shaders.buildShader("floatInputAndOutputTexDotProduct", window.Settings.iMaxSampleWl);
      fragShaderSrc = shaders.floatInputAndOutputTexDotProduct4(window.Settings.iMaxSampleWl);
      testRtn = Tests.testDotProducts;
      //SyDoTiming = false;
      if (initShader()) {
        execShader();
      }
      break;

    case floatInputAndOutputTexDotProductFunction:
      //iTexWidth = window.Settings.iMaxSampleWl;
      window.yNoInputTexture = false;
      window.yOES_texture_float = true;
      computeInputTexture = null; //??computeTexDotProductInputTextureSineWave;
      //fragShaderSrc = shaders.buildShader("floatInputAndOutputTexDotProduct", window.Settings.iMaxSampleWl);
      fragShaderSrc = shaders.floatInputAndOutputTexDotProduct(window.Settings.iMaxSampleWl);
      testRtn = Tests.testDotProducts;
      yDoTiming = false;
      if (initShader()) {
        //execShader();
      }
      break;
    case floatInputAndOutputTexDotProductFunctionRgba:
      //iTexWidth = window.Settings.iMaxSampleWl;
      window.yNoInputTexture = false;
      window.yOES_texture_float = true;
      computeInputTexture = null; //??computeTexDotProductInputTextureSineWave;
      //fragShaderSrc = shaders.buildShader("floatInputAndOutputTexDotProduct", window.Settings.iMaxSampleWl);
      fragShaderSrc = shaders.floatInputAndOutputTexDotProduct_RGBA(window.Settings.iMaxSampleWl);
      testRtn = Tests.testDotProducts;
      yDoTiming = false;
      if (initShader()) {
        //execShader();
      }
      break;
    case floatUniformInputAndTexOutputYin:
      //iTexWidth = window.Settings.iMaxSampleWl;
      window.yNoInputTexture = true;
      window.yOES_texture_float = true;
      computeInputTexture = null; //??computeTexDotProductInputTextureSineWave;
      //fragShaderSrc = shaders.buildShader("floatInputAndOutputTexDotProduct", window.Settings.iMaxSampleWl);
      fragShaderSrc = shaders.floatUniformInputAndTexOutputYin(window.Settings.iMaxSampleWl);
      testRtn = Tests.testDotProducts;
      yDoTiming = false;
      if (initShader()) {
        //execShader();
      }
      break;
    case floatInputAndOutputTexDotProductFunctionRgba2:
       //iTexWidth = window.Settings.iMaxSampleWl;
      iOutputTexWidth = yWriteToFloatTexture? window.Settings.iMaxSampleWl / 4 : window.Settings.iMaxSampleWl;
      window.yNoInputTexture = false;
      window.yOES_texture_float = true;
      computeInputTexture = null; //??computeTexDotProductInputTextureSineWave;
      //fragShaderSrc = shaders.buildShader("floatInputAndOutputTexDotProduct", window.Settings.iMaxSampleWl);
      fragShaderSrc = shaders.floatInputAndOutputTexDotProduct_RGBA3(window.Settings.iMaxSampleWl);
      testRtn = getDotProductsRGBA; //Tests.testDotProducts;
      yDoTiming = false;
      if (initShader()) {
        //execShader();
      }
      break;

    //var v = new Float32Array(100);
    //v.slice()
    default:
  }
}

//exec();
/*var f = new Float32Array([3210.0]);
var buffer = new Uint8Array(4);
var p 

    floatingPoint = new Float32Array(buffer.buffer);
*/

function initShader() {
  let retVal = false;
  gpgpUtility = new vizit.utility.GPGPUtility(iOutputTexWidth, iOutputTexHeight, { premultipliedAlpha: false });
  if (gpgpUtility.isFloatingTexture()) {
    //let fred = gpgpUtility.getFloatingTexture();
    //alert("gpgpUtility.getFloatingTexture() = " + fred);

    // Height and width are set in the constructor.
    outputTexture = gpgpUtility.makeTexture(window.yOES_texture_float ? WebGLRenderingContext.FLOAT : WebGLRenderingContext.UNSIGNED_BYTE, null);
    //outputTexture = gpgpUtility.makeSizedTexture(2, 2, WebGLRenderingContext.FLOAT, null);
    framebuffer = gpgpUtility.attachFrameBuffer(outputTexture); // So shader output goes here rather than screen!

    bufferStatus = gpgpUtility.frameBufferIsComplete();

    if (bufferStatus.isComplete) {
      //initializer = new ShaderProgram(gpgpUtility, fragShaderSrc);
      //initializer = shaderProgram.ShaderProgram(gpgpUtility, fragShaderSrc);
      ShaderProgram.init(gpgpUtility, fragShaderSrc);
      retVal = true;
    } else {
      alert(bufferStatus.message);
    }
  } else {
    alert("Floating point textures are not supported.");
  }
  return retVal;
}

export function execShader(inputTexParam) {
  //var inputTexture;
  // if (!window.yNoInputTexture) {
  //  inputTexture = computeInputTexture();
  // }
  //initializer.run(matrixColumns, matrixRows, inputTexture);
  inputTexture = inputTexParam == null ? computeInputTexture() : inputTexParam;
  ///    ShaderProgram.run(iTexWidth, iTexHeight, inputTexture);
  /*if (window.yNoInputTexture) {
      initializer.run(matrixColumns, matrixRows);
    } else {
      //var inputTexture = gpgpUtility.makeTexture(WebGLRenderingContext.UNSIGNED_BYTE , uiData);

      
    }*/
  // Delete resources no longer in use.
  ///    ShaderProgram.done();
  var gl = ShaderProgram.getGl();
  //var testRtn = window.yOES_texture_float ? ShaderProgram.testFloat : ShaderProgram.testByte;
  // Tests, terminate on first failure.
  function test(testRtnParam, i, j) {
    ShaderProgram.run(iOutputTexWidth, iOutputTexHeight, inputTexture);
    return testRtnParam(gl, i, j);
  }
  if (!(test(testRtn, 0, 0) && test(testRtn, iOutputTexWidth - 1, iOutputTexHeight - 1))) {
    alert("Failed!");
  }
  if (yDoTiming) {
    var startNsTime = performance.now();

    var iIts = 1000;
    for (var i = 0; i < iIts; i++) {
      //if (!testRtn(gl, iDim - 1, iDim - 1)) {
      if (!test(testRtn, 0, 0)) {
        break;
      }
    }
    var ellapsedItsMs = performance.now() - startNsTime;
    alert("ellapsedItsMs = " + ellapsedItsMs);

    alert("successful its = " + i);
  }
}

export function execShader2(inputTexParam) {
  inputTexture = inputTexParam == null ? computeInputTexture() : inputTexParam;
  ///    ShaderProgram.done();
  function test(testRtnParam, i, j) {
    ShaderProgram.run(iOutputTexWidth, iOutputTexHeight, inputTexture);
    return testRtnParam(ShaderProgram.getGl(), i, j);
  }
  //yDoTiming = true;
  if (yDoTiming) {
    var startNsTime = performance.now();

    var iIts = 1000;
    for (var i = 0; i < iIts; i++) {
      //if (!testRtn(gl, iDim - 1, iDim - 1)) {
      if (!test(testRtn, 0, 0)) {
        break;
      }
    }
    var ellapsedItsMs = performance.now() - startNsTime;
    alert("ellapsedItsMs = " + ellapsedItsMs);

    alert("successful its = " + i);
  } else {
    ShaderProgram.run(iOutputTexWidth, iOutputTexHeight, inputTexture);
  }
}

function compute1000iPlusjInputTexture() {
  var eltLen = 4;
  var fData = new Float32Array(iOutputTexWidth * iOutputTexHeight * eltLen);
  for (var j = 0; j < iOutputTexHeight; j++) {
    for (var i = 0; i < iOutputTexWidth; i++) {
      var iBase = (iOutputTexHeight * j + i) * eltLen;
      fData[iBase] = i * 1000.0 + j;
      //fData[iBase + 1] = .6;
      //fData[iBase + 2] = .3;
      //fData[iBase + 3] = .4;
    }
  }
  /*
  var eltLen = 4;
  var uiData = new Uint8Array(matrixColumns * matrixRows * eltLen);
  for (var j = 0; j < matrixRows; j++) {
    for (var i = 0; i < matrixColumns; i++) {
      var iBase = (matrixRows * j + i) * eltLen;
      uiData[iBase] = 5;//i*1000.0 + j;
      uiData[iBase + 1] = 6;
      uiData[iBase + 2] = 7;
      uiData[iBase + 3] = 8;

      //floatingPoint = new Float32Array(buffer.buffer);
    }
  }
  */
  return gpgpUtility.makeTexture(WebGLRenderingContext.FLOAT, fData);
}

function computeFirstDotProductsInputTexture() {
  var eltLen = 4;
  var iWidth = 2;
  var iHeight = 2;
  var fData = new Float32Array(iWidth * iHeight * eltLen);
  for (var h = 0; h < iHeight; h++) {
    var g = h;
    for (var w = 0; w < iWidth; w++) {
      for (var i = 0; i < eltLen; i++) {
        var iElt = (iWidth * h + w) * eltLen + i;
        fData[iElt] = iElt;
      }
    }
  }
}

function computeTexDotProductInputTexture() {
  var eltLen = 4;
  var iWidth = iOutputTexWidth * 2;
  var iHeight = iOutputTexHeight;
  var fData = new Float32Array(iWidth * iHeight * eltLen);
  for (var h = 0; h < iHeight; h++) {
    for (var w = 0; w < iWidth; w++) {
      //for (var i = 0; i < eltLen; i++) {
      var iElt = (iWidth * h + w) * eltLen; // + i;
      fData[iElt] = iElt / 4;
      //}
    }
  }
  //return gpgpUtility.makeTexture(WebGLRenderingContext.FLOAT, fData);
  return gpgpUtility.makeSizedTexture(iWidth, iHeight, WebGLRenderingContext.FLOAT, fData);
}

function computeTexDotProductInputTextureSineWave() {
  var radius = 0.5;
  var iWaves = 4;
  var eltLen = 4;
  var iWidth = iOutputTexWidth * 2;
  var fData = new Float32Array(iWidth * eltLen);
  var theta = 0;
  var thetaStep = (Math.PI * iWaves) / iWidth;
  var iElt = 0;
  for (var w = 0; w < iWidth; w++) {
    fData[iElt] = Math.sin(theta) * radius;
    iElt += eltLen;
    theta += thetaStep;
  }
  return gpgpUtility.makeSizedTexture(iWidth, 1, WebGLRenderingContext.FLOAT, fData);
}

let fInputTexBuffer;
export function computeInputTexFromFloatSamples(samplesBuffer, startindex) {
  var inputTexEltLen = 4;
  var iWidth = iOutputTexWidth * 2;
  if (fInputTexBuffer == null) {
    fInputTexBuffer = new Float32Array(iWidth * inputTexEltLen); // does this zero? only need alloc once!

    var iElt = 0;
    for (var w = 0; w < iWidth; w++) {
      fInputTexBuffer[iElt] = samplesBuffer[startindex + w];
      iElt += inputTexEltLen;
    }
  }
  return gpgpUtility.makeSizedTexture(iWidth, 1, WebGLRenderingContext.FLOAT, fInputTexBuffer);
}

export function computeInputTexFromFloatSamples_RGBA(samplesBuffer, startindex) {
  var iWidth = window.Settings.iMaxSampleWl * 2;
  //var iByteWidth = 4;//iWidth * 4; // float is 4 bytes
  var fInputTexBuffer = new Float32Array(samplesBuffer.buffer, startindex * 4, iWidth); // can use dataview!? also - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array/Float32Array
  //console.log("ZZ=" + fInputTexBuffer[startindex]);
  // for debugging
  /*for (var i = 0; i < iWidth; i++) {
    fInputTexBuffer[i] = 0;
  }
  for (var i = 0; i < iWidth; i++) {
    fInputTexBuffer[i] = i;
  }*/
  /*
  var buffer = new ArrayBuffer(12);
  //var x = new Float32Array(buffer, 0, 2);
  var f = new Float32Array(buffer);
  f[0] = 1;
  f[1] = 2;
  f[2] = 3;
  
  var x2 = new Float32Array(f.buffer, 4, 1);
  // Make another view of last 4 bytes of the buffer
  var y = new Float32Array(buffer, 4, 1);
  //varz = new Float32Array(buffer, 3, 1);
  console.log(y[0]); // y is a live view on the buffer
  */
  return gpgpUtility.makeSizedTexture(iWidth / 4, 1, WebGLRenderingContext.FLOAT, fInputTexBuffer);
}

let fJsResults;
export function computeInputTexFromFloatSamples_RGBA_Worker(samplesBuffer) {
  var iWidth = window.Settings.iMaxSampleWl * 2;
  //var iByteWidth = 4;//iWidth * 4; // float is 4 bytes
  //var fInputTexBuffer = new Float32Array(samplesBuffer.buffer, startindex * 4, iWidth); // can use dataview!? also - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array/Float32Array

  /*
  if (samplesBuffer[3] != 0) {
    if (fJsResults == null) {
      fJsResults = new Float32Array(window.Settings.iMaxSampleWl);
    }
    let fTotal;
    for (let i = 0; i < window.Settings.iMaxSampleWl; i++) {
      fTotal = 0;
      for (let j = 0; j < window.Settings.iMaxSampleWl; j++) {
        let fDiff = samplesBuffer[j] - samplesBuffer[j + i]; //pixelA.r - pixelB.r;
        fTotal += fDiff * fDiff;
      }
      fJsResults[i] = fTotal;
    }
    
  }
*/
  var tex;
  if (gpgpUtility) {
    tex = gpgpUtility.makeSizedTexture(iWidth / 4, 1, WebGLRenderingContext.FLOAT, samplesBuffer); //fInputTexBuffer);
  }
  return tex;
}

export let resultBuffer, yinBuffer;
export function getDotProducts() {
  var gl = ShaderProgram.getGl();
  var buffer;
  var eps;
  var expected;
  var passed;

  // Error tollerance in calculations
  eps = 1.0e-20;

  if (resultBuffer == null) {
    // One each for RGBA component of a pixel
    //resultBuffer = new Float32Array(4 * window.Settings.iMaxSampleWl);
    resultBuffer = new Float32Array(window.Settings.iMaxSampleWl);
  }

  gl.readPixels(
    0, // x-coord of lower left corner
    0, // y-coord of lower left corner
    window.Settings.iMaxSampleWl, // width of the block
    1, // height of the block
    gl.RGBA, // Format of pixel data.
    gl.FLOAT, // Data type of the pixel data, must match makeTexture
    resultBuffer
  ); // Load pixel data into buffer

  return true; // for now
}

export function getDotProductsRGBA() {
  var gl = ShaderProgram.getGl();

  if (resultBuffer == null) {
    // One each for RGBA component of a pixel
    resultBuffer = new Float32Array(window.Settings.iMaxSampleWl);
  }

  gl.readPixels(
    0, // x-coord of lower left corner
    0, // y-coord of lower left corner
    window.Settings.iMaxSampleWl / 4, // width of the block
    1, // height of the block
    gl.RGBA, // Format of pixel data.
    gl.FLOAT, // Data type of the pixel data, must match makeTexture
    resultBuffer
  ); // Load pixel data into buffer
  if (resultBuffer[3] != 0) {
    var fred = 0;
    //resultBuffer = new Float32Array(fJsResults);;
  }
  //return true; // for now
  return resultBuffer;
}

export function yin2fromTs() {
  const threshold = 0.07;
  const sampleRate = 48000;
  const probabilityThreshold = 0.1;

  const yinBufferLength = window.Settings.iMaxSampleWl;
  /*if (yinBuffer == null) {
    yinBuffer = resultBuffernew Float32Array(yinBufferLength);
  }*/

  let probability = 0;
  let tau;

  /*let resultBufferIndex = 0;
  for (let i = 0; i < window.Settings.iMaxSampleWl; i++) {
    yinBuffer[i] = resultBuffer[resultBufferIndex];
    resultBufferIndex += 1; //4;
  }*/
  yinBuffer = resultBuffer;
  // Compute the cumulative mean normalized difference as described in step 3 of the paper.
  yinBuffer[0] = 1;
  yinBuffer[1] = 1;
  let runningSum = 0;
  for (let t = 1; t < yinBufferLength; t++) {
    runningSum += yinBuffer[t];
    yinBuffer[t] *= t / runningSum; //yinBuffer[t] = yinBuffer[t] * (t / runningSum);
  }

  // Compute the absolute threshold as described in step 4 of the paper.
  // Since the first two positions in the array are 1,
  // we can start at the third position.
  for (tau = 2; tau < yinBufferLength; tau++) {
    if (yinBuffer[tau] < threshold) {
      while (tau + 1 < yinBufferLength && yinBuffer[tau + 1] < yinBuffer[tau]) {
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
      probability = 1 - yinBuffer[tau];
      break;
    }
  }

  // if no pitch found, return null.
  if (tau === yinBufferLength || yinBuffer[tau] >= threshold) {
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
  if (tau + 1 < yinBufferLength) {
    x2 = tau + 1;
  } else {
    x2 = tau;
  }
  if (x0 === tau) {
    if (yinBuffer[tau] <= yinBuffer[x2]) {
      betterTau = tau;
    } else {
      betterTau = x2;
    }
  } else if (x2 === tau) {
    if (yinBuffer[tau] <= yinBuffer[x0]) {
      betterTau = tau;
    } else {
      betterTau = x0;
    }
  } else {
    const s0 = yinBuffer[x0];
    const s1 = yinBuffer[tau];
    const s2 = yinBuffer[x2];
    // fixed AUBIO implementation, thanks to Karl Helgason:
    // (2.0f * s1 - s2 - s0) was incorrectly multiplied with -1
    betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
  }

  return sampleRate / betterTau;
}

export function yin2fromC() {
  //https://raw.githubusercontent.com/ashokfernandez/Yin-Pitch-Tracking/master/Yin.c
  const threshold = 0.07;
  const sampleRate = 48000;
  const probabilityThreshold = 0.1;

  const yinBufferLength = window.Settings.iMaxSampleWl;
  if (yinBuffer == null) {
    yinBuffer = new Float32Array(yinBufferLength);
  }

  let probability = 0;
  let tau;

  let resultBufferIndex = 0;
  for (let i = 0; i < window.Settings.iMaxSampleWl; i++) {
    yinBuffer[i] = resultBuffer[resultBufferIndex];
    resultBufferIndex += 1; //4;
  }
  // Compute the cumulative mean normalized difference as described in step 3 of the paper.
  yinBuffer[0] = 1;
  yinBuffer[1] = 1; // This was inserted in ts version - why?
  let runningSum = 0;
  for (let t = 1; t < yinBufferLength; t++) {
    runningSum += yinBuffer[t];
    yinBuffer[t] *= t / runningSum; //yinBuffer[t] = yinBuffer[t] * (t / runningSum);
  }

  // Compute the absolute threshold as described in step 4 of the paper.
  // Since the first two positions in the array are 1,
  // we can start at the third position.
  for (tau = 2; tau < yinBufferLength; tau++) {
    if (yinBuffer[tau] < threshold) {
      while (tau + 1 < yinBufferLength && yinBuffer[tau + 1] < yinBuffer[tau]) {
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
      probability = 1 - yinBuffer[tau];
      break;
    }
  }

  // if no pitch found, return null.
  if (tau === yinBufferLength || yinBuffer[tau] >= threshold) {
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
  /*tau = tau - 1; // test
  if (tau < 0) {
    tau = 0;
  }*/

  let betterTau, x0, x2;
  if (tau < 1) {
    x0 = tau;
  } else {
    x0 = tau - 1;
  }
  if (tau + 1 < yinBufferLength) {
    x2 = tau + 1;
  } else {
    x2 = tau;
  }

  if (x0 === tau) {
    if (yinBuffer[tau] <= yinBuffer[x2]) {
      betterTau = tau;
    } else {
      betterTau = x2;
    }
  } else if (x2 === tau) {
    if (yinBuffer[tau] <= yinBuffer[x0]) {
      betterTau = tau;
    } else {
      betterTau = x0;
    }
  } else {
    const s0 = yinBuffer[x0];
    const s1 = yinBuffer[tau];
    const s2 = yinBuffer[x2];
    // fixed AUBIO implementation, thanks to Karl Helgason:
    // (2.0f * s1 - s2 - s0) was incorrectly multiplied with -1
    betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
  }

  /* 
  //from MyMath::CalcParabolaVertex in mindofsound C++ VS project
  let fX1 = x0, fX2 = tau, fX3 = x2;
  let fY1 = yinBuffer[fX1], fY2 = yinBuffer[fX2], fY3 = yinBuffer[fX3];
  let ffDenom = (fX1 - fX2) * (fX1 - fX3) * (fX2 - fX3);
  let ffA     = (fX3 * (fY2 - fY1) + fX2 * (fY1 - fY3) + fX1 * (fY3 - fY2)) / ffDenom;
  let ffB     = (fX3*fX3 * (fY1 - fY2) + fX2*fX2 * (fY3 - fY1) + fX1*fX1 * (fY2 - fY3)) / ffDenom;
  //let ffC     = (fX2 * fX3 * (fX2 - fX3) * fY1 + fX3 * fX1 * (fX3 - fX1) * fY2 + fX1 * fX2 * (fX1 - fX2) * fY3) / ffDenom;
  let fVertexX = -ffB / (2 * ffA);
  //let fVertexY = ffC - ffB * ffB / (4 * ffA);
  */

  //return (sampleRate - 40.9) / betterTau; //2000hz adjust
  return sampleRate / betterTau; // -40.9 adjust gives 439.64
}
