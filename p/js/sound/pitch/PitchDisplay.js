import { SamplesBufferz, pitchSamplesBuffer } from "../Sound.js";

var detectorElem, canvasElem, canvasContext, waveCanvas, pitchElem, noteElem, detuneElem, detuneAmount;
var DEBUGCANVAS;
var yoffset = 0;

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = window.webkitRequestAnimationFrame;
}
//kickoff? requestAnimationFrameId = window.requestAnimationFrame( updatePitch ); //??
canvasElem = document.getElementById("output");
canvasContext = canvasElem.getContext("2d");
canvasContext.strokeStyle = "black";
canvasContext.lineWidth = 1;
//soundObject.setCanvasContext(canvasContext);
//soundObject.onPitchDeduced = onPitchDeduced;
DEBUGCANVAS = document.getElementById("waveform");
if (DEBUGCANVAS) {
  waveCanvas = DEBUGCANVAS.getContext("2d");
  waveCanvas.strokeStyle = "black";
  waveCanvas.lineWidth = 1;
}
//waveCanvas = canvasContext;

export function displayPitch(pitch) {
  if (pitch > 0) {
    var fred = 0;
  }
  if (canvasContext) {
    //let pitch = soundObject.deduceLatestPitch();
    canvasContext.clearRect(0, yoffset, 40, 40);
    var xoffset = 5;
    yoffset = 600 - pitch / 2;
    var radius = 20;
    //canvasContext.clearRect(xoffset, yoffset, radius* 2, radius * 2);
    canvasContext.beginPath();
    canvasContext.arc(xoffset + radius, yoffset + radius, radius, 0, 2 * Math.PI, false);
    canvasContext.fillStyle = "green";
    canvasContext.fill();
    //canvasContext.lineWidth = 5;
    //canvasContext.strokeStyle = 'green';//'#000033';
    //canvasContext.stroke();
    //console.log("pitch: " + pitch + "\nyoffset: " + yoffset);
  }
}

export function displayWave() {
  //var cycles = new Array;

  //analyser.getFloatTimeDomainData( buf ); // this sometimes causes: Uncaught TypeError: Cannot read property 'getFloatTimeDomainData' of null
  //var ac = autoCorrelate( buf, audioContext.sampleRate );
  // TODO: Paint confidence meter on canvasElem here.

  var samplesBuffer, freeInd;
  // We assume here that window.maxSampleWl * 2 is at least width of wave display
  if (window.ySharedMemory) {
    samplesBuffer = SamplesBufferz.f32SamplesBuffer;
    freeInd = samplesBuffer[SamplesBufferz.freeInd];
  } else {
    if (pitchSamplesBuffer == null) {
      return;
    } else {
      samplesBuffer = pitchSamplesBuffer;
      freeInd = window.maxSampleWl * 2; 
    }
  }
  var ind = freeInd - 1;

  if (ind >= 0) {
    //dev
    if (waveCanvas) {
      // This draws the current waveform, useful for debugging
      waveCanvas.clearRect(0, 0, 512, 256);
      waveCanvas.strokeStyle = "red";
      waveCanvas.beginPath();
      waveCanvas.moveTo(0, 0);
      waveCanvas.lineTo(0, 256);
      waveCanvas.moveTo(128, 0);
      waveCanvas.lineTo(128, 256);
      waveCanvas.moveTo(256, 0);
      waveCanvas.lineTo(256, 256);
      waveCanvas.moveTo(384, 0);
      waveCanvas.lineTo(384, 256);
      waveCanvas.moveTo(512, 0);
      waveCanvas.lineTo(512, 256);
      waveCanvas.stroke();
      waveCanvas.strokeStyle = "black";
      waveCanvas.beginPath();
      //waveCanvas.moveTo(0,buf[0]);

      // ----- sync on trough ---
      // Find next pos-going zero cross
      var i = 0;
      var j = 0;
      var prevSampleVal;
      let sampleVal = samplesBuffer[ind];
      if (samplesBuffer[ind - 1] > samplesBuffer[ind]) {
        //rising wave (in reverse dir!)
        ind--;
        // find end of pos going
        prevSampleVal = -1.5; // >1
        for (i = 0; i < 512; i++) {
          sampleVal = samplesBuffer[ind];
          if (sampleVal < prevSampleVal) {
            break;
          }
          prevSampleVal = sampleVal;
          ind--;
        }
      }
      // we are now neg going so look for pos going.
      prevSampleVal = 1.5;
      for (var j = 0; j < 512 - i; j++) {
        sampleVal = samplesBuffer[ind];
        if (sampleVal > prevSampleVal) {
          break;
        }
        prevSampleVal = sampleVal;
        ind--;
      }

      for (i = 0; i < 512; i++) {
        //waveCanvas.lineTo(i,128+(buf[i]*128));
        sampleVal = samplesBuffer[ind];
        waveCanvas.lineTo(i, 128 + sampleVal * 128);
        ind--; // display backwards!
      }
      waveCanvas.stroke();
    }
  }

  /*if (ac == -1) {
 		detectorElem.className = "vague";
	 	pitchElem.innerText = "--";
		noteElem.innerText = "-";
		detuneElem.className = "";
		detuneAmount.innerText = "--";
 	} else {
	 	detectorElem.className = "confident";
	 	pitch = ac;
	 	pitchElem.innerText = Math.round( pitch ) ;
	 	var note =  noteFromPitch( pitch );
		noteElem.innerHTML = noteStrings[note%12];
		var detune = centsOffFromPitch( pitch, note );
		if (detune == 0 ) {
			detuneElem.className = "";
			detuneAmount.innerHTML = "--";
		} else {
			if (detune < 0)
				detuneElem.className = "flat";
			else
				detuneElem.className = "sharp";
			detuneAmount.innerHTML = Math.abs( detune );
		}
    }
    */
}
