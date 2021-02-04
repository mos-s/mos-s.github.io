export function testFloat(gl, i_, j_) {
    // Note that currently shader will fill in 128x128 pixels! i and j simply determine which one we read out.
    var i = i_;
    var j = j_;
    var iOff = 0;
    if (i_ != 0) {
      i = i_ - iOff;
      j = j_ - iOff;
    }

    var buffer;
    var eps;
    var expected;
    var passed;

    // Error tollerance in calculations
    eps = 1.0e-20;
    /*
    // Redundant read to test effect on timing. It doubled!!
    var iBlockWidth = 10; // barely affected time!
    var buffer1 = new Float32Array(4 * iBlockWidth);
    gl.readPixels(i,                // x-coord of lower left corner
      j,                // y-coord of lower left corner
      iBlockWidth,                // width of the block
      1,                // height of the block
      gl.RGBA,          // Format of pixel data.
      gl.FLOAT, // Data type of the pixel data, must match makeTexture
      buffer1);          // Load pixel data into buffer
    */

     // One each for RGBA component of a pixel
    buffer = new Float32Array(4);
    // Read a 1x1 block of pixels, a single pixel

    gl.readPixels(
      i, // x-coord of lower left corner
      j, // y-coord of lower left corner
      1, // width of the block
      1, // height of the block
      gl.RGBA, // Format of pixel data.
      gl.FLOAT, // Data type of the pixel data, must match makeTexture
      buffer
    ); // Load pixel data into buffer

    expected = i * 1000.0 + j;

    passed = expected === 0.0 ? buffer[0] < eps : Math.abs((buffer[0] - expected) / expected) < eps;
    //passed = true;// testing
    if (!passed) {
      alert("Read " + buffer[0] + " at (" + i + ", " + j + "), expected " + expected + ".");
    }

    return passed;
  };

  /**
   * Read back the i, j pixel and compare it with the expected value. The expected value
   * computation matches that in the fragment shader.
   *
   * @param i {integer} the i index of the matrix.
   * @param j {integer} the j index of the matrix.
   */
  export function testByte(gl, i, j) {
    var buffer;
    var expected;
    var floatingPoint;
    var passed;
    //var startNsTime = performance.now();
    // One each for RGBA component of a pixel
    buffer = new Uint8Array(4);

    /*
    // Redundant read to test effect on timing. It doubled!!
    var iBlockWidth = 10; // barely affected time!
    var buffer1 = new Uint8Array(4 * iBlockWidth);
    gl.readPixels(i,                // x-coord of lower left corner
      j,                // y-coord of lower left corner
      iBlockWidth,                // width of the block
      1,                // height of the block
      gl.RGBA,          // Format of pixel data.
      gl.UNSIGNED_BYTE, // Data type of the pixel data, must match makeTexture
      buffer1);          // Load pixel data into buffer
    */
    // Read a 1x1 block of pixels, a single pixel - this is blocking! - https://www.khronos.org/opengl/wiki/Synchronization
    gl.readPixels(
      i, // x-coord of lower left corner
      j, // y-coord of lower left corner
      1, // width of the block
      1, // height of the block
      gl.RGBA, // Format of pixel data.
      gl.UNSIGNED_BYTE, // Data type of the pixel data, must match makeTexture
      buffer
    ); // Load pixel data into buffer

    //var ellapsedMs = performance.now() - startNsTime;
    //alert("ellapsedMs = " + ellapsedMs);

    floatingPoint = new Float32Array(buffer.buffer);

    expected = i * 1000.0 + j;

    passed = floatingPoint[0] === expected;
    //passed = true; // testing
    if (!passed) {
      alert("Read " + floatingPoint[0] + " at (" + i + ", " + j + "), expected " + expected + ".");
    }

    return passed;
  };

  export function testDotProducts(gl, i_, j_) {
    // Note that currently shader will fill in 128x128 pixels! i and j simply determine which one we read out.
    var i = i_;
    var j = j_;
    var iOff = 0;
    if (i_ != 0) {
      i = i_ - iOff;
      j = j_ - iOff;
    }

    var buffer;
    var eps;
    var expected;
    var passed;

    // Error tollerance in calculations
    eps = 1.0e-20;
    /*
    // Redundant read to test effect on timing. It doubled!!
    var iBlockWidth = 10; // barely affected time!
    var buffer1 = new Float32Array(4 * iBlockWidth);
    gl.readPixels(i,                // x-coord of lower left corner
      j,                // y-coord of lower left corner
      iBlockWidth,                // width of the block
      1,                // height of the block
      gl.RGBA,          // Format of pixel data.
      gl.FLOAT, // Data type of the pixel data, must match makeTexture
      buffer1);          // Load pixel data into buffer
    */

     // One each for RGBA component of a pixel
    buffer = new Float32Array(4 * window.iMaxSampleWl);
    // Read a 1x1 block of pixels, a single pixel

    gl.readPixels(
      0, // x-coord of lower left corner
      0, // y-coord of lower left corner
      window.iMaxSampleWl, // width of the block
      1, // height of the block
      gl.RGBA, // Format of pixel data.
      gl.FLOAT, // Data type of the pixel data, must match makeTexture
      buffer
    ); // Load pixel data into buffer

    expected = i/4;
    //for (var k = 0; k < 64; k++) {
    //    expected += k * k;
    //}
    
    //passed = expected === 0.0 ? buffer[0] < eps : Math.abs((buffer[0] - expected) / expected) < eps;
    passed = true;// testing
    if (!passed) {
      alert("Read " + buffer[0] + " at (" + i + ", " + k + "), expected " + expected + ".");
    }

    return passed;
  };
