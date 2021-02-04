/**
 * Copyright 2015 Vizit Solutions
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */



var gl;
var gpgpUtility;
var positionHandle;
var program;
var textureCoordHandle;
var textureHandle;

var heightHandle;
var widthHandle;
var aSamplesHandle, bSampleshandle;


export function init(gpgpUtility_, fragShaderSrc) {
  gpgpUtility = gpgpUtility_;
  gl = gpgpUtility.getGLContext();
  program = createProgram(gl, fragShaderSrc);

  /*const ext = gl.getExtension("EXT_color_buffer_float");
  if (!ext) {
    console.log("sorry, can't render to floating point textures");
    return;
  }*/

};
/**
   * Runs the program to do the actual work. On exit the framebuffer &amp;
   * texture are populated with the values drawn from the input texture,
   * but packed into an RGBA UNSIGNED_BYTE format. Use gl.readPixels to
   * retrieve texture values.
   */
  export function run(width, height, texture) {
    gl.useProgram(program);

    gpgpUtility.getStandardVertices();

    gl.vertexAttribPointer(positionHandle, 3, gl.FLOAT, gl.FALSE, 20, 0);
    gl.vertexAttribPointer(textureCoordHandle, 2, gl.FLOAT, gl.FALSE, 20, 12);

    if (window.yNoInputTexture) {
      gl.uniform1f(widthHandle, width); // Only needed for first example it computes from tex coords i, j (it has no input array)
      gl.uniform1f(heightHandle, height); // Only needed for first example it computes from tex coords i, j (it has no input array)
      var aSamples = [];
      var iSamples = window.iMaxSampleWl * 2;
      for (var i = 0; i < iSamples; i++) {
        aSamples[i] = i; 
      }
      //gl.uniform4fv(fooLoc, aSamples);
      gl.uniform1fv(aSamplesHandle, aSamples);
      //gl.uniform1fv(bSamplesHandle, aSamples);

    } else {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(textureHandle, 0);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
   /**
   * Compile shaders and link them into a program, then retrieve references to the
   * attributes and uniforms. The standard vertex shader, which simply passes on the
   * physical and texture coordinates, is used.
   *
   * @returns {WebGLProgram} The created program object.
   * @see {https://www.khronos.org/registry/webgl/specs/1.0/#5.6|WebGLProgram}
   */
  export function createProgram(gl, fragShaderSrc) {
    var fragmentShaderSource;
    var program;
    fragmentShaderSource = fragShaderSrc;

    program = gpgpUtility.createProgram(null, fragmentShaderSource);
    positionHandle = gpgpUtility.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionHandle);
    textureCoordHandle = gpgpUtility.getAttribLocation(program, "textureCoord");
    gl.enableVertexAttribArray(textureCoordHandle);
    textureHandle = gl.getUniformLocation(program, "texture");

    heightHandle = gpgpUtility.getUniformLocation(program, "height");
    widthHandle = gpgpUtility.getUniformLocation(program, "width");
    aSamplesHandle = gpgpUtility.getUniformLocation(program, "aSamples");
    return program;
  };
export function getGl() {
  return gl;
}
  export function done() {
    gl.deleteProgram(program);
  };

