/*
DESCRIPTION 
  from lesson at - http://www.vizitsolutions.com/portfolio/webgl/gpgpu and the few files it refers to. (html and main.js were missing)

  Works with both FLOAT or UNIGNED_BYTES outputTexture. (set window.yOES_texture_float accordingly)

TODO
  if gpgpUtility.isFloatingTexture() fails currently does nothing - must make it try to use UNSIGNED_BYTE texture(s)

PROBLEMS
  Some older GPUs will say they have OES_texture_float extension but will fail to write to (and read from?) a FLOAT  texture (see http://www.vizitsolutions.com/portfolio/webgl/gpgpu )
*/
"use strict";

/*window.yOES_texture_float = true;
window.yNoInputTexture = true;
if (window.yNoInputTexture && !window.yOES_texture_float) {
  alert("warning - yNoInputTexture == true expects window.yOES_texture_float == true");
  //throw new Error("Stop script");
  window.yOES_texture_float = true;
}*/
//var shaders = require('Shaders');
import { shaders } from "./shaders.js";
import * as ShaderProgram from "./ShaderProgram.js";
import * as Tests from "./Tests.js";

var _1000j_Plus_i_NoInputTex = 0;
var _1000j_Plus_i_FloatInputAndOutputTex = 1;
var _1000j_Plus_i_FloatInputAndUnsignedByteOutputTex = 2;
var firstDotProducts = 3;
var dotProductsUniformFloatArrayInput = 4;
var floatInputAndOutputTexDotProduct = 5;
var fragShaderSrc, inputTexture;

var bufferStatus;
var framebuffer;
var gpgpUtility;
var initializer;

var outputTexture;
var iDim = 256; //16; //512;//256;//128;

// FLOAT no input tex:    512=41.53ms,  256=12.59ms, 128=3.35ms, 16=0.92ms - window.yOES_texture_float = true AND window.yNoInputTexture = true;
// FLOAT with input tex:  512=41.53ms,  256=11.97ms, 128=3.44ms, 16=0.96ms - window.yOES_texture_float = true AND window.yNoInputTexture = false;
// UNSIGNED_BYTE:         512=12.13ms,  256=3.33ms,  128=1.48ms, 16=0.96ms - window.yOES_texture_float = false AND window.yNoInputTexture = false;
var iTexWidth = iDim;
var iTexHeight = iDim;

var computeInputTexture = null;
var testRtn = null;
var yDoTiming = true;
var iTest = floatInputAndOutputTexDotProduct;
//var iTest = _1000j_Plus_i_FloatInputAndOutputTex//;
iTexWidth = 64; //iDim;
iTexHeight = 1; //iDim;

export function gpgpu(float32AudioBuffer) {
  //yDoTiming = yDoTimingParam;

  switch (iTest) {
    case _1000j_Plus_i_NoInputTex:
      window.yNoInputTexture = true;
      window.yOES_texture_float = true;
      computeInputTexture = function () {
        return null;
      };
      fragShaderSrc = shaders.fragmentShaderSourceForFloatOutputTexNoInputTex;
      testRtn = Tests.testFloat;
      break;
    case _1000j_Plus_i_FloatInputAndOutputTex:
      window.yNoInputTexture = false;
      window.yOES_texture_float = true;
      computeInputTexture = compute1000iPlusjInputTexture;
      fragShaderSrc = shaders.fragmentShaderSourceForFloatOutputTex;
      testRtn = Tests.testFloat;
      break;
    case _1000j_Plus_i_FloatInputAndUnsignedByteOutputTex:
      window.yNoInputTexture = false;
      window.yOES_texture_float = false;
      computeInputTexture = compute1000iPlusjInputTexture;
      fragShaderSrc = shaders.fragmentShaderSourceForByteOutputTex;
      testRtn = Tests.testByte;
      break;
    case firstDotProducts:
      window.yNoInputTexture = false;
      window.yOES_texture_float = true;
      computeInputTexture = computeFirstDotProductsInputTexture;
      fragShaderSrc = shaders.fragmentShaderSourceForFirstDotProducts;
      testRtn = Tests.testDotProducts;
      break;
    case dotProductsUniformFloatArrayInput:
      window.maxSampleWl = 64;
      iTexWidth = window.maxSampleWl;
      iTexHeight = 1;

      window.yNoInputTexture = true;
      window.yOES_texture_float = true;
      computeInputTexture = function () {
        return null;
      };
      fragShaderSrc = shaders.dotProductsUniformBufferInput;
      testRtn = Tests.testDotProducts;
      //yDoTiming = false;

      break;
    case floatInputAndOutputTexDotProduct:
      window.maxSampleWl = 512;
      iTexWidth = window.maxSampleWl;
      iTexHeight = 1;
      window.yNoInputTexture = false;
      window.yOES_texture_float = true;
      computeInputTexture = computeTexDotProductInputTextureSineWave;
      fragShaderSrc = shaders.floatInputAndOutputTexDotProduct;
      testRtn = Tests.testDotProducts;
      //SyDoTiming = false;
      break;

    default:
  }

  /*var f = new Float32Array([3210.0]);
var buffer = new Uint8Array(4);
var p 

    floatingPoint = new Float32Array(buffer.buffer);
*/

  //function doTheBusiness() {
  gpgpUtility = new vizit.utility.GPGPUtility(iTexWidth, iTexHeight, { premultipliedAlpha: false });
  if (gpgpUtility.isFloatingTexture()) {
    // Height and width are set in the constructor.
    outputTexture = gpgpUtility.makeTexture(window.yOES_texture_float ? WebGLRenderingContext.FLOAT : WebGLRenderingContext.UNSIGNED_BYTE, null);
    //outputTexture = gpgpUtility.makeSizedTexture(2, 2, WebGLRenderingContext.FLOAT, null);
    framebuffer = gpgpUtility.attachFrameBuffer(outputTexture); // So shader output goes here rather than screen!

    bufferStatus = gpgpUtility.frameBufferIsComplete();

    if (bufferStatus.isComplete) {
      //initializer = new ShaderProgram(gpgpUtility, fragShaderSrc);
      //initializer = shaderProgram.ShaderProgram(gpgpUtility, fragShaderSrc);
      ShaderProgram.init(gpgpUtility, fragShaderSrc);
      //var inputTexture;
      // if (!window.yNoInputTexture) {
      //  inputTexture = computeInputTexture();
      // }
      //initializer.run(matrixColumns, matrixRows, inputTexture);
      inputTexture = computeInputTexture(float32AudioBuffer);
      ShaderProgram.run(iTexWidth, iTexHeight, inputTexture);
      /*if (window.yNoInputTexture) {
      initializer.run(matrixColumns, matrixRows);
    } else {
      //var inputTexture = gpgpUtility.makeTexture(WebGLRenderingContext.UNSIGNED_BYTE , uiData);

      
    }*/
      // Delete resources no longer in use.
      ShaderProgram.done();
      var gl = ShaderProgram.getGl();
      //var testRtn = window.yOES_texture_float ? ShaderProgram.testFloat : ShaderProgram.testByte;
      // Tests, terminate on first failure.
      if (!(testRtn(gl, 0, 0) && testRtn(gl, iTexWidth - 1, iTexHeight - 1))) {
        alert("Failed!");
      }
      if (yDoTiming) {
        //if (getRequestParam("timing") == "true") {
        var startNsTime = performance.now();

        var iIts = 1000;
        for (var i = 0; i < iIts; i++) {
          //if (!testRtn(gl, iDim - 1, iDim - 1)) {
          if (!testRtn(gl, 0, 0)) {
            break;
          }
        }
        var ellapsedItsMs = performance.now() - startNsTime;
        alert("ellapsedItsMs = " + ellapsedItsMs);

        alert("successful its = " + i);
      }
    } else {
      alert(bufferStatus.message);
    }
  } else {
    alert("Floating point textures are not supported.");
  }
}

function compute1000iPlusjInputTexture() {
  var eltLen = 4;
  var fData = new Float32Array(iTexWidth * iTexHeight * eltLen);
  for (var j = 0; j < iTexHeight; j++) {
    for (var i = 0; i < iTexWidth; i++) {
      var iBase = (iTexHeight * j + i) * eltLen;
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
  var iWidth = iTexWidth * 2;
  var iHeight = iTexHeight;
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

function computeTexDotProductInputTextureSineWave(float32AudioBuffer) {
  var fData;
  if (float32AudioBuffer == undefined) {
    var radius = 0.5;
    var iWaves = 4;
    var eltLen = 4;
    var iWidth = iTexWidth * 2;
    fData = new Float32Array(iWidth * eltLen);
    var theta = 0;
    var thetaStep = (Math.PI * iWaves) / iWidth;
    var iElt = 0;
    for (var w = 0; w < iWidth; w++) {
      fData[iElt] = Math.sin(theta) * radius;
      iElt += eltLen;
      theta += thetaStep;
    }
  } else {
    fData = float32AudioBuffer;
  }
  return gpgpUtility.makeSizedTexture(iWidth, 1, WebGLRenderingContext.FLOAT, fData);
}

function getRequestParam(name) {
  if ((name = new RegExp("[?&]" + encodeURIComponent(name) + "=([^&]*)").exec(location.search))) return decodeURIComponent(name[1]);
}
