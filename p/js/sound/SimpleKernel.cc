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

#define emcc

#ifdef emcc
#include "emscripten/bind.h"
using namespace emscripten;
const int iSamplesInBlock = 128;
#else
#include <cstdint>
#include <cstring>

#include <iostream>
#include <vector>
#include <string>

#define _USE_MATH_DEFINES
#include <math.h>

using namespace std;

const int iSamplesInBlock = 600;
#endif

const int kRenderQuantumFrames = 128;
const unsigned kBytesPerChannel = kRenderQuantumFrames * sizeof(float);

// The "kernel" is an object that processes a audio stream, which contains
// one or more channels. It is supposed to obtain the frame data from an
// |input|, process and fill an |output| of the AudioWorkletProcessor.
//
//       AudioWorkletProcessor Input(multi-channel, 128-frames)
//                                 |
//                                 V
//                               Kernel
//                                 |
//                                 V
//       AudioWorkletProcessor Output(multi-channel, 128-frames)
//
// In this implementation, the kernel operates based on 128-frames, which is
// the render quantum size of Web Audio API.
class SimpleKernel
{
public:
  SimpleKernel() {}

  void Process(uintptr_t input_ptr, uintptr_t output_ptr,
               unsigned channel_count)
  {



    float *input_buffer = reinterpret_cast<float *>(input_ptr);
    float pitch = pitchDetect(input_buffer, iSamplesInBlock);

    float *output_buffer = reinterpret_cast<float *>(output_ptr);
    int i = 0;
    // Bypasses the data. By design, the channel count will always be the same
    // for |input_buffer| and |output_buffer|.
    for (unsigned channel = 0; channel < channel_count; ++channel)
    {
      float *destination = output_buffer + channel * kRenderQuantumFrames;
      float *source = input_buffer + channel * kRenderQuantumFrames;
      std::memcpy(destination, source, kBytesPerChannel);
      // could maybe do pitch here - (eg using SIMD)
      i++;
    }
    //printf("Yin pitch!");

    if (pitch != NULL)
    {
      printf("Pitch = %f\n", pitch);
    }
    else
    {
      printf("Pitch is NULL!\n");
    }
  }
  float pitchDetect(float *pfSamples, int iSamples)
  { // ============================================================
    float threshold = 0.07;
    float sampleRate = 48000.0;
    float probabilityThreshold = 0.1;
    float probability = 0.0;
    int tau;

    const int iMaxWl = iSamples / 2;
    const int yinBufferLength = iMaxWl;

    float yinBuffer[1000]; // to zeroes?
    for (int t = 0; t < 1000; t++)
    {
      yinBuffer[t] = 0;
    }

    for (int t = 1; t < iMaxWl; t++)
    {
      for (int i = 0; i < iMaxWl; i++)
      {
        float delta = pfSamples[i] - pfSamples[i + t];
        yinBuffer[t] += delta * delta;
      }
    }

    // Compute the cumulative mean normalized difference as described in step 3 of the paper.
    yinBuffer[0] = 1;
    yinBuffer[1] = 1;
    float runningSum = 0;
    for (int t = 1; t < yinBufferLength; t++)
    {
      runningSum += yinBuffer[t];
      yinBuffer[t] *= t / runningSum; //yinBuffer[t] = yinBuffer[t] * (t / runningSum);
    }

    // Compute the absolute threshold as described in step 4 of the paper.
    // Since the first two positions in the array are 1,
    // we can start at the third position.
    for (tau = 2; tau < yinBufferLength; tau++)
    {
      if (yinBuffer[tau] < threshold)
      {
        while (tau + 1 < yinBufferLength && yinBuffer[tau + 1] < yinBuffer[tau])
        {
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
        probability = 1.0 - yinBuffer[tau];
        break;
      }
    }

    // if no pitch found, return null.
    if (tau == yinBufferLength || yinBuffer[tau] >= threshold)
    {
      return NULL;
    }

    // If probability too low, return -1.
    if (probability < probabilityThreshold)
    {
      return NULL;
    }
    //return sampleRate / tau; //dev
    /**
   * Implements step 5 of the AUBIO_YIN paper. It refines the estimated tau
   * value using parabolic interpolation. This is needed to detect higher
   * frequencies more precisely. See http://fizyka.umk.pl/nrbook/c10-2.pdf and
   * for more background
   * http://fedc.wiwi.hu-berlin.de/xplore/tutorials/xegbohtmlnode62.html
   */
    float betterTau;
    int x0, x2;
    if (tau < 1)
    {
      x0 = tau;
    }
    else
    {
      x0 = tau - 1;
    }
    if (tau + 1 < yinBufferLength)
    {
      x2 = tau + 1;
    }
    else
    {
      x2 = tau;
    }
    if (x0 == tau)
    {
      if (yinBuffer[tau] <= yinBuffer[x2])
      {
        betterTau = tau;
      }
      else
      {
        betterTau = x2;
      }
    }
    else if (x2 == tau)
    {
      if (yinBuffer[tau] <= yinBuffer[x0])
      {
        betterTau = tau;
      }
      else
      {
        betterTau = x0;
      }
    }
    else
    {
      float s0 = yinBuffer[x0];
      float s1 = yinBuffer[tau];
      float s2 = yinBuffer[x2];
      // fixed AUBIO implementation, thanks to Karl Helgason:
      // (2.0f * s1 - s2 - s0) was incorrectly multiplied with -1
      betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
    }

    return sampleRate / betterTau;
  }
};
#ifdef emcc
EMSCRIPTEN_BINDINGS(CLASS_SimpleKernel)
{
  class_<SimpleKernel>("SimpleKernel")
      .constructor()
      .function("process",
                &SimpleKernel::Process,
                allow_raw_pointers());
}
#else

SimpleKernel *pKernel = new SimpleKernel();
const int iSamples = iSamplesInBlock;
float aInput[iSamples];
float aOutput[iSamples];
int iWaves = 8;
float radius = 0.5;
float theta = 0;
float thetaStep = (M_PI * iWaves) / iSamples;

void processNextBlock()
{
  for (int i = 0; i < iSamples; i++)
  {
    aInput[i] = sin(theta) * radius;
    theta += thetaStep;
  }

  pKernel->Process((uintptr_t)aInput, (uintptr_t)aOutput, 1);
}

int main()
{

  processNextBlock();
  processNextBlock();
  processNextBlock();
  processNextBlock();
  processNextBlock();
}

#endif