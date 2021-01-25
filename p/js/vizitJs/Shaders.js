export var shaders = {};

shaders.fragmentShaderSourceForFloatOutputTexNoInputTex =
  "/*No input tex */\n" +
  "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
  "precision highp float;\n" +
  "#else\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "" +
  "uniform float height;" +
  "uniform float width;" +
  "" +
  "varying vec2 vTextureCoord;" +
  "" +
  "vec4 computeElement(float s, float t)" +
  "{" +
  "  float i = floor(width*s);" +
  "  float j = floor(height*t);" +
  "  return vec4(i*1000.0 + j, 0.0, 0.0, 0.0);" +
  "}" +
  "" +
  "void main()" +
  "{" +
  "  gl_FragColor = computeElement(vTextureCoord.s, vTextureCoord.t);" +
  "  /*gl_FragColor.r = vec4(floor(width*vTextureCoord.s)*1000.0 + floor(height*vTextureCoord.t), 0.0, 0.0, 0.0).r;*/" +
  "}";

shaders.fragmentShaderSourceForFloatOutputTexNoInputTexNew =
  "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
  "precision highp float;\n" +
  "#else\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "" +
  "uniform float height;" +
  "uniform float width;" +
  "" +
  "varying vec2 vTextureCoord;" +
  "" +
  "" +
  "void main()" +
  "{" +
  "  /*gl_FragColor = computeElement(vTextureCoord.s, vTextureCoord.t);*/" +
  "  gl_FragColor = vec4(floor(width*vTextureCoord.s)*1000.0 + floor(height*vTextureCoord.t), 0.0, 0.0, 0.0);" +
  "}";

shaders.fragmentShaderSourceForFloatOutputTex =
  "/*Float output tex */\n" +
  "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
  "precision highp float;\n" +
  "#else\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "" +
  "uniform sampler2D texture;" +
  "" +
  "varying vec2 vTextureCoord;" +
  "" +
  "void main()" +
  "{" +
  "      vec4 data = texture2D(texture, vTextureCoord); " +
  "      gl_FragColor.r = data.r;  /*gl_FragColor.r = data.r is no faster*/                       " +
  "}";

shaders.fragmentShaderSourceForByteOutputTex =
  "/*UNSIGNED_BYTE output tex */\n" +
  "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
  "precision highp float;\n" +
  "#else\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "" +
  "uniform sampler2D texture;" +
  "" +
  "varying vec2 vTextureCoord;" +
  "" +
  "vec4 pack(float value)" +
  "{" +
  "  if (value == 0.0) return vec4(0, 0, 0, 0);" +
  "" +
  "  float exponent;" +
  "  float mantissa;" +
  "  vec4  result;" +
  "  float sgn;" +
  "" +
  "  sgn = step(0.0, -value);" +
  "  value = abs(value);" +
  "" +
  "  exponent =  floor(log2(value));" +
  "" +
  "  mantissa =  value*pow(2.0, -exponent)-1.0;" +
  "  exponent =  exponent+127.0;" +
  "  result   = vec4(0,0,0,0);" +
  "" +
  "  result.a = floor(exponent/2.0);" +
  "  exponent = exponent - result.a*2.0;" +
  "  result.a = result.a + 128.0*sgn;" +
  "" +
  "  result.b = floor(mantissa * 128.0);" +
  "  mantissa = mantissa - result.b / 128.0;" +
  "  result.b = result.b + exponent*128.0;" +
  "" +
  "  result.g =  floor(mantissa*32768.0);" +
  "  mantissa = mantissa - result.g/32768.0;" +
  "" +
  "  result.r = floor(mantissa*8388608.0);" +
  "" +
  "  return result/255.0;" +
  "}" +
  "" +
  "" +
  "void main()" +
  "{" +
  "          vec4 data = texture2D(texture, vTextureCoord);" +
  "          gl_FragColor = pack(data.r);" +
  "}";

shaders.fragmentShaderSourceForFirstDotProducts =
  "/*First dot products */\n" +
  "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
  "precision highp float;\n" +
  "#else\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "" +
  "uniform sampler2D texture;" +
  "" +
  "varying vec2 vTextureCoord;" +
  "" +
  "void main()" +
  "{" +
  "  float fTotal = 0.0;                                     " +
  " /* Dot product */                      " +
  " /* for(int i=0;i<1;++i)  */               " +
  "  {                                     " +
  "   /* if ( (vTextureCoord.s == 0.0) && (vTextureCoord.t == 0.0) )*/ " +
  "    {  vec4 v = texture2D(texture, vTextureCoord);         " +
  "       fTotal += dot(v, v);                                " +
  "       gl_FragColor.r = fTotal;                           " +
  "       /*gl_FragColor.r = v.r;     */                        " +
  "    }                                                      " +
  "  }                                    " +
  "}";

/*
"  for ( i = 0, i < 128/4;i++) {                      " +
"    vec4 v = texture2D(texture, vTextureCoord);         " +
"    fTotal += dot(v, v);                                " +
"  }                                                     " +
*/
/*
v1 = texture2D(texture, vTextureCoord);
v2 = texture2D(texture, vec2(vTextureCoord.s + vInc, 0);
vIndex = vTextureCoord.s/
if (iOff == 0) {

} else if (iOff == 1) {
    vOut = 
}} else if (iOff == 2) {
}} else if (iOff == 3) {
}
*/
shaders.dotProductsUniformBufferInputNew =
  "/*dotProductsUniformBufferInput ie samples in buffer rather than tex*/\n" +
  "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
  "precision highp float;\n" +
  "#else\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "" +
  "/*uniform sampler2D texture;*/" +
  "/*uniform float aSamples[128];*/" +
  "" +
  "varying vec2 vTextureCoord;" +
  "" +
  "void main()" +
  "{" +
  "  float fTotal = 0.0;                      " +
  "/* int iStart = 0;      */                             " +
  " /* Dot product */                      " +
  " /* for(int i=0;i<1;++i)  */               " +
  "  {                                     " +
  "   /* if ( (vTextureCoord.s == 0.0) && (vTextureCoord.t == 0.0) )*/ " +
  "    {  /*vec4 v = texture2D(texture, vTextureCoord);*/         " +
  "    {  /*vec4 v = vec4(aSamples[iStart + 0], aSamples[iStart + 1], aSamples[iStart + 2], aSamples[iStart + 3]); */    " +
  "       /*fTotal += dot(v, v);  */                              " +
  "       gl_FragColor.r = fTotal;                           " +
  "       /*gl_FragColor.r = v.r;     */                        " +
  "    }                                                      " +
  "  }                                    " +
  "}";

// Hassles with array access in WebGL, and a couple of workarounds - https://www.john-smith.me/hassles-with-array-access-in-webgl-and-a-couple-of-workarounds.html
shaders.dotProductsUniformBufferInputWorked =
  "/*No input tex */\n" +
  "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
  "precision highp float;\n" +
  "#else\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "" +
  "uniform float height;" +
  "uniform float width;" +
  "uniform float aSamples[128];" +
  "" +
  "varying vec2 vTextureCoord;" +
  "" +
  "vec4 computeElement(float s, float t)" +
  "{" +
  "  float i = floor(width*s);" +
  "  float j = floor(height*t);" +
  "  return vec4(i*1000.0 + j, 0.0, 0.0, 0.0);" +
  "}" +
  "" +
  "  float fTotal = 0.0;                      " +
  "vec4 vDest[4]; " +
  "void main()" +
  "{" +
  "int iStart = int(vTextureCoord.s * 64.0);" +
  "/*vec4 v = vec4(aSamples[0], aSamples[1], aSamples[2], aSamples[3]); */" +
  "vec4 v; " +
  "  for (int i=0; i < 64;i++)  {           " +
  " if (iStart == i) {              " +
  "       v = vec4(aSamples[i], aSamples[i + 1], aSamples[i + 2], aSamples[i + 3]);" +
  "       break;                              " +
  "     }" +
  "  }" +
  " " +
  " " +
  "  gl_FragColor.r = dot(v, v);" +
  "  /*gl_FragColor.r = vec4(floor(width*vTextureCoord.s)*1000.0 + floor(height*vTextureCoord.t), 0.0, 0.0, 0.0).r;*/" +
  "}";

shaders.dotProductsUniformBufferInput2ndTry =
  "/*No input tex */\n" +
  "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
  "precision highp float;\n" +
  "#else\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "" +
  "uniform float height;" +
  "uniform float width;" +
  "uniform float aSamples[128];" +
  "" +
  "varying vec2 vTextureCoord;" +
  "" +
  "vec4 computeElement(float s, float t)" +
  "{" +
  "  float i = floor(width*s);" +
  "  float j = floor(height*t);" +
  "  return vec4(i*1000.0 + j, 0.0, 0.0, 0.0);" +
  "}" +
  "" +
  "vec4 vDest[4]; " +
  "void main()" +
  "{" +
  "  float fTotal = 0.0;                      " +
  "int iBwaveStart = int(vTextureCoord.s * 64.0);" +
  "int iBwaveEnd = iBwaveStart + 8;" +
  "/*vec4 v = vec4(aSamples[0], aSamples[1], aSamples[2], aSamples[3]); */" +
  "/*vec4 v;*/ " +
  "  for (int i=0; i < 128;i++)  {           " +
  "       if ( (iBwaveStart <= i) && (i < iBwaveEnd) ) {   " +
  "        /*   for (int j=0; j < 4;j++)  {  */         " +
  "               float fz = aSamples[i + 1] ;         " +
  "           vec4 v = vec4(aSamples[i], 1 ,2,3); /*(aSamples[i], aSamples[i + 1], aSamples[i + 2], aSamples[i + 3]);*/" +
  "           fTotal += dot(v, v); " +
  "           /*  v = vec4(aSamples[i + 1], aSamples[i + 2], aSamples[i + 3], aSamples[i + 4]);*/     " +
  "           /*  fTotal += dot(v, v);*/          " +
  "       /*} */                              " +
  "    }                               " +
  "  }" +
  " " +
  " " +
  "  gl_FragColor.r = fTotal;" +
  "  /*gl_FragColor.r = vec4(floor(width*vTextureCoord.s)*1000.0 + floor(height*vTextureCoord.t), 0.0, 0.0, 0.0).r;*/" +
  "}";

//dotProductsUniformBufferInputSumOfSquares
shaders.dotProductsUniformBufferInput_works =
  "/*No input tex */\n" +
  "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
  "precision highp float;\n" +
  "#else\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "" +
  "uniform float height;" +
  "uniform float width;" +
  "uniform float aSamples[128];" +
  "" +
  "varying vec2 vTextureCoord;" +
  "" +
  "vec4 computeElement(float s, float t)" +
  "{" +
  "  float i = floor(width*s);" +
  "  float j = floor(height*t);" +
  "  return vec4(i*1000.0 + j, 0.0, 0.0, 0.0);" +
  "}" +
  "" +
  "vec4 vDest[4]; " +
  "void main()" +
  "{" +
  "  float fTotal = 0.0;                      " +
  "int iBwaveStart = int(vTextureCoord.s * 64.0);" +
  "int iBwaveEnd = iBwaveStart + 64;" +
  "/*vec4 v = vec4(aSamples[0], aSamples[1], aSamples[2], aSamples[3]); */" +
  "/*vec4 v;*/ " +
  "  for (int i=0; i < 128;i++)  {           " +
  "       if ( (iBwaveStart <= i) && (i < iBwaveEnd) ) {   " +
  "        /*   for (int j=0; j < 4;j++)  {  */         " +
  "               /*float fz = aSamples[i + 1] ; */        " +
  "           /*vec4 v = vec4(aSamples[i], 1 ,2,3); *//*(aSamples[i], aSamples[i + 1], aSamples[i + 2], aSamples[i + 3]);*/" +
  "          /* fTotal += dot(v, v); */" +
  "           fTotal +=  aSamples[i] * aSamples[i];          " +
  "           /*  v = vec4(aSamples[i + 1], aSamples[i + 2], aSamples[i + 3], aSamples[i + 4]);*/     " +
  "           /*  fTotal += dot(v, v);*/          " +
  "       /*} */                              " +
  "    }                               " +
  "  }" +
  " " +
  " " +
  "  gl_FragColor.r = fTotal;" +
  "  /*gl_FragColor.r = vec4(floor(width*vTextureCoord.s)*1000.0 + floor(height*vTextureCoord.t), 0.0, 0.0, 0.0).r;*/" +
  "}";

shaders.dotProductsUniformBufferInput =
  "/*No input tex */\n" +
  "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
  "precision highp float;\n" +
  "#else\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "" +
  "uniform float height;" +
  "uniform float width;" +
  "uniform float aSamples[128];" +
  "" +
  "varying vec2 vTextureCoord;" +
  "" +
  "vec4 computeElement(float s, float t)" +
  "{" +
  "  float i = floor(width*s);" +
  "  float j = floor(height*t);" +
  "  return vec4(i*1000.0 + j, 0.0, 0.0, 0.0);" +
  "}" +
  "" +
  "vec4 vDest[4]; " +
  "void main()" +
  "{" +
  "  float fTotal = 0.0;               " +
  "int iBwaveStart = int(vTextureCoord.s * 64.0);" +
  "int iBwaveEnd = iBwaveStart + 64;" +
  "float bSamples[128 + 64];                    " +
  "for (int ii=0; ii < 128;ii++) {     " +
  "    /*bSamples[ii + iBwaveStart] = aSamples[ii];   */  " +
  "    bSamples[ii] = aSamples[ii];     " +
  "} " +
  "/*vec4 v = vec4(aSamples[0], aSamples[1], aSamples[2], aSamples[3]); */" +
  "/*vec4 v;*/ " +
  "  for (int i=0; i < 128;i++)  {           " +
  "       if ( (iBwaveStart <= i) && (i < iBwaveEnd) ) {   " +
  "        /*   for (int j=0; j < 4;j++)  {  */         " +
  "               /*float fz = aSamples[i + 1] ; */        " +
  "           /*vec4 v = vec4(aSamples[i], 1 ,2,3); *//*(aSamples[i], aSamples[i + 1], aSamples[i + 2], aSamples[i + 3]);*/" +
  "          /* fTotal += dot(v, v); */" +
  "           fTotal +=  aSamples[i] * bSamples[i];          " +
  "           /*  v = vec4(aSamples[i + 1], aSamples[i + 2], aSamples[i + 3], aSamples[i + 4]);*/     " +
  "           /*  fTotal += dot(v, v);*/          " +
  "       /*} */                              " +
  "    }                               " +
  "  }" +
  " " +
  " " +
  "  gl_FragColor.r = fTotal;" +
  "  /*gl_FragColor.r = vec4(floor(width*vTextureCoord.s)*1000.0 + floor(height*vTextureCoord.t), 0.0, 0.0, 0.0).r;*/" +
  "}";

shaders.floatInputAndOutputTexDotProduct = function (max_wl) {
  let iMaxWl = max_wl.toFixed(0);
  let fMaxWl = max_wl.toFixed(1);
  return `
  /*Float output tex */
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  
  uniform sampler2D texture;
  
  varying vec2 vTextureCoord;
  const int iMaxWl = ${iMaxWl};
  const float fMaxWl = ${fMaxWl};
  
  void main()
  { /* iMaxSampleWl = iMaxFrameWl * poSamples->iFrameSamples; 600 AND MIN 12 */
      float fBaseTexS = vTextureCoord.s/2.0;  /* because input tex twice as wide as output tex */
      float fInputTexStep = 1.0/(fMaxWl * 2.0); 
      float fTotal = 0.0;
      float fAwaveS = 0.0;
      float fBwaveS = fBaseTexS;
      /*int iMaxWl = int(fMaxWl);*/
      for (int i=0; i < iMaxWl; i++) {
          float fSampleA = texture2D(texture, vec2(fAwaveS)).r;
          float fSampleB = texture2D(texture, vec2(fBwaveS)).r;
          
          /*fTotal += fSampleA * fSampleA * fSampleB * fSampleB;*/
          
          float fDiff = fSampleA - fSampleB;
          fTotal += fDiff * fDiff;
          
          /*fTotal += fSampleA * fSampleB;*/
          
          fAwaveS += fInputTexStep;
          fBwaveS += fInputTexStep;
      }
      
      /*fAwaveOffset += fInputTexStep * 0.0; */
      /*gl_FragColor.r = texture2D(texture, vec2(fBaseTexS + fAwaveOffset)).r; */                      
      /*gl_FragColor.r = texture2D(texture, vec2(1.0, 0.0)).r; */
      gl_FragColor.r = fTotal;                       
  }
  `;
};

// This one runs in 5.5ms as opposed to 5.9ms - needs to write into each of rgba ...
shaders.floatInputAndOutputTexDotProduct4 = function (max_wl) {
  let iMaxWl = max_wl.toFixed(0);
  let fMaxWl = max_wl.toFixed(1);
  return `
  /*Float output tex */
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  
  uniform sampler2D texture;
  
  varying vec2 vTextureCoord;
  const int iMaxWl = ${iMaxWl};
  const float fMaxWl = ${fMaxWl};
  
  void main()
  { /* iMaxSampleWl = iMaxFrameWl * poSamples->iFrameSamples; 600 AND MIN 12 */
    float fTotal;
    float fBaseTexS = vTextureCoord.s/2.0;  /* because input tex twice as wide as output tex */
    float fInputTexStep = 1.0/(fMaxWl * 2.0); 

     for (int j=0; j < 4; j++) {
   
      fTotal = 0.0;
      float fAwaveS = 0.0;
      float fBwaveS = fBaseTexS;
      /*int iMaxWl = int(fMaxWl);*/
      for (int i=0; i < iMaxWl; i++) {
          float fSampleA = texture2D(texture, vec2(fAwaveS)).r;
          float fSampleB = texture2D(texture, vec2(fBwaveS)).r;
          
          /*fTotal += fSampleA * fSampleA * fSampleB * fSampleB;*/
          
          float fDiff = fSampleA - fSampleB;
          fTotal += fDiff * fDiff;
          
          /*fTotal += fSampleA * fSampleB;*/
          
          fAwaveS += fInputTexStep;
          fBwaveS += fInputTexStep;
      }
    }
      /*fAwaveOffset += fInputTexStep * 0.0; */
      /*gl_FragColor.r = texture2D(texture, vec2(fBaseTexS + fAwaveOffset)).r; */                      
      /*gl_FragColor.r = texture2D(texture, vec2(1.0, 0.0)).r; */
      gl_FragColor.r = fTotal;                       
  }
  `;
};

shaders.floatInputAndOutputTexDotProduct_RGBA = function (max_wl) {
  let iMaxWl = max_wl.toFixed(0);
  let fMaxWl = max_wl.toFixed(1);
  return `
  /*Float output tex */
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  
  uniform sampler2D texture;
  
  varying vec2 vTextureCoord;
  const int iMaxWl = ${iMaxWl};
  const float fMaxWl = ${fMaxWl};
  
  float afSamples[1024];
  void main()
  { /* iMaxSampleWl = iMaxFrameWl * poSamples->iFrameSamples; 600 AND MIN 12 */
    float fBase = floor(vTextureCoord.s * fMaxWl/2.0);  
      float fInputTexStep = 1.0/(fMaxWl * 2.0); 
      float fTotal = 0.0;
      float fAwaveS = 0.0;
      /*float *pfA = afSamples;*/
      int ind = 0;
      for (int i=0; i < iMaxWl / 2; i++) {
        vec4 vRgba = texture2D(texture, vec2(fAwaveS));
        afSamples[0] = vRgba.r;
        afSamples[1] = vRgba.g;
        afSamples[2] = vRgba.b;
        afSamples[3] = vRgba.a;
        
        fAwaveS += fInputTexStep;
        vRgba = texture2D(texture, vec2(fAwaveS));
        afSamples[4] = vRgba.r;
        afSamples[5] = vRgba.g;
        afSamples[6] = vRgba.b;
        afSamples[7] = vRgba.a;
        
        fAwaveS += fInputTexStep;
        vRgba = texture2D(texture, vec2(fAwaveS));
        afSamples[8] = vRgba.r;
        afSamples[9] = vRgba.g;
        afSamples[10] = vRgba.b;
        afSamples[12] = vRgba.a;
    
        
      }
      /*
      float j = fBase;
      for (int i=0; i < iMaxWl; i++) {
          float fSampleA = aSamples[i];
          float fSampleB = aSamples[j];
          
          
          float fDiff = fSampleA - fSampleB;
          fTotal += fDiff * fDiff;
          
          
          j += 1.0;
      }*/
      
      /*fAwaveOffset += fInputTexStep * 0.0; */
      /*gl_FragColor.r = texture2D(texture, vec2(fBaseTexS + fAwaveOffset)).r; */                      
      /*gl_FragColor.r = texture2D(texture, vec2(1.0, 0.0)).r; */
      gl_FragColor.r = fTotal;                       
  }
  `;
};

shaders.floatUniformInputAndTexOutputYin = function (max_wl) {
  let iMaxWl = max_wl.toFixed(0);
  let fMaxWl = max_wl.toFixed(1);
  return `
    /*Float output tex */
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    
    uniform float width;
    
    varying vec2 vTextureCoord;
    const int iMaxWl = ${iMaxWl};
    const float fMaxWl = ${fMaxWl};

    uniform float aSamples[iMaxWl/8];
    uniform vec2 vSamples[iMaxWl/2];

    void main() {

        const int iA = 0;
        const int iB = 10;/*int(width * vTextureCoord.s);*/
        float fTotal = 0.0;

        for (int i=0; i < iMaxWl; i++) {
            
            float fSampleA = aSamples[iA];  /*texture2D(texture, vec2(fAwaveS)).r;*/
            float fSampleB = aSamples[iB];  /*texture2D(texture, vec2(fBwaveS)).r;*/
            
            /*fTotal += fSampleA * fSampleA * fSampleB * fSampleB;*/
            
            float fDiff = fSampleA - fSampleB;
            fTotal += fDiff * fDiff;
            
            /*fTotal += fSampleA * fSampleB;*/
            
        }
        
        gl_FragColor.r = fTotal;                       
    }
    `;
};
/*
if off < step1 {
  fSampleA = texture2D(texture, vec2(fAwaveS)).r;
} else if off < step2 {
  fSampleA = texture2D(texture, vec2(fAwaveS)).g;
} else if off < step3 {
  fSampleA = texture2D(texture, vec2(fAwaveS)).b;
} else if off < step4 {
  fSampleA = texture2D(texture, vec2(fAwaveS)).a;
}
*/

shaders.floatInputAndOutputTexDotProduct_RGBA2 = function (max_wl) {
  let iMaxWl = max_wl.toFixed(0);
  let fMaxWl = max_wl.toFixed(1);
  return `
  /*Float output tex */
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  
  uniform sampler2D texture;
  
  varying vec2 vTextureCoord;
  const int iMaxWl = ${iMaxWl};
  const float fMaxWl = ${fMaxWl};
  
  void main()
  {
    /*  
    Assumptions:
      1. That texture2D(texture, vec2(fBwaveS) == texture2D(texture, vec2(floor(fBwaveS))
    
    
    */
    float fBaseTexS = vTextureCoord.s/(2.0 * 4.0);  /* because input tex twice as wide as output tex and 4 samples per pixel*/
    const float fOutputPixels = fMaxWl/4.0;
    const int iOutputPixels = iMaxWl/4;
    const float fInputPixels = fOutputPixels * 2.0;
    const float fOutputTexPixelStep = 1.0/fOutputPixels; /* eg for fMaxWl=512 will be 128 pixels*/
    const float fInputTexPixelStep = 1.0/fInputPixels; /* eg for fMaxWl=512 will be 256 pixels*/
    /*const float fOutputTexColorStep = fOutputTexPixelStep/4.0; *//* Can use this to increment through Awave below.*/
    const float fInputTexColorStep = fInputTexPixelStep/4.0; /* Can use this to increment through Bwave below.
    
    /*float fInputTexStep = 1.0/fMaxWl;*/ /* eg for fMaxWl=512 have input tex is 1024/4 ie  will have 256 pixels*/
    float fBwaveBaseS = fBaseTexS;
    /*float fBwaveBaseStep = 1.0/(fMaxWl * 2.0); *//* should be quarter of fInputTexStep*/
    float fBwaveOffsetS = 0.0;
    // process A wave pixel (ie 4 samples)
    vec4 pixelA, pixelB; 
    float fDiff;
    /* ===============================  1  =============================== */
    float fTotal_r = 0.0;
    float fAwaveS = 0.0;
    float fBwaveS = fBaseTexS;
    for (int i=0; i < iOutputPixels; i++) {
      pixelA = texture2D(texture, vec2(fAwaveS));
      pixelB = texture2D(texture, vec2(fBwaveS));
      
      fDiff = pixelA.r - pixelB.r;
      fTotal_r += fDiff * fDiff;
      fDiff = pixelA.g - pixelB.g;
      fTotal_r += fDiff * fDiff;
      fDiff = pixelA.b - pixelB.b;
      fTotal_r += fDiff * fDiff;
      fDiff = pixelA.a - pixelB.a;
      fTotal_r += fDiff * fDiff;

      fAwaveS += fInputTexPixelStep;
      fBwaveS += fInputTexPixelStep;
    }
    /* ===============================  2  =============================== */
    float fTotal_g = 0.0;
    fAwaveS = 0.0;
    fBwaveOffsetS += fInputTexColorStep;
    fBwaveS = fBaseTexS + fBwaveOffsetS;
    pixelA = texture2D(texture, vec2(fAwaveS));
    pixelB = texture2D(texture, vec2(fBwaveS));
    for (int i=0; i < iOutputPixels; i++) {
      
      fDiff = pixelA.r - pixelB.g;
      fTotal_g += fDiff * fDiff;
      fDiff = pixelA.g - pixelB.b;
      fTotal_g += fDiff * fDiff;
      fDiff = pixelA.b - pixelB.a;
      fTotal_g += fDiff * fDiff;

      fBwaveS += fInputTexPixelStep;
      pixelB = texture2D(texture, vec2(fBwaveS));
      fDiff = pixelA.a - pixelB.r;
      fTotal_g += fDiff * fDiff;

      fAwaveS += fInputTexPixelStep;
      pixelA = texture2D(texture, vec2(fAwaveS));
    }
    fDiff = pixelA.r - pixelB.g;
    fTotal_g += fDiff * fDiff;
  /* ===============================  3  =============================== */
    float fTotal_b = 0.0;
    fAwaveS = 0.0;
    fBwaveOffsetS += fInputTexColorStep;
    fBwaveS = fBaseTexS + fBwaveOffsetS;
    pixelA = texture2D(texture, vec2(fAwaveS));
    pixelB = texture2D(texture, vec2(fBwaveS));
    for (int i=0; i < iOutputPixels; i++) {
      
      fDiff = pixelA.r - pixelB.b;
      fTotal_b += fDiff * fDiff;
      fDiff = pixelA.g - pixelB.a;
      fTotal_b += fDiff * fDiff;
      
      fBwaveS += fInputTexPixelStep;
      pixelB = texture2D(texture, vec2(fBwaveS));

      fDiff = pixelA.b - pixelB.r;
      fTotal_b += fDiff * fDiff;
      fDiff = pixelA.a - pixelB.g;
      fTotal_b += fDiff * fDiff;

      fAwaveS += fInputTexPixelStep;
      pixelA = texture2D(texture, vec2(fAwaveS));
    }
    fDiff = pixelA.r - pixelB.b;
    fTotal_b += fDiff * fDiff;
    fDiff = pixelA.g - pixelB.a;
    fTotal_b += fDiff * fDiff;
    /* ===============================  4  =============================== */
    float fTotal_a = 0.0;
    fAwaveS = 0.0;
    fBwaveOffsetS += fInputTexColorStep;
    fBwaveS = fBaseTexS + fBwaveOffsetS;
    pixelA = texture2D(texture, vec2(fAwaveS));
    pixelB = texture2D(texture, vec2(fBwaveS));
    for (int i=0; i < iOutputPixels; i++) {
      
      fDiff = pixelA.r - pixelB.a;
      fTotal_a += fDiff * fDiff;
      
      fBwaveS += fInputTexPixelStep;
      pixelB = texture2D(texture, vec2(fBwaveS));

      fDiff = pixelA.g - pixelB.r;
      fTotal_a += fDiff * fDiff;
      fDiff = pixelA.b - pixelB.g;
      fTotal_a += fDiff * fDiff;
      fDiff = pixelA.a - pixelB.b;
      fTotal_a += fDiff * fDiff;

      fAwaveS += fInputTexPixelStep;
      pixelA = texture2D(texture, vec2(fAwaveS));
    }
    fDiff = pixelA.r - pixelB.a;
    fTotal_a += fDiff * fDiff;

    fBwaveS += fInputTexPixelStep;
    pixelB = texture2D(texture, vec2(fBwaveS));

    fDiff = pixelA.g - pixelB.r;
    fTotal_a += fDiff * fDiff;
    fDiff = pixelA.b - pixelB.g;
    fTotal_a += fDiff * fDiff;
    fDiff = pixelA.a - pixelB.b;
    fTotal_a += fDiff * fDiff;

    gl_FragColor = vec4(fTotal_r, fTotal_g, fTotal_b, fTotal_a); 

    /*gl_FragColor = vec4(fTotal_r, 0, 0, 0); */

  }
  `;
};

shaders.floatInputAndOutputTexDotProduct_RGBA3 = function (max_wl) {
  let iMaxWl = max_wl.toFixed(0);
  let fMaxWl = max_wl.toFixed(1);
  return `
  /*Float output tex */
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  
  uniform sampler2D texture;
  
  varying vec2 vTextureCoord;
  const int iMaxWl = ${iMaxWl};
  const float fMaxWl = ${fMaxWl};
  
  const float fOutputPixels = fMaxWl / 4.0;
  const int iOutputPixels = iMaxWl/4; /* eg for fMaxWl=512 will be 128 pixels*/
  const float fInputPixels = fOutputPixels * 2.0; /* eg for fMaxWl=512 will be 256 pixels*/
  /*const float fOutputTexPixelStep = 1.0 / fOutputPixels; */                                           
  const float fInputTexPixelStep = 1.0 / fInputPixels;                                              
  const float fEpsilon = 0.0; /*fInputTexPixelStep/4.0;*/

  void main() {
     float fBaseTexS = vTextureCoord.s / (2.0); /* because input tex twice as wide as output tex (we need 2 full waves of samples to deduce pitch) */ 
                                                                                                     
     vec4 pixelA, pixelB, pixelBnext;
     float fDiff;
     float fTotal_r = 0.0;
     float fTotal_g = 0.0;
     float fTotal_b = 0.0;
     float fTotal_a = 0.0;
     float fAwaveS = fEpsilon;
     float fBwaveS = fBaseTexS + fEpsilon;
  
     pixelA = texture2D(texture, vec2(fAwaveS, 0.0));
     pixelB = texture2D(texture, vec2(fBwaveS, 0.0));
     fBwaveS += fInputTexPixelStep;
     pixelBnext = texture2D(texture, vec2(fBwaveS, 0.0));
  
     for (int i = 0; i < iOutputPixels; i++)
     {
        /* =======================  1  ====================== */
        fDiff = pixelA.r - pixelB.r;
        fTotal_r += fDiff * fDiff;
  
        fDiff = pixelA.r - pixelB.g;
        fTotal_g += fDiff * fDiff;
  
        fDiff = pixelA.r - pixelB.b;
        fTotal_b += fDiff * fDiff;
  
        fDiff = pixelA.r - pixelB.a;
        fTotal_a += fDiff * fDiff;
        /* =======================  2  ====================== */
        fDiff = pixelA.g - pixelB.g;
        fTotal_r += fDiff * fDiff;
  
        fDiff = pixelA.g - pixelB.b;
        fTotal_g += fDiff * fDiff;
  
        fDiff = pixelA.g - pixelB.a;
        fTotal_b += fDiff * fDiff;
  
        fDiff = pixelA.g - pixelBnext.r;
        fTotal_a += fDiff * fDiff;
        /* ========================  3  ===================== */
        fDiff = pixelA.b - pixelB.b;
        fTotal_r += fDiff * fDiff;
  
        fDiff = pixelA.b - pixelB.a;
        fTotal_g += fDiff * fDiff;
  
        fDiff = pixelA.b - pixelBnext.r;
        fTotal_b += fDiff * fDiff;
  
        fDiff = pixelA.b - pixelBnext.g;
        fTotal_a += fDiff * fDiff;
  
        /* ======================  4  ======================= */
        fDiff = pixelA.a - pixelB.a;
        fTotal_r += fDiff * fDiff;
  
        fDiff = pixelA.a - pixelBnext.r;
        fTotal_g += fDiff * fDiff;
  
        fDiff = pixelA.a - pixelBnext.g;
        fTotal_b += fDiff * fDiff;
  
        fDiff = pixelA.a - pixelBnext.b;
        fTotal_a += fDiff * fDiff;
        /* ================================================== */
  
        fAwaveS += fInputTexPixelStep;
        pixelA = texture2D(texture, vec2(fAwaveS, 0.0));
  
        pixelB = pixelBnext;
        fBwaveS += fInputTexPixelStep;
        pixelBnext = texture2D(texture, vec2(fBwaveS, 0.0));
     }
  
     gl_FragColor = vec4(fTotal_r, fTotal_g, fTotal_b, fTotal_a);
  }
`;
};
