// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2022
// Licensed under the MIT license.
// Laboratory experiment 10.1
// i.t. young
// Thursday, 28 September 2017
// Sunday, 2 September 2018
// 
// ****************************************************************
// checked Tuesday, 3 October 2017
// Thursday, 29 November 2018

// global defined here (for now)
var SIMULATION = false;

var dispState = 'SH';
var digiState = 'ANALOG';
var lengthMax = 2**(factor2-1);
var experiment = '10.1';
var snrValues = [0.1, 0.5, 1, 5, 12.5, 25, 50, 100, 500, 1000]
var thisSNR = snrValues[snrValues.length-1];

// for normal (Gaussian) distribution
var myMean = 0;
var sigma = 1/thisSNR;

var startSample = 0;
var stopSample = lengthMax;

var sentence1 = '';
var sentence2 = '';

var rData = Array(2*lengthMax).fill(0); // complex signal
var nData = Array(2*lengthMax).fill(0); // complex signal
var wiener = Array(2*lengthMax).fill(0); // complex signal
var fData = Array(2*lengthMax).fill(0); // complex signal
var yrData = Array(lengthMax);
var nrData = Array(lengthMax);
var yresData = Array(lengthMax);

var xDataCT = Array(lengthMax);
var xDataF = Array(lengthMax >> 1);

var nn = [lengthMax] // number of complex values
var ndim = 1; // 1-D signal

var nLabels = 5;
var freqTicks = Array(nLabels);
var freqLabels = Array(nLabels);

// templates in SSPplotting.js
// r=raw, f=filtered, s=signal, h=histogram, c=correlation, p=psd
// t=continuous time, d = discrete time
var rstg = cloneObj(CTPlot); // Original signal
	rstg.visible = true;
	rstg.marker.color = 'steelBlue';
var nstg = cloneObj(rstg); // Noise signal, hotPink
	nstg.marker.color = 'rgba(255, 105, 180, 0.75)';
var fstg = cloneObj(rstg); // Restored signal, histoColor
	fstg.marker.color = 'rgb(0, 153, 153)';

var rstl = cloneObj(layoutCT);
	rstl.title = '';
	rstl.font.size = 0.75*myTitleSize;
	rstl.margin.t = 20;
	rstl.margin.l = setLeftMargin(); // orientation & platform check;
	
	rstl.annotations[0].text = 't [ms]';

	rstl.annotations[2].font.family = myTitleFont;
	rstl.annotations[2].y = titleAboveAxis;

var fstl = cloneObj(rstl);

var rpg = cloneObj(SpectrumPlot); // Signal spectrum
	rpg.visible = true;
	rpg.marker.color = 'steelBlue';

var npg = cloneObj(rpg); // Noise spectrum
	npg.marker.color = 'rgba(255,105,180,0.85)';
var wpg = cloneObj(rpg); //  Wiener spectrum
	wpg.marker.color = 'rgba(0, 153, 153, 1)';

var rpl = cloneObj(layoutSpect);
	rpl.title = '';
	rpl.title = '';
	rpl.margin.t = rstl.margin.t;
	rpl.margin.l = rstl.margin.l;
	rpl.margin.r = rstl.margin.r;
	rpl.annotations[0].text = 'f  [kHz]';
	rpl.annotations[2].font.family = rstl.annotations[2].font.family;
	rpl.annotations[2].y = rstl.annotations[2].y;
var wpl = cloneObj(rpl);


// *****************************************************************

function process_10_1()
	{
	// Note use of global definitions for thisAlg, rdata, etc.
	// compute normalized autocorrelation gg through Fourier domain
	yrData = uRs(rData); // signal data is real
	nrData = uRs(nData); // noise data is real
	frData = uRs(fData); // signal + noise data is real

	var rSpect = fft(rData, nn, ndim, FORWARD); // signal spectrum
	var nSpect = fft(nData, nn, ndim, FORWARD); // signal spectrum
	var fSpect = fft(fData, nn, ndim, FORWARD); // signal spectrum
	var rpsdTemp = abssq(rSpect); // power spectral density
	rpsd = uRs(rpsdTemp);
	var npsdTemp = abssq(nSpect); // power spectral density
	npsd = uRs(npsdTemp);
	
	// calculate Wiener filter
	for (var i = 0; i < 2*lengthMax; i += 2)
		{
		let veryTemp = rpsdTemp[i];
		if (veryTemp == 0)
			wiener[i] = 0
		else
			wiener[i] = veryTemp/(veryTemp + npsdTemp[i]);
		};
	wSpect = chop(uRs(abs(wiener)));
	
	// restore with Wiener filter
	var resSpect = filterMult(wiener, fSpect); // f-domain filtering
	yresData = uRs(fft(resSpect, nn, ndim, BACKWARD)); // restored signal

	theName0.fS = sampFreq;
	theName1.fS = sampFreq;
	theName2.fS = sampFreq;
	theName0.data = ampNormalizeReal(yrData); // signal
	createWavBlob(0, theNames[0].data);
	
	theName1.data = ampNormalizeReal(frData); // signal + noise
	createWavBlob(1, theNames[1].data);

	theName2.data = ampNormalizeReal(yresData); // restored signal
	createWavBlob(2, theNames[2].data);
	};

// *****************************************************************
// Choose SNR factor with slider
function showSNR(val)
	{
	let localSNR = snrValues[val];
	document.querySelector('#placeN3').value = "SNR = "+localSNR+":1";
	document.querySelector('#snr1').value = localSNR;
	};

// Choose SNR factor with slider
function getSNR(val)
	{
	'use strict';

	thisSNR = snrValues[val];
	document.querySelector('#placeN3').value = "SNR = "+thisSNR+":1";
	document.querySelector('#snr1').value = thisSNR;
	sigma = 1/thisSNR;

	for (var i = 0; i < 2*lengthMax; i += 2)
		{
		nData[i] = randomGaussian(myMean,sigma);
		fData[i] = rData[i] + nData[i];
		};

	process_10_1();

	rstg.y = binning(yrData,altBinningFactor);
	nstg.y = binning(nrData,altBinningFactor);
	
	// restored signal
	fstg.y = ampNormalizeReal(binning(yresData,altBinningFactor));
	document.querySelector('#snr1').value = thisSNR;
	
	// raw & filtered data, corr. function, power spectral densities & filter
	
	rpg.y = binning(takeAtoB(rpsd, 0, rpsd.length>>1),altBinningFactor);
	npg.y = binning(takeAtoB(npsd, 0, npsd.length>>1),altBinningFactor);
	wpg.y = binning(takeAtoB(wSpect, 0, wSpect.length>>1),altBinningFactor);
	
	Plotly.react(wA, [rstg, nstg], rstl, noMode);
	Plotly.react(wB, [npg, rpg], rpl, noMode);
	Plotly.react(wC, [wpg], wpl, noMode);
	Plotly.react(wD, [fstg], fstl, noMode);
	};

// *****************************************************************
//
function prepareLab_10_1( )
	{
	'use strict';

	document.querySelector('#snr').max = snrValues.length - 1;
	document.querySelector('#snr').value = thisSNR;
	document.querySelector('#placeN3').value = "SNR = "+thisSNR+":1";

	audioNum = 0;
	myDuration[audioNum] = 1000*lengthMax/sampFreq; // defined in SSPmedia.js;

	sentence1 =  "N = "+lengthMax+" samples";
	document.querySelector('#placeN1').value = "N = "+lengthMax+" samples";
	sentence2 = "= "+d1round(1000*lengthMax/sampFreq)+" ms";
	document.querySelector('#placeN2').value = sentence2;
	
	// initialize data in complex format
	// first signal
	rData[rData.length >> 2] = 1; // unit impulse at 1/4 distance (complex format)

	// then noise & (signal + noise)
	for (var i = 0; i < 2*lengthMax; i += 2)
		{
		nData[i] = randomGaussian(myMean,sigma);
		fData[i] = rData[i] + nData[i];
		};

	for (var i = startSample; i < stopSample; i++)
		{
		xDataCT[i] = 1000*i/sampFreq; // continuous time in [ms]
		xDataF[i>>1] = i>>1; // discrete time index
		};
	
	for (var i = 0; i < nLabels; i++)
		{
		freqTicks[i] = Math.floor(i*(lengthMax>>1)/(nLabels-1));
		freqLabels[i] = d1round(sampFreq*i/8000);
		};
		
	freqTicks[nLabels-1]--; // graphic compromise
	process_10_1();
	
// signal processing initiating ends here
// *****************************************************************
// now start displays
//
	// signal & noise data
	rstg.x = binning(xDataCT,altBinningFactor);
	rstg.y = binning(yrData,altBinningFactor);
	nstg.x = rstg.x;
	nstg.y = binning(nrData,altBinningFactor);
	rstl.annotations[2].text = '';

	
	// restored signal
	fstg.x = rstg.x;
	fstg.y = ampNormalizeReal(binning(yresData,altBinningFactor));
	document.querySelector('#snr1').value = thisSNR;

	// raw & filtered data, corr. function, power spectral densities & filter
	rpg.x = binning(xDataF,altBinningFactor);
	rpg.y = binning(takeAtoB(rpsd, 0, rpsd.length>>1),altBinningFactor);
	
	npg.x = rpg.x;
	npg.y = binning(takeAtoB(npsd, 0, npsd.length>>1),altBinningFactor);
	
	freqTicks[nLabels-1] = rpg.x[rpg.x.length-1];
	rpl.xaxis4.tickvals = freqTicks;
	rpl.xaxis4.ticktext = freqLabels;
	rpl.annotations[2].text = '';

	wpg.y = binning(takeAtoB(wSpect, 0, wSpect.length>>1),altBinningFactor);
	wpg.x = rpg.x;
	wpl.xaxis4.tickvals = rpl.xaxis4.tickvals;
	wpl.xaxis4.ticktext = rpl.xaxis4.ticktext;
	wpl.annotations[2].text = '';
	
	Plotly.react(wA, [rstg, nstg], rstl, noMode);
	Plotly.react(wB, [npg, rpg], rpl, noMode);
	Plotly.react(wC, [wpg], wpl, noMode);
	Plotly.react(wD, [fstg], fstl, noMode);

	// Await interaction
	};
	
