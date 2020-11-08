// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// ****************************************************************

// *********************** IMAGE work starts here

var thisCanvas = document.createElement('canvas');
	thisCanvas.hidden = true;
var thisCtx = thisCanvas.getContext('2d');

// front or back Camera
const frontCamera = 1;
const backCamera = 0;

var cameraDelay = 750; // milliseconds

var camData = {
	rows: 0,
	cols: 0,
	layers: 3,
	dataR: [],
	dataG: [],
	dataB: []
	};  // where the color image data gets stored in our own format
	
const noDisplay = "display:none;";
const yesDisplay = "";
const yesNormDisplay = "display:block; font-weight:normal";

const redCHAN = 0;
const greenCHAN = 1;
const blueCHAN = 2;

// initial values
var backCameraChosen = false;
var lastCameraChosen = frontCamera;
var cameraStarted = false;
var cameraHidden = false;
var acqDone = false;

// *****************************************************************
// following associated with "cordova-plugin-camera-preview"

var myOptions = {};

var previewApp =
	{
	init: function()
		{
		window.smallPreview = false;
		previewCols = 3*(window.screen.height >> 3); // (3/8) of width
		previewRows = previewCols; // display square image
		let tempPlatform = navigator.platform;
		if (windowOrientation() === 'Landscape')
			{
			x0 = 10 + (((window.screen.height >> 1) - previewCols) >> 1);
			y0 = (window.screen.width - previewRows) >> 1;
			document.getElementById('yOffsetL').style = 'margin-top:'+(y0-100)+'px;';
			}
		else
			{
			x0 = (window.screen.width - previewCols) >> 1;
			y0 = 200;// vertical space of "cancel" to image = 200px
// 			y0 = (window.screen.height - previewRows) >> 1; // reserve for future
			let topLoc = previewRows + 40; // vertical space of image to button = 40px
			document.getElementById('yOffsetP').style = 'margin-top:'+topLoc+'px;';
			};

// diagnostics
// 		console.log('sizes x - screen,image: ',window.screen.height,previewCols);
// 		console.log('sizes y - screen,image: ',window.screen.width,previewRows);

		myOptions = {
			x: x0,
			y: y0,
			width: previewCols,
			height: previewRows,
			camera: CameraPreview.CAMERA_DIRECTION.FRONT,
			toBack: false,
			tapPhoto: false,
			tapFocus: false,
			previewDrag: false,
			storeToFile: false,
			disableExifHeaderStripping: false
			};

		cameraStarted = false;
		myOptions.camera = CameraPreview.CAMERA_DIRECTION.FRONT;
		backCameraChosen = false;
		lastCameraChosen = frontCamera;
		
		CameraPreview.setFocusMode(CameraPreview.FOCUS_MODE.FIXED);
		CameraPreview.setFlashMode(CameraPreview.FLASH_MODE.OFF);
		CameraPreview.setColorEffect(CameraPreview.COLOR_EFFECT.NONE);
		CameraPreview.setWhiteBalanceMode(CameraPreview.WHITE_BALANCE_MODE.LOCK);
		CameraPreview.setExposureMode(CameraPreview.EXPOSURE_MODE.LOCK);
		CameraPreview.setPreviewSize({width: previewCols, height: previewRows});
		
		mySound = new sound("../media/Click.wav"); // preload "shutter" sound
		
		setTimeout(function()
			{
			CameraPreview.startCamera(myOptions); // preload camera
			cameraStarted = true;
			CameraPreview.hide(); // but don't show it
			cameraHidden = true;
			}, 250);
		},
		
	switchCamera: function(choice){
		CameraPreview.stopCamera(); // first you have to stop camera
		if (choice == backCamera)
			myOptions.camera = CameraPreview.CAMERA_DIRECTION.BACK
		else
			myOptions.camera = CameraPreview.CAMERA_DIRECTION.FRONT;
		CameraPreview.startCamera(myOptions); // now you can restart
		cameraStarted = true;
		CameraPreview.show();
		cameraHidden = false;
		},
	};

// *****************************************************************
// Cancel active camera
function globalCancelCamera()
	{
	if (!cameraHidden)
		{
		CameraPreview.hide();
		cameraHidden = true;
		}
	};

// *****************************************************************
// Choose camera direction
function chooseCameraP()
	{
	backCameraChosen = document.getElementById('chooseCamP').checked;
	continueCameraChoice();
	};

function chooseCameraL()
	{
	backCameraChosen = document.getElementById('chooseCamL').checked;
	continueCameraChoice();
	};

function continueCameraChoice()
	{
	// the global result used in SSPmediaPrev.js
	if (backCameraChosen && (lastCameraChosen == frontCamera))
		{
		previewApp.switchCamera(backCamera);
		lastCameraChosen = backCamera;
		}
	else if (backCameraChosen && (lastCameraChosen == backCamera))
		{
		previewApp.switchCamera(backCamera);
		lastCameraChosen = backCamera;
		}
	else if (!backCameraChosen && (lastCameraChosen == backCamera))
		{
		previewApp.switchCamera(frontCamera);
		lastCameraChosen = frontCamera;
		}
	else if (!backCameraChosen && (lastCameraChosen == frontCamera))
		{
		previewApp.switchCamera(frontCamera);
		lastCameraChosen = frontCamera;
		}
	else throw('Problem in chooseCamera');
	};

// *****************************************************************
function changeToCameraHTML(localImageNum, cameraChoice)
	{
	// cameraChoice = which camera icon has been chosen NOT "front" or "back"
	cameraNum = cameraChoice; // to be used globally
	if (nImages == 0)
		{
		alert("Choose the number of images to be recorded.")
		return;
		};
		
	if (acqDone)
		{
		reTry();
		};
	
	if (localImageNum == 0 && nImages > 0)
		{
		document.querySelector('#fullScreenLab').style = noDisplay;
		if (windowOrientation() === 'Landscape')
			{
			document.querySelector('#fullScreenCameraPortrait').style = noDisplay;
			document.querySelector('#fullScreenCameraLandscape').style = yesDisplay;
			}
		else
			{
			document.querySelector('#fullScreenCameraPortrait').style = yesDisplay;
			document.querySelector('#fullScreenCameraLandscape').style = noDisplay;
			};

		document.getElementById('bkg1').value = Math.min(imageNum+1,nImages);
		document.getElementById('bkg2').value = document.getElementById('bkg1').value;
		document.getElementById('placeN1').value = nImages;
		document.getElementById('placeN2').value = nImages;
		if (cameraHidden)
			{
			setTimeout(function()
				{
				CameraPreview.show();
				cameraHidden = false;
				}, 100);
			};
		};
	};
	
// *****************************************************************
function parseImage(dataUrl, localImageNum) {
	camData.rows = standardRows;
	camData.cols = standardCols;

	var img = new Image();
	img.onload = function () {
		// image from camera to canvas, reading pixels from canvas
		// source -> destination
		// sx, sy, sWidth, sHeight -> dx, dy, dWidth, dHeight
		// allows for cut and scale

		// cut square with minimum dimension
		sWidth = img.width;
		sHeight = img.height;

		// determine offset in source (cut)
		sx = 0;
		sy = 0;

		// scale to square with correct number of pixels
		dWidth = camData.cols;
		dHeight = camData.rows;

		// no offset in destination
		dx = 0;
		dy = 0;

		// actual setting of dimension destination (canvas)
		thisCanvas.width = dWidth;
		thisCanvas.height = dHeight;

		// actual drawing of source in destination
		// image reduced (how?) from original size to "standard" size
		thisCtx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

		// get pixels in destination
		rawImage = thisCtx.getImageData(dx, dy, dWidth, dHeight);
		rawPixels = Object.values(rawImage.data);
		rawSize = rawPixels.length;

		// convert rawPixels to SSP image format
		// only first three channels are used (RGB)
		channels = 4;
		var red = [];
		var green = [];
		var blue = [];
		for (var i = 0; i < rawSize; i += channels) {
			red.push(rawPixels[i + 0]);
			green.push(rawPixels[i + 1]);
			blue.push(rawPixels[i + 2]);
		}
		// finish building the data structure for SSP image
		camData.dataR = red.slice();
		camData.dataG = green.slice();
		camData.dataB = blue.slice();
		processImage(localImageNum);
	};
	img.onerror = function (err) {
		cb(err);
	};

	// the following triggers img.onload above
	img.src = dataUrl;
}

// *****************************************************************
function imageMedia(val) {
	thisMediaType = 'image';
	let localImageNum = val;

	camData.rows = standardRows;
	camData.cols = standardCols;

	// captureImageSuccess callback
	var captureImageSuccess = function (mediaFileName)
		{
		parseImage("data:image/jpeg;base64," + mediaFileName, localImageNum);
		// following enables multiple camera shots semi-auto ( n > 1)
		if (nImages == null) return; // don't always want semi-auto
		if (localImageNum < nImages)
			setTimeout(function() { getImage(localImageNum+1); }, cameraDelay);
		};

	// captureImageError callback
	var captureImageError = function (error) {
		alert('Error signal so images may be corrupt. Try again?');
		cancelCamera();
		return;
	};

	// this is what gets called when you push the button
	CameraPreview.takeSnapshot({width:standardCols, height:standardRows, 
			quality:100}, captureImageSuccess,captureImageError);
		
// 	Don't use; image horizontally distorted
// 	CameraPreview.takePicture({width:standardCols, height:standardRows, quality:100},
// 		captureImageSuccess,captureImageError);

}

// *****************************************************************
function simulateImageMedia(val) {
	let localImageNum = val;
	var empirMean = 128; // measurement from iPad, Thursday, 2 April 2020
	
	var thisSigmaR = 10;
	var thisSigmaG = thisSigmaR;
	var thisSigmaB = thisSigmaR;
	var tred = [];
	var tgreen = [];
	var tblue = [];
	for (var i = 0; i < rows*cols; i++)
		{
		// whatever is useful goes here
		tred[i] = randomPoisson(empirMean) + randomGaussian(0,thisSigmaR);
		tgreen[i] = randomPoisson(empirMean) + randomGaussian(0,thisSigmaG) + 50*Math.sin(2*Math.PI*4*i/cols);
		tblue[i] = randomPoisson(empirMean) + randomGaussian(0,thisSigmaB) + (20*i/(rows*cols));
		}
	camData = {
		rows: standardRows,
		cols: standardCols,
		layers: 3,
		dataR: tred,
		dataG: tgreen,
		dataB: tblue
	};
	processImage(localImageNum);
}

// *****************************************************************
// *********************** AUDIO work starts here

// New setup for audioinput, RL 20191014
// usage:
// * determine how many record sessions are needed (combination of start, stop and play buttons)
// * on html setup buttons per session with id 'startCapture-x', 'stopCapture-x' and 'playCapture-x'
//   with x being a integer index-number starting with 0 and unique per record session
// * all onclicks- and disable-properties are set in this code
// * only change configurable variables below!
// * all data is stored in audioData [[]] with a list of Float32Arrays
//   on array per record session
//
// The audio data will be cropped to remove the first "offsetTime" worth of samples.
// This is to remove "switch bounce", an artifact. To ensure that the the number of samples
// after cropping is a favorable power of two (theLength), extra audio samples must be recorded.
// The implementation takes place in stopCapture().

// configurable variables
// default record time (in ms) if no myDuration is given

var audioSentence = 'You must acquire data before it can be played';

var recordTimeDefault = 3000;

// offset recording in ms
var offsetTime = 150; // the first 150 ms are contaminated by "switch bounce"
                        
// sample rate for recording (in Hz)
var sampleRate = sampFreq; // one-stop shopping for sampling frequency in SSPconstants.js

// capture configuration object
var captureCfg = {
	sampleRate: sampleRate,
	bufferSize: 16384,
};

// Current Audio Number
var currentAudioNum = null;

// List with all microphone start and stop numbers
var listMics = [];
elementList = document.querySelectorAll('*[id^="startCapture-"]');
for (const el of elementList) {
	var pieces = el.id.split('-');
	listMics.push(pieces[pieces.length-1]);
}

// List with all playback numbers
var listPlayBacks = [];
elementList = document.querySelectorAll('*[id^="playCapture-"]');
for (const el of elementList) {
	var pieces = el.id.split('-');
	listPlayBacks.push(pieces[pieces.length-1]);
}

// Capture configuration object DO NOT CHANGE
captureCfg.normalize       = false; // needed for playback on device
captureCfg.channels        = 1; // MONO needed for further use in SSP
captureCfg.audioSourceType = 0; // DEFAULT;

// Audio Buffers
var audioDataBuffer = new Float32Array(0);
var url = (window.URL || window.webkitURL);
var maxPlays = 5;
var myAudio = Array(maxPlays).fill(null);
var objectURL = Array(maxPlays).fill(null);
var encoder = null;

// Record number of samples
var recordSize = 0;

// Record Time
var recordTimeRequired = [];

// Sample rate in ms
var sampleRate_ms = sampleRate / 1000;

// Global variables of SSP
if (typeof theNames === 'undefined') {
	theNames = [];
}
if (typeof newSamples === 'undefined') {
	newSamples = [];
}
if (typeof acquired === 'undefined') {
	acquired = [];
}


// *****************************************************************
// button functions
function buttonDisable(audioNum) {
"use strict"; // OK
	document.getElementById('startCapture-'+audioNum).disabled = true;
	document.getElementById('stopCapture-'+audioNum).disabled = true;
}

// *****************************************************************
function buttonAllDisable() {
"use strict"; // OK
	for (const num of listMics) {
		buttonDisable(num);
	}
	for (const num of listPlayBacks) {
		document.getElementById('playCapture-'+num).disabled = true;
	}
}

// *****************************************************************
function buttonInit()
	{
"use strict"; // OK
	var startButton = null;
	var stopButton = null;
	for (const num of listMics)
		{
		startButton = document.getElementById('startCapture-'+num);
		startButton.disabled = false;
		startButton.addEventListener("click", function() {startCapture(num);});
		stopButton = document.getElementById('stopCapture-'+num);
		stopButton.disabled = true;
		stopButton.addEventListener("click", function() {stopCapture(num);});
		};
	for (const num of listPlayBacks) {
		if(!acquired[num])
			{
			document.getElementById('playCapture-'+num).disabled = true;
			document.getElementById('play_'+num).style = 'filter:opacity(50%) blur(3px);';
			}
		else
			{
			document.getElementById('playCapture-'+num).disabled = false;
			document.getElementById('play_'+num).style = 'filter:opacity(100%);';
			};
		}
	}

// *****************************************************************
function buttonStart(audioNum) {
"use strict"; // OK
	for (const num of listMics) {
		if (num == audioNum)
			{
			document.getElementById('startCapture-'+num).disabled = true;
			document.getElementById('stopCapture-'+num).disabled = false;
			document.getElementById('playCapture-'+num).disabled = true;
			document.getElementById('animX'+audioNum).style.animationDuration = "1s";
			document.getElementById('mic_'+audioNum).style = 'filter:hue-rotate(140deg);';
			document.getElementById('play_'+audioNum).style = 'filter:opacity(50%) blur(3px);';
			for (var i = nMics; i < nPlays; i++)
				document.getElementById('play_'+i).style = 'filter:opacity(50%) blur(3px);';
			}
		else { buttonDisable(num); }
	}
}

// *****************************************************************
function buttonStop()
	{
"use strict"; // OK
	for (const num of listMics)
		{
		document.getElementById('startCapture-'+num).disabled = false;
		document.getElementById('stopCapture-'+num).disabled = true;
		}
	document.getElementById('animX'+currentAudioNum).style.animationDuration = "0s";
	document.getElementById('mic_'+currentAudioNum).style = 'filter:hue-rotate(0deg);';
	if (acquired[0] && acquired[1]) // both signals acquired
		{
		for (var i = nMics; i < nPlays; i++)
			document.getElementById('play_'+i).style = 'filter:opacity(100%);';
		};
	}

// *****************************************************************
// concatenate arrays needed for stitching buffers in onAudioInputCapture()
function myConcatenate(targetArray, newData) {
"use strict"; // OK
	let targetLength = targetArray.length;
	let newLength = newData.length;
	let totalLength = targetLength + newLength;

	let result = new Float32Array(totalLength);
	for (var i = 0; i < targetLength; i++)
		result[i] = targetArray[i];
		
	for (var i = 0; i < newLength; i++)
		result[i+targetLength] = newData[i];
	targetArray = null;
	return result;
}

// *****************************************************************
// Global variables for outputting other sounds in wav format
// Setup with: mySound = new sound("../media/Click2.wav");
// Play with: mySound.play();

var mySound;

function sound(src) {
	this.sound = document.createElement("audio");
	this.sound.src = src;
	this.sound.type = "audio/wav";
	this.sound.setAttribute("preload", "auto");
	this.sound.setAttribute("controls", "none");
	this.sound.style.display = "none";
	document.body.appendChild(this.sound);
	this.play = function(){
		this.sound.play();
		};
	this.stop = function(){
		this.sound.pause();
		};
}

// *****************************************************************
// Called continuously while AudioInput capture is running.
function onAudioInputCapture(evt)
	{
"use strict"; // OK
	try
		{
		if (evt && evt.data)
			{
			// Add the chunk to the buffer
			audioDataBuffer = myConcatenate(audioDataBuffer, evt.data);
			evt.data = [];
			if (audioDataBuffer.length > recordSize)
				stopCapture(currentAudioNum);
			}
		else
			{ alert("Unknown audioinput event: " + JSON.stringify(evt)); }
		}
	catch (ex) { alert("onAudioInputCapture ex: " + ex); }
}

// *****************************************************************
// Called when a plugin error happens.
function onAudioInputError(error) {
	alert("onAudioInputError event received: " + JSON.stringify(error));
}

// *****************************************************************
// Manufacture an audio blob from an array of 16-bit audio samples
function createWavBlob(audioNum,audioSamples)
	{
"use strict"; // OK
	// clear these for the next playbacks
	if (encoder !== null) encoder = null;
	
	// you can't remove something that doesn't exist
	// but you must discard old "audio tags" and replace them
	if (myAudio[audioNum] !== null) myAudio[audioNum].remove();
	if (objectURL[audioNum] !== null) url.revokeObjectURL(objectURL[audioNum]);
	
	encoder = new WavAudioEncoder(captureCfg.sampleRate, captureCfg.channels)

	// normalize sound to be played but NOT processed
	encoder.encode([ampNormalizeReal(audioSamples)]);
	// Finish encoding and get Waveform Audio as a Blob
	objectURL[audioNum] = url.createObjectURL(encoder.finish("audio/wav"));
	
	myAudio[audioNum] = document.createElement("audio");
	myAudio[audioNum].controls = true;
	myAudio[audioNum].src = objectURL[audioNum];
	myAudio[audioNum].type = "audio/wav";
	document.getElementById("playCapture-"+audioNum).onclick = 
		function () { myAudio[audioNum].play(); };
	document.getElementById("playCapture-"+audioNum).disabled = false;
	
	acquired[audioNum] = true;
	document.getElementById('play_'+audioNum).style = 'filter:opacity(100%);';
	}

// *****************************************************************
// Start capturing audio.
var startCapture = function (audioNum) {
// "use strict";
// getMicrophonePermission exception: Attempted to assign to readonly property
	try
		{
		if (window.audioinput && !window.audioinput.isCapturing())
			{
			// Set the current audioNum
			currentAudioNum = audioNum;

			// See utils.js
			getMicrophonePermission(function ()
				{
				// initialise recording
				theNames[audioNum].data = [];
				newSamples[audioNum] = 0;
				acquired[audioNum] = false;
				// calculate recording time in milliseconds
				// check if required recording time is given (myDuration[audioNum])
				if (typeof myDuration === 'undefined' || typeof myDuration[audioNum] === 'undefined') {
					recordTimeRequired[audioNum] = recordTimeDefault;
				} else {
					recordTimeRequired[audioNum] = myDuration[audioNum];
				}
				// calculate number of samples
				recordSize = Math.floor((offsetTime + recordTimeRequired[audioNum]) * sampleRate_ms);
				// Start recording!
				window.audioinput.start(captureCfg);

				buttonStart(audioNum);
				}, function (deniedMsg)
					{
					console.log('startCapture deniedMsg: ',deniedMsg);
					}, function (errorMsg)
				{
				console.log('startCapture errorMsg: ',errorMsg);
				});
			}
		}
	catch (e) { alert("startCapture exception: " + e); }
};

// *****************************************************************
// Stop the capture, encode the captured audio to WAV, and show audio element in UI.
var stopCapture = function (audioNum) {
// "use strict"; // stopCapture exception: Attempted to assign to readonly property
	try {
		if (audioNum != currentAudioNum) { // should not be happening with button disabling
			console.log('stopCapture: Warning: not matching stop- with running startbutton');
			}
		else
			{
			if (window.audioinput && window.audioinput.isCapturing())
				{
				// Stop recording!
				if (window.audioinput) {
					window.audioinput.stop();
					}
				// Remove offset of data to remove 'click' (and starting zeros?)
				var bufferLength = audioDataBuffer.length;
				var bufferTime = bufferLength / sampleRate * 1000;
				var offsetData = Math.floor(offsetTime * sampleRate_ms);
				
				// change typeArray to regular array; use this opportunity to scale
				let scaler = (2**15)-1;
				for (var i = 0; i < audioDataBuffer.length; i++) audioDataBuffer[i] /= scaler;
				var audioDataSliced = Array.from(audioDataBuffer.slice(offsetData));

				// Store audio in global variables
				acquired[audioNum] = true;
				theNames[audioNum].data = audioDataSliced;
				newSamples[audioNum] = audioDataSliced.length;

				createWavBlob(audioNum, audioDataSliced)
				audioDataBuffer = new Float32Array(0); // cleaning up buffer
				audioDataSliced = []; // cleaning up buffer

				buttonStop();
				processAudio(audioNum);
				}
			}
		}
	catch (e) { alert("stopCapture exception: " + e); }
};

// *****************************************************************
// When cordova fires the deviceready event, we initialize everything needed for audio input.
var onDeviceReady = function () {
"use strict"; // OK
	if (window.cordova && window.audioinput) {
		// Subscribe to audioinput events 
		//
		window.addEventListener('audioinput', onAudioInputCapture, false);
		window.addEventListener('audioinputerror', onAudioInputError, false);
		buttonInit();
	} else {
		console.log("onDeviceReady: cordova-plugin-audioinput not found! Phooey!");
		buttonAllDisable();
	}
};

// *****************************************************************
// Make it possible to run the demo on desktop.

if (!window.cordova) {
	console.log("Running on desktop!");
// 	onDeviceReady();
} else {
	// For Cordova apps on browser version
	// 	document.addEventListener('deviceready', onDeviceReady, false);
}

// *****************************************************************
