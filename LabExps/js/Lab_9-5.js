// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2022
// Licensed under the MIT license.
// Laboratory experiment 9.5
// i.t. young
// 
// ****************************************************************
// Tuesday, 6 August 2019
//
// Four signals:
//		sSig = s[n] = original signal
//		hSig = h[n] = single matched filter
//		rSig = r[n] = s[n] + gaussian noise
//		fSig = f[n] = r[n] filtered with h[-n], i.e. matched filter output

// globals defined here
var SIMULATION = false;

var spectA = [];
var spectH = [];
var sSig = [];
var hSig = [];
var rSig = [];
var fSig = [];

var hChange = true;
var rChange = true;
var fChange = true;

var nn = [];
var ndim = nn.length;

var sigCT = [];
var sigDT = [];
var figCT = [];
var figDT = [];
var sigNew = [];
var figNew = [];
var hDataNew = [];
var sDataNew = [];
var rDataNew = [];
var fDataNew = [];

var hCTPlot = null;
var sCTPlot = null;
var rCTPlot = null;
var fCTPlot = null;

var hDTPlot = null;
var sDTPlot = null;
var rDTPlot = null;
var fDTPlot = null;

var sigPlot = [];
var figPlot = [];

var sigsCTLayout = null;
var sigsDTLayout = null;
var figsCTLayout = null;
var figsDTLayout = null;
var layoutSigT = null;
var layoutSigC = null;

var lengthMax = 2**factor2; // defined in SSPmedia.js

var sentence = '';

var displayModeT = 'CT'; // continuous time
var displayModeC = 'CT';
	
var newDispSamplesT = lengthMax;
var newStartSampleT = 0;
var newStopSampleT = lengthMax;
var middleSampleT = (newStopSampleT+newStartSampleT) >> 1;

var newDispSamplesC = lengthMax;
var newStartSampleC = 0;
var newStopSampleC = lengthMax;
var middleSampleC = (newStopSampleC+newStartSampleC) >> 1;

var targetLength = binningFactor;

var maxAbsSignal = 0;
var snrValues = [0.1, 0.25, 0.5, 1, 2.5, 5, 10, 25, 50, 100, 1000];
var thisSNR = snrValues[snrValues.length - 1];
var mu = 0;
var sigma = 1;

var fMin = 100; // Hz
var fMax = 1000; // Hz
var freq0 = fMin; // Hz
var freq1 = 331; // Hz (prime)
var freq2 = 787; // Hz (prime)

var silence3 = Array(Math.round(0.3*sampFreq)).fill(0);
var silence5 = Array(Math.round(0.5*sampFreq)).fill(0);
var tone1 = Array(Math.round(0.7*sampFreq));
var tone2 = Array(Math.round(0.7*sampFreq));

var milliSamp = sampFreq/1000; // samples per millisecond
var windows = 
	[10, 20, 40, 80, 100, 150, 200, 250, 300, 350, 400]; // list of widths in ms
var windDuration = windows[0];
var windowLength = Math.ceil(milliSamp*windDuration);

// *****************************************************************
// Functions defined here

function displayData()
	{
	'use strict';

// 	if (SIMULATION) validatePlotly(wA,sigPlot,layoutSigT)
	Plotly.react (wA, sigPlot, layoutSigT, noMode);
// 	if (SIMULATION) validatePlotly(wB,figPlot,layoutSigC)
	Plotly.react (wB, figPlot, layoutSigC, noMode);
	};

// ***************************************************************** \\

function resetWindowsControls()
	{
	'use strict';

	displayModeT = 'CT';
	displayModeC = 'CT';
	
	let minSamples = 32;
	let minSamplesParam = Math.ceil(Math.log2(minSamples));
	
	document.querySelector('#zmT').value = 0;
	document.querySelector('#zmT').max = Math.floor(Math.log2(lengthMax))-minSamplesParam;
	document.querySelector('#panT').min = 0;
	document.querySelector('#panT').max = lengthMax;
	document.querySelector('#panT').value = lengthMax >> 1;
	
	document.querySelector('#zmC').value = 0;
	document.querySelector('#zmC').max = Math.floor(Math.log2(lengthMax))-minSamplesParam;
	document.querySelector('#panC').min = 0;
	document.querySelector('#panC').max = lengthMax;
	document.querySelector('#panC').value = lengthMax >> 1;
	
	document.querySelector('#sigsTimeType0').value = 'Continuous';
	document.querySelector('#sigsTimeType00').value = 'Continuous';
	sentence = 'with ' + newSamples[audioNum].toString() + ' samples = '+
			d0round(1000*newSamples[audioNum]/sampFreq).toString()+" ms";
	document.querySelector('#sigsTimeType3').value = sentence;
	sentence = 'with ' + lengthMax.toString() + ' samples = '+
			d0round(1000*lengthMax/sampFreq).toString()+" ms";
	document.querySelector('#corrTimeType3').value = sentence;
	
	displayData();
	};

// *****************************************************************
//
function setUpDisplaysT()
	{
	'use strict'
	
	if (displayModeT == 'DT')
		sigNew = takeAtoB(sigDT,newStartSampleT,newStopSampleT)
	else
		sigNew = takeAtoB(sigCT,newStartSampleT,newStopSampleT);
	
	hDataNew = takeAtoB(hSig,newStartSampleT,newStopSampleT);
	sDataNew = takeAtoB(sSig,newStartSampleT,newStopSampleT);

	if (sigNew.length <= maxDTdisplay)
		{
		hDTPlot.x = sigNew;
		hDTPlot.error_y.array = Array(hDataNew.length).fill(0);
		hDTPlot.y = hDataNew;
		hDTPlot.error_y.arrayminus = hDTPlot.y;
	
		sDTPlot.x = sigNew;
		sDTPlot.error_y.array = Array(sDataNew.length).fill(0);
		sDTPlot.y = sDataNew;
		sDTPlot.error_y.arrayminus = sDTPlot.y;
	
		if (sigNew.length > changeDTparams)
			hDTPlot.marker.size = 5.3*DTlineThick
		else
			hDTPlot.marker.size = 6*DTlineThick;
		sDTPlot.marker.size = hDTPlot.marker.size;

		document.querySelector('#sigsTimeType0').value = 'Discrete';
		sentence = 'with ' + newDispSamplesT.toString() + ' samples';
		document.querySelector('#sigsTimeType3').value = sentence;

		sigPlot = [sDTPlot, hDTPlot];
		layoutSigT = sigsDTLayout;
		}
	else
		{
		hCTPlot.x = binning(sigNew,targetLength);
		hCTPlot.y = binning(hDataNew,targetLength);
	
		sCTPlot.x = hCTPlot.x;
		sCTPlot.y = binning(sDataNew,targetLength);

		document.querySelector('#sigsTimeType0').value = 'Continuous';
		sentence = 'with ' + newDispSamplesT.toString() + ' samples = '+
			d0round(1000*newDispSamplesT/sampFreq).toString()+" ms"
		document.querySelector('#sigsTimeType3').value = sentence;

		sigPlot = [sCTPlot, hCTPlot]
		layoutSigT = sigsCTLayout;
		};
	};

// *****************************************************************
//
function setUpDisplaysC()
	{
	'use strict'
	
	if (displayModeC == 'DT')
		figNew = takeAtoB(figDT,newStartSampleC,newStopSampleC)
	else
		figNew = takeAtoB(figCT,newStartSampleC,newStopSampleC);
	
	fDataNew = takeAtoB(fSig,newStartSampleC,newStopSampleC);
	rDataNew = takeAtoB(rSig,newStartSampleC,newStopSampleC);

	if (figNew.length <= maxDTdisplay)
		{
		fDTPlot.x = figNew;
		fDTPlot.error_y.array = Array(fDataNew.length).fill(0);
		fDTPlot.y = fDataNew;
		fDTPlot.error_y.arrayminus = fDTPlot.y;

		rDTPlot.x = figNew;
		rDTPlot.error_y.array = Array(rDataNew.length).fill(0);
		rDTPlot.y = rDataNew;
		rDTPlot.error_y.arrayminus = rDTPlot.y;

		if (figNew.length > changeDTparams)
			fDTPlot.marker.size = 5.3*DTlineThick
		else
			fDTPlot.marker.size = 6*DTlineThick;
		rDTPlot.marker.size = fDTPlot.marker.size;

		document.querySelector('#sigsTimeType00').value = 'Discrete';
		sentence = 'with ' + newDispSamplesC.toString() + ' samples';
		document.querySelector('#corrTimeType3').value = sentence;

		figPlot = [rDTPlot,fDTPlot]; // global
		layoutSigC = figsDTLayout;
		}
	else
		{
		fCTPlot.x = binning(figNew,targetLength);
		fCTPlot.y = binning(fDataNew,targetLength);

		rCTPlot.x = fCTPlot.x;
		rCTPlot.y = binning(rDataNew,targetLength);

		document.querySelector('#sigsTimeType00').value = 'Continuous';
		sentence = 'with ' + newDispSamplesC.toString() + ' samples = '+
				d0round(1000*newDispSamplesC/sampFreq).toString()+" ms";
		document.querySelector('#corrTimeType3').value = sentence;

		figPlot = [rCTPlot,fCTPlot]; // global
		layoutSigC = figsCTLayout;
		};
	};

// ***************************************************************** \\
function fineStepT(direction)
	{
	'use strict';

	// direction -1 means go to left, +1 means go to right
	let timeStep = direction*(newDispSamplesT >> 1);
	
	newStartSampleT += timeStep;
	newStopSampleT += timeStep;
	
	if (newStartSampleT < 0)
		{
		newStartSampleT = 0;
		newStopSampleT = newStartSampleT + newDispSamplesT;
		};
		
	if (newStopSampleT > lengthMax)
		{
		newStopSampleT = lengthMax;
		newStartSampleT = newStopSampleT - newDispSamplesT;
		};
	middleSampleT = (newStartSampleT + newStopSampleT) >> 1;

	setUpDisplaysT();
	displayData();
	};

// ***************************************************************** \\
function fineStepC(direction, target)
	{
	'use strict';

	// direction -1 means go to left, +1 means go to right
	let timeStep = direction*(newDispSamplesC >> 1);
	
	newStartSampleC += timeStep;
	newStopSampleC += timeStep;
	
	if (newStartSampleC < 0)
		{
		newStartSampleC = 0;
		newStopSampleC = newStartSampleC + newDispSamplesC;
		};
		
	if (newStopSampleC > lengthMax)
		{
		newStopSampleC = lengthMax;
		newStartSampleC = newStopSampleC - newDispSamplesC;
		};
	middleSampleC = (newStartSampleC + newStopSampleC) >> 1;

	setUpDisplaysC();
	displayData();
	};

// *****************************************************************

function sliderChoicesT(val,target)
	{
	'use strict';

	var deltaT = 0; // change in number of samples (zoom)
	var power = val;
	var deltaMid = 0; // change in center position (pan)
	var newMiddle = val;
	
	if (target === 'Zt') // Zoom
		{
		for (var j = 0; j < nDisRec; j++) newSamples[j] = xLength[j] >> power;
		deltaT = newSamples[audioNum] >> 1;
		
		// number of zoomed sample to display
		newDispSamplesT = lengthMax >> power;
		if (oddQ(newDispSamplesT)) newDispSamplesT--; // make it even
		if (power == 0) document.querySelector('#panT').value = lengthMax >> 1;
		
		newStartSampleT = middleSampleT - deltaT;
		newStopSampleT = middleSampleT + deltaT;
	
		if (newStartSampleT < 0)
			{
			newStartSampleT = 0;
			newStopSampleT = newStartSampleT + newSamples[audioNum];
			};
	
		if (newStopSampleT > xLength[audioNum])
			{
			newStopSampleT = xLength[audioNum];
			newStartSampleT = newStopSampleT - newSamples[audioNum];
			};
		middleSampleT = (newStopSampleT+newStartSampleT) >> 1;
		document.querySelector('#panT').value = middleSampleT;
		
		// values: newDispSamplesT, newStartSampleT, middleSampleT, newStopSampleT
		if (newDispSamplesT <= maxDTdisplay)
			displayModeT = 'DT'
		else
			displayModeT = 'CT';
		}
	else if (target === 'Pt') // Pan
		{
		deltaMid = newMiddle - middleSampleT; 
		newStartSampleT += deltaMid;
		newStopSampleT += deltaMid;
	
		if (newStartSampleT < 0)
			{
			newStartSampleT = 0;
			newStopSampleT = newStartSampleT + newSamples[audioNum];
			};
	
		if (newStopSampleT > xLength[audioNum])
			{
			newStopSampleT = xLength[audioNum];
			newStartSampleT = newStopSampleT - newSamples[audioNum];
			};
		middleSampleT = (newStopSampleT+newStartSampleT) >> 1;
		}
	else 
		throw("Problem in Sliders T");

	setUpDisplaysT();
	displayData();
	};
	
// *****************************************************************

function sliderChoicesC(val,target)
	{
	'use strict';

	var deltaC = 0; // change in number of samples (zoom)
	var power = val;
	var deltaMid = 0; // change in center position (pan)
	var newMiddle = val;
	
	if (target === 'Zc') // Zoom
		{
		// number of zoomed sample to display
		newDispSamplesC = lengthMax >> power;
		deltaC = newDispSamplesC >> 1;
		
		if (oddQ(newDispSamplesC)) newDispSamplesC--; // make it even
		if (power == 0)
			{
			middleSampleC = lengthMax >> 1;
			document.querySelector('#panC').value = middleSampleC;
			document.querySelector('#panC').max = lengthMax;
			}
		
		newStartSampleC = middleSampleC - deltaC;
		newStopSampleC = middleSampleC + deltaC;
	
		if (newStartSampleC < 0)
			{
			newStartSampleC = 0;
			newStopSampleC = newStartSampleC + newDispSamplesC;
			};
	
		if (newStopSampleC > lengthMax)
			{
			newStopSampleC = lengthMax;
			newStartSampleC = newStopSampleC - newDispSamplesC;
			};
		middleSampleC = (newStopSampleC+newStartSampleC) >> 1;
		
		// values: newDispSamplesC, newStartSampleC, middleSampleC, newStopSampleC
		if (newDispSamplesC <= maxDTdisplay)
			displayModeC = 'DT'
		else
			displayModeC = 'CT';
		}
	else if (target === 'Pc') // Pan
		{
		deltaMid = newMiddle - middleSampleC; 
		newStartSampleC += deltaMid;
		newStopSampleC += deltaMid;
	
		if (newStartSampleC < 0)
			{
			newStartSampleC = 0;
			newStopSampleC = newStartSampleC + newDispSamplesC
			};
	
		if (newStopSampleC > lengthMax)
			{
			newStopSampleC = lengthMax;
			newStartSampleC = newStopSampleC - newDispSamplesC;
			};
		middleSampleC = (newStopSampleC+newStartSampleC) >> 1;
		}
	else 
		throw("Problem in Sliders C");

	setUpDisplaysC();
	displayData();
	};
	
// *****************************************************************

function signalProcessing()
	{
	'use strict';

	let audioO = Array(windowLength).fill(0);
	for (var i = 0; i < windowLength; i++)
		audioO[i] = Math.sin(2*Math.PI*freq0*i/sampFreq);
	
	if (hChange)
		{ // sinusoidal matched filter
		createWavBlob(1, audioO);
		hChange = false;
		};
	
	audioO.reverse(); // reverse in place
		
	hSig = Array(sSig.length).fill(0); // hSig and rSig must have same length
	for (var i = 0; i < windowLength; i++ ) hSig[i] = audioO[i];
	
	rSig = []; // shortened noisy signal
	maxAbsSignal = getMaxOfAbsArray(sSig)
	sigma = maxAbsSignal/thisSNR;
	for (var i = 0; i < sSig.length; i++)
		rSig[i] = sSig[i] + randomGaussian(mu,sigma); // sentence + noise

	// fft processing requires zero padding with signal(s) in the middle
	startSample[audioNum] = 0;
	stopSample[audioNum] = lengthMax;
	
	for (var j = 0; j < nDisRec; j++)
		{
		xLength[j] = lengthMax;
		newSamples[j] = lengthMax;
		};

	newDispSamplesT = stopSample[audioNum];
	newStartSampleT = startSample[audioNum];
	newStopSampleT = stopSample[audioNum];
	middleSampleT = Math.round((newStopSampleT+newStartSampleT)/2);
	
	figDT = Array(stopSample[audioNum]).fill(0);
	figCT = Array(stopSample[audioNum]).fill(0);
	newDispSamplesC = stopSample[audioNum];
	newStartSampleC = 0;
	newStopSampleC = stopSample[audioNum];
	middleSampleC = Math.round((newStopSampleC+newStartSampleC)/2);

	// compute convolution & cross-correlation in discrete-time-domain
	nn = [2*hSig.length]; // number of complex values
	ndim = nn.length; // 1-D signal

	let tempAudH = [];
	tempAudH = suR(zeroPad1D(hSig));
	let tempAudA = [];
	tempAudA = suR(zeroPad1D(rSig));

	// filter in f-domain
	spectH = fft(tempAudH, nn, ndim, FORWARD); // word spectrum
	spectA = fft(tempAudA, nn, ndim, FORWARD); // dirty audio spectrum
	
	// h[n] flipped to h[-n] so correlation -> convolution
	let tempArray = filterMult(spectH, spectA); // f-domain cross-correlation
	fSig = chop(uRs(fft(tempArray, nn, ndim, BACKWARD)))
	fSig = rotateLeft(fSig, stopSample[audioNum]);
	fSig = takeAtoB(fSig, 0, stopSample[audioNum]);
	fSig = ampNormalizeReal(fSig);

	// both windows
	for (var i = 0; i < stopSample[audioNum]; i++)
		{
		sigDT[i] = i; // discrete time index
		sigCT[i] = 1000*i/sampFreq; // continuous time in [ms]
		figDT[i] = i; // discrete time index
		figCT[i] = (1000*i/sampFreq); // continuous time in [ms]
		};

	// garbage collection
	audioO = [];
	tempAudH = [];
	tempAudA = [];
	tempArray = [];
	spectA = [];
	spectH = [];

	if (rChange)
		{ // r = s + N
		createWavBlob(2, rSig);
		rChange = false;
		};
		
	if (fChange)
		{ // r = s + N
		createWavBlob(3, fSig);
		hChange = false;
		rChange = false;
		fChange = false;
		};
		
	};

// ***************************************************************** \\
//
function processAudioNext()
	{
	'use strict';

	signalProcessing();

	// top window
	hCTPlot.x = binning(sigCT,targetLength);
	hCTPlot.y = binning(hSig,targetLength);
	
	sCTPlot.x = hCTPlot.x;
	sCTPlot.y = binning(sSig, targetLength);
	
	// bottom window
	fCTPlot.x = binning(figCT,targetLength);
	fCTPlot.y = binning(fSig,targetLength);

	rCTPlot.x = fCTPlot.x;
	rCTPlot.y = binning(rSig, targetLength);
	
	sigPlot = [sCTPlot, hCTPlot]; // global
	figPlot = [rCTPlot,fCTPlot]; // global
	layoutSigT = sigsCTLayout; // global
	layoutSigC = figsCTLayout; // global

	document.querySelector('#placeDur').value = windDuration;
	document.querySelector('#placeFreq').value = freq0;

	resetWindowsControls();
	};

function processAudio(localAudioNum)
	{
	'use strict';

	audioNum = localAudioNum;
	document.querySelector('#rangeSNR').max = snrValues.length - 1;
	thisSNR = snrValues[snrValues.length - 1]
	document.querySelector('#rangeSNR').value = thisSNR;
	document.querySelector('#placeSNR').value = thisSNR;
	
	processAudioNext();
	};

// *****************************************************************
// Show and then Choose SNR
function showSNR(val)
	{
	'use strict';

	thisSNR = snrValues[val];
	document.querySelector('#placeSNR').value = thisSNR;
	};

function chooseSNR(val)
	{
	'use strict';

	thisSNR = snrValues[val];
	document.querySelector('#placeSNR').value = thisSNR;
	rChange = true;
	fChange = true;
	processAudioNext();
	};

// *****************************************************************
// set window width
function showWindowWidth(value)
	{
	'use strict';

	windDuration = windows[value];
	document.querySelector('#placeDur').value = windDuration;
	};

function windowWidth(value)
	{
	'use strict';

	windDuration = windows[value];
	windowLength = Math.ceil(milliSamp*windDuration);
	hChange = true;
	fChange = true;
	processAudioNext();
	};

// *****************************************************************
// set matched filter frequency width
function showFiltFreq(value)
	{
	'use strict';

	document.querySelector('#placeFreq').value = value;
	};

function filtFreq(value)
	{
	'use strict';

	freq0 = value;
	if (freq0 < fMin) freq0 = fMin;
	if (freq0 > fMax) freq0 = fMax;
	windowLength = Math.ceil(milliSamp*windDuration)
	hChange = true;
	fChange = true;
	setTimeout( function()
		{
		processAudioNext();
		}, 100); // prevent blob timing error
	};

// ***************************************************************** \\
function fineStepF(direction)
	{
	'use strict';

	let result = freq0;
	// direction -1 means go down in frequency, +1 means go up
	if (direction === 'up') result++
	else if (direction === 'down') result--
	else throw('fineStepF has a headache.')
	filtFreq(result)
	};

// *****************************************************************
//
function prepareLab_9_5( )
	{
	'use strict';

	audioNum = 0;
	// ************ set up environment ************ 
	document.querySelector('#rangeSNR').max = snrValues.length - 1;
	document.querySelector('#rangeSNR').value = thisSNR;
	document.querySelector('#placeSNR').value = thisSNR;
	
	document.querySelector('#wind').min = 0;
	document.querySelector('#wind').max = windows.length-1;
	document.querySelector('#wind').value = 0;
	
	document.querySelector('#freq').min = fMin; // Hz
	document.querySelector('#freq').max = fMax; // Hz
	document.querySelector('#freq').value = fMin;
	
	freq0 = 100; // Hz
	windowLength = Math.ceil(milliSamp*windDuration);
	
	let tempPlatform = navigator.platform
	if (tempPlatform === 'iPhone')
		targetLength = 3*binningFactor
	else if (tempPlatform === 'iPad' || tempPlatform === 'MacIntel')
		targetLength = binningFactor
	else if (tempPlatform === 'Linux aarch64')
		targetLength = binningFactor
	else 
		{
		targetLength = binningFactor;
		console.log("Not an expected device: "+tempPlatform);
		};
	
	// First, we set up layouts
	sigsCTLayout = cloneObj(layoutCT); // defined in SSPplotting.js
	sigsCTLayout.title = '';
	sigsCTLayout.margin.t = 25;
	sigsCTLayout.margin.b = 140;
	sigsCTLayout.width = Math.floor(graphWidth[oneImage]);
	sigsCTLayout.height = Math.floor(0.75*graphHeight[oneImage]);
	sigsCTLayout.yaxis1.tickmode = 'auto';
	sigsCTLayout.yaxis1.range = [-1.05, +1.05];

	sigsCTLayout.annotations[1].text = 't [ms]';

	figsCTLayout = cloneObj(sigsCTLayout); // defined in SSPplotting.js

	sigsDTLayout = cloneObj(layoutDT); // defined in SSPplotting.js
	sigsDTLayout.title = '';
	sigsDTLayout.font.family = sigsCTLayout.font.family;
	sigsDTLayout.font.size = sigsCTLayout.font.size;
	sigsDTLayout.margin.t = sigsCTLayout.margin.t;
	sigsDTLayout.yaxis2.tickmode = 'auto';
	sigsDTLayout.yaxis2.range = [-1.05, +1.05];
	sigsDTLayout.width =  sigsCTLayout.width;
	sigsDTLayout.height =  sigsCTLayout.height;

	sigsDTLayout.annotations[1].x = sigsCTLayout.annotations[1].x;
	sigsDTLayout.annotations[1].y = sigsCTLayout.annotations[1].y;
	sigsDTLayout.annotations[1].yanchor = sigsCTLayout.annotations[1].yanchor;
	sigsDTLayout.annotations[1].text = 'n';

	figsDTLayout = cloneObj(sigsDTLayout); // defined in SSPplotting.js

	hCTPlot = cloneObj(CTPlot); // defined in SSPplotting.js
	hCTPlot.visible = true;
	hCTPlot.marker.color = 'rgba(255,105,180,0.85)'; // pink
	
	sCTPlot = cloneObj(hCTPlot);
	sCTPlot.marker.color = 'steelBlue'; // blue
	
	rCTPlot = cloneObj(hCTPlot);
	rCTPlot.marker.color = 'steelBlue'; // blue
	
	fCTPlot = cloneObj(hCTPlot); // blue
	fCTPlot.marker.color = 'rgba(255,105,180,0.85)'; // pink
	
	hDTPlot = cloneObj(DTPlot); // defined in SSPplotting.js
	hDTPlot.visible = true;
	hDTPlot.error_y.thickness = DTlineThick;
	hDTPlot.marker.size = 4.5*DTlineThick
	hDTPlot.marker.color = hCTPlot.marker.color;
	hDTPlot.width =  sigsCTLayout.width;
	hDTPlot.height =  sigsCTLayout.height;

	sDTPlot = cloneObj(hDTPlot); // defined in SSPplotting.js
	sDTPlot.marker.color = sCTPlot.marker.color;
	
	rDTPlot = cloneObj(hDTPlot); // defined in SSPplotting.js
	rDTPlot.marker.color = rCTPlot.marker.color;
	
	fDTPlot = cloneObj(hDTPlot);
	fDTPlot.marker.color = 'rgba(255,105,180,0.85)'; // pink
	
	// ************ now start signal processing ************ 
	lengthMax = 2**factor2; // defined in SSPmedia.js

	for (var i = 0; i < nDisRec; i++)
		{
		myDuration[i] = 1000*lengthMax/sampFreq;
		startSample[i] = 0;
		stopSample[i] = lengthMax;
		xLength[i] = lengthMax;
		newSamples[i] = lengthMax;
		theNames[i].data = [];
		};

	newDispSamplesT = lengthMax;
	newStartSampleT = startSample[audioNum];
	newStopSampleT = stopSample[audioNum] - startSample[audioNum];
	middleSampleT = (newStopSampleT+newStartSampleT) >> 1;
	
	sigDT = Array(lengthMax).fill(0);
	sigCT = Array(lengthMax).fill(0);
	
	for (var i = 0; i < tone1.length; i++)
		{
		tone1[i] = Math.sin(2*Math.PI*freq1*i/sampFreq);
		tone2[i] = Math.sin(2*Math.PI*freq2*i/sampFreq);
		};
	
	sSig = flatten([silence3,tone1,silence5,tone2]);
	for (var i = sSig.length; i < lengthMax; i++) sSig[i] = 0;
	
	createWavBlob(0, sSig); // signal s to be contaminated and then filtered
	
	signalProcessing();

	// ************ now place results in displays ************ 
	
	displayModeT = 'CT';
	displayModeC = 'CT';
	
	// both windows
	for (var i = 0; i < lengthMax; i++)
		{
		sigDT[i] = i; // discrete time index
		sigCT[i] = 1000*i/sampFreq; // continuous time in [ms]
		figDT[i] = i; // discrete time index
		figCT[i] = (1000*i/sampFreq); // continuous time in [ms]
		};

	// top window
	hCTPlot.x = binning(sigCT,targetLength);
	hCTPlot.y = binning(hSig,targetLength);
	
	sCTPlot.x = binning(sigCT,targetLength);
	sCTPlot.y = binning(sSig,targetLength);
	
	hDTPlot.x = sigDT;
	hDTPlot.error_y.array = Array(lengthMax).fill(0);
	hDTPlot.y = hSig;
	hDTPlot.error_y.arrayminus = hDTPlot.y;
	
	sDTPlot.x = sigDT;
	sDTPlot.error_y.array = Array(lengthMax).fill(0);
	sDTPlot.y = sSig;
	sDTPlot.error_y.arrayminus = sDTPlot.y;
	
	// bottom window
	fCTPlot.x = binning(figCT,targetLength);
	fCTPlot.y = binning(fSig,targetLength);
	
	rCTPlot.x = fCTPlot.x;
	rCTPlot.y = binning(rSig,targetLength);
	
	fDTPlot.x = figDT;
	fDTPlot.error_y.array = Array(lengthMax).fill(0);
	fDTPlot.y = fSig;
	fDTPlot.error_y.arrayminus = fDTPlot.y;
	
	rDTPlot.x = figDT;
	rDTPlot.error_y.array = Array(lengthMax).fill(0);
	rDTPlot.y = rSig;
	rDTPlot.error_y.arrayminus = rDTPlot.y;

	sigPlot = [sCTPlot, hCTPlot]; // global
	figPlot = [rCTPlot, fCTPlot]; // global
	layoutSigT = sigsCTLayout; // global
	layoutSigC = figsCTLayout; // global

	document.querySelector('#placeDur').value = windDuration;
	document.querySelector('#placeFreq').value = freq0;

	resetWindowsControls();
	
	console.log("tone 1 = "+freq1+' Hz');
	console.log("tone 2 = "+freq2+' Hz');
	};
	
