// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// Laboratory experiment 6.3a
// i.t. young
// Friday, 20 December 2019
// 
// ****************************************************************
// checked Friday, 20 December 2019

// global defined here (for now)
var dispState = 'SH';
var digiState = 'ANALOG';
var experiment = '6.3a';
var deltaN = 0; // change in number of samples (zoom)
var power = 0;
var autoCorrData = [];
var rpsd = [];
var nbins = 1;

var lengthMax = 2**Math.floor(Math.log2(100000/binningFactor))*binningFactor;
var startSample = 0;
var stopSample = lengthMax;
var middleSample = (stopSample+startSample)/2;

var newSamples = lengthMax;
var sentence = '';
var sentence1 = '';
var sentence2 = '';

var rData = Array(2*lengthMax).fill(0); // initialize
var yData =Array(lengthMax);
var xDataDT = Array(lengthMax);
var tauDT = Array(lengthMax);
var xDataCT = Array(lengthMax);
var tauCT = Array(lengthMax);
var zeroes = Array(lengthMax);

var nn = [lengthMax] // number of complex values
var ndim = 1; // 1-D signal

var nLabels = 5;
var freqTicks = Array(nLabels);
var freqLabels = Array(nLabels);
var scaleLabel = 2;

var thisZoom = 0;
var thisAlg = 'f'; // 't'=filter time domain & 'f'=filter freq. domain

// for normal (Gaussian) distribution
var myMean = 0;
var sigma = 0.25;
// for Uniform distribution
var upper = sigma*Math.sqrt(3);
var lower = - upper;
// for Exponential distribution
var lambda = sigma;
// for Binomial distribution
var choicesBin = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
// for Exponential distribution
var choicesExp = [0.1, 0.2, 0.4, 0.8, 1.6, 3.2, 6.4, 12.8, 25.6];
// for Poisson distribution
var choicesPoi = [0.1, 0.2, 0.4, 0.8, 1.6, 3.2, 6.4, 12.8, 25.6];

var choices = choicesExp;
var alpha = 1/choices[0];

var autoCorrZero = 0;
var psdZero = 0;

// templates in SSPplotting.js
// r=raw, f=filtered, s=signal, h=histogram, c=correlation, p=psd
// t=continuous time, d = discrete time
var rstg = cloneObj(CTPlot);
var rctg = cloneObj(rstg);

var rsdg = cloneObj(DTPlot);
var rcdg = cloneObj(rsdg);

var rpg = cloneObj(SpectrumPlot);

var rstl = cloneObj(layoutCT);
	rstl.font.family = axisLabelFont;
	rstl.font.size = 0.9*myTitleSize;
	rstl.margin.t = 20;
	rstl.margin.l = setLeftMargin(); // orientation & platform check;
	rstl.margin.r = 100;
	rstl.title = '';
var rctl = cloneObj(rstl);
	rstl.yaxis1.ticks = false;
	rstl.yaxis1.showticklabels = false;

var rsdl = cloneObj(layoutDT);
	rsdl.font.family = rstl.font.family;
	rsdl.font.size = rstl.font.size;
	rsdl.margin.t = rstl.margin.t;
	rsdl.margin.l = rstl.margin.l;
	rsdl.margin.r = rstl.margin.r;
	rsdl.title = '';
var rcdl = cloneObj(rsdl);
	rsdl.yaxis2.ticks = false;
	rsdl.yaxis2.showticklabels = false;

var rpl = cloneObj(layoutSpect);
	rpl.font.family = rstl.font.family;
	rpl.font.size = rstl.font.size;
	rpl.margin.t = rstl.margin.t;
	rpl.margin.l = rstl.margin.l;
	rpl.margin.r = rstl.margin.r;
	rpl.title = '';

// Define 12 display packages
var rst = [[rstg], rstl];
var rsd = [[rsdg], rsdl];

var rct = [[rctg], rctl];
var rcd = [[rcdg], rcdl];

var rp = [[rpg], rpl];

// *****************************************************************
// Functions defined here

function process_6_3a()
	{
	// Note use of global definitions for thisAlg, rdata, etc.
	// compute autocorrelation gg through Fourier domain
	var rpsdTemp = abssq(fft(rData, nn, ndim, FORWARD)); // power spectral density
	
	rpsd = uRs(rpsdTemp);
	psdZero = rpsd[0];
	
	autoCorrData = uRs(fft(rpsdTemp, nn, ndim, BACKWARD));
	autoCorrZero = autoCorrData[0];
	
	// the following are for internal checks
	let n0 = lengthMax;
	let alpha0 = Math.sqrt(2*n0/autoCorrZero); // estimate #1
	let alpha1 = 1/Math.sqrt((psdZero-autoCorrZero)/(n0*(n0-1))); // estimate #2
	let alpha2 = Math.sqrt(4*psdZero-2*autoCorrZero)/autoCorrZero; // estimate #2
	console.log('results = ', n0, 1/alpha, alpha0.toFixed(3), alpha1.toFixed(3), alpha2.toFixed(3));
	
	theName0.fS = sampFreq;
	theName0.data = ampNormalizeReal(uRs(rData));
	
	// no normalization of autocorrelations & power spectra for display
	};

// *****************************************************************
function rotateSymmetrics()
	{
	// Note use of global definitions for autoCorrData, etc.
	autoCorrData = rotateRight(autoCorrData,autoCorrData.length >> 1);
	rpsd = rotateRight(rpsd,rpsd.length >> 1);
	};

// *****************************************************************
function getData(target)
	{
	// activate displays
	if (target === 'acquire')
		{
		acquired[0] = true; // for sound playback
		rstg.visible = true;
		rsdg.visible = true;
		rctg.visible = true;
		rcdg.visible = true;
		rpg.visible = true;
		createWavBlob(0, theNames[0].data);
		document.getElementById('playCapture-'+0).disabled = false;
		document.getElementById('play_'+0).style = 'filter:opacity(100%);';
		}
	else
		throw('Houston, we have a problem in getData.');
		
	if (digiState === 'ANALOG')
		{
		document.querySelector('#tn').value = '(t)';
		document.querySelector('#tauk').value = '(\u03C4=0) = '+autoCorrZero.toFixed(0); // (tau)
		document.querySelector('#pdsZero').value = psdZero.toExponential(3);
		Plotly.react(wA, rst[0], rst[1], noMode); // raw CT signal
		Plotly.react(wC, rct[0], rct[1], noMode); // CT correlation
		Plotly.react(wD, rp[0], rp[1], noMode); // power spectral density
		}
	else if (digiState === 'DIGITAL')
		{
		document.querySelector('#tn').value = '[n]';
		document.querySelector('#tauk').value = '[k=0] = '+ autoCorrZero.toFixed(0);
		document.querySelector('#pdsZero').value = psdZero.toExponential(3);
		Plotly.react(wA, rsd[0], rsd[1], noMode); // raw DT signal
		Plotly.react(wC, rcd[0], rcd[1], noMode); // DT correlation
		Plotly.react(wD, rp[0], rp[1], noMode); // power spectral density
		};
	};

// *****************************************************************
// Choose zoom factor with slider
function myFunctionZoom(val)
	{
	thisZoom = val;
	power = Math.pow(2,thisZoom);
	newSamples = Math.floor(lengthMax/power);
	if (oddQ(newSamples)) newSamples--; // make it even
	sentence1 = "N = "+newSamples+" samples";
	document.querySelector('#placeN1').value = "N = "+newSamples+" samples";
	sentence2 = "= "+d1round(1000*newSamples/sampFreq)+" ms";
	document.querySelector('#placeN2').value = sentence2;
	deltaN = newSamples/2;

	startSample = middleSample - deltaN;
	stopSample = middleSample + deltaN;

	// all of the following are real
	var xCDataNew = Array(newSamples); // time index
	var xDDataNew = Array(newSamples); // time index
	var yDataNew = Array(newSamples); // data
	var zeroesNew = Array(newSamples);
	var freqTicksNew = Array(nLabels);
	
	// the following involve real, rotated arrays
	var tauCTnew = Array(newSamples); // correlation index
	var tauDTnew = Array(newSamples); // correlation index
	var zAuCoDN = Array(newSamples); // zoom raw phi
	var zRpsdN = Array(newSamples); // zoom raw psd

	// here is where the "zooming" occurs
	for (var i = 0; i < newSamples; i++)
		{
		// first the signals
		xCDataNew[i] = xDataCT[i+startSample];
		xDDataNew[i] = xDataDT[i+startSample];
		yDataNew[i] = yData[i+startSample]; // raw data
		zeroesNew[i] = 0;
		// now the correlation functions and the power spectral densities
		zAuCoDN[i] = autoCorrData[i+startSample]; // raw ø
		zRpsdN[i] = rpsd[i+startSample]; // raw psd
		tauCTnew[i] = tauCT[i+startSample];
		tauDTnew[i] = tauDT[i+startSample];
		};

	rstg.x = binning(xCDataNew,binningFactor);
	rstg.y = binning(yDataNew,binningFactor);

	rsdg.x = xDDataNew;
	rsdg.y = yDataNew;
	
	rsdg.error_y.array = zeroesNew;
	rsdg.error_y.arrayminus = yDataNew;
	
	rctg.x = binning(tauCTnew,binningFactor);
	rctg.y = binning(zAuCoDN,binningFactor);

	rcdg.x = tauDTnew;
	rcdg.y = zAuCoDN;
	
	rcdg.error_y.array = zeroesNew;
	rcdg.error_y.arrayminus = zAuCoDN;

	if (newSamples <= maxDTdisplay)
		{
		if (newSamples > changeDTparams)
			{
			rsdg.error_y.thickness = DTlineThick;
			rsdg.marker.size = 4*DTlineThick;
		
			rcdg.error_y.thickness = rsdg.error_y.thickness;
			rcdg.marker.size = rsdg.marker.size;
			}
		else
			{
			rsdg.error_y.thickness = 2*DTlineThick;
			rsdg.marker.size = 6*DTlineThick;
		
			rcdg.error_y.thickness = rsdg.error_y.thickness;
			rcdg.marker.size = rsdg.marker.size;
			};
		digiState = 'DIGITAL';
		}
	else
		{
		digiState = 'ANALOG';
		};

	// adjust freqTicks & freqLabels
	scaleLabel = power;
	rpg.x = binning(xDDataNew,binningFactor);
	let rpgLength = rpg.x.length;
	
	for (var i = 0; i < nLabels; i++)
		{
		// choose label positions from binned data
		freqTicksNew[i] = rpg.x[Math.floor(i*rpgLength/(nLabels-1))];
		if (i == (nLabels-1)) freqTicksNew[i] = rpg.x[rpgLength-1];

		if (i < (nLabels-1)/2)
			{
			freqLabels[i] = negPiSymbol + '/'+(scaleLabel)
			if (oddQ(i)) freqLabels[i] = negPiSymbol + '/'+(2*scaleLabel)
			}
		else if (i == (nLabels-1)/2)
			freqLabels[i] = 0
		else
			{
			freqLabels[i] = posPiSymbol + '/'+(scaleLabel)
			if (oddQ(i)) freqLabels[i] = posPiSymbol + '/'+(2*scaleLabel)
			};
		};
	if (power == 1) // special formatting case to avoid '/' symbol
		{
		freqLabels[0] = negPiSymbol;
		freqLabels[nLabels-1] = posPiSymbol;
		};

	rpg.y = binning(zRpsdN,binningFactor);
	rpl.xaxis4.tickvals = freqTicksNew;
	rpl.xaxis4.ticktext = freqLabels;

	if (digiState === 'ANALOG')
		{
		document.querySelector('#tn').value = '(t)';
		document.querySelector('#tauk').value = '(\u03C4=0) = '+autoCorrZero.toFixed(0); // (tau)
		document.querySelector('#pdsZero').value = psdZero.toExponential(3);
		Plotly.react(wA, rst[0], rst[1], noMode); // raw CT signal
		Plotly.react(wC, rct[0], rct[1], noMode); // CT correlation
		Plotly.react(wD, rp[0], rp[1], noMode); // power spectral density
		}
	else if (digiState === 'DIGITAL')
		{
		document.querySelector('#tn').value = '[n]';
		document.querySelector('#tauk').value = '[k=0] = '+ autoCorrZero.toFixed(0);
		document.querySelector('#pdsZero').value = psdZero.toExponential(3);
		Plotly.react(wA, rsd[0], rsd[1], noMode); // raw DT signal
		Plotly.react(wC, rcd[0], rcd[1], noMode); // DT correlation
		Plotly.react(wD, rp[0], rp[1], noMode); // power spectral density
		};
	};

// *****************************************************************
// test signal synthesized here
// For the sampling frequency, see: SSPconstants.js
//
function prepareLab_6_3a( )
	{
	deltaN = 0; // change in number of samples (zoom)
	power = 0;
	autoCorrData = [];
	rpsd = [];
	nbins = 1;

	lengthMax = 2**Math.floor(Math.log2(100000/binningFactor))*binningFactor;
	newSamples = lengthMax;
	startSample = 0;
	stopSample = lengthMax;
	middleSample = (stopSample+startSample)/2;

	audioNum = 0;
	thisDuration = 1000*lengthMax/sampFreq; // defined in SSPmedia.js

	for (const num of listPlayBacks)
		{
		myDuration[num] = thisDuration;
		document.getElementById('playCapture-'+num).disabled = true;
		document.getElementById('play_'+num).style = 'filter:opacity(50%) blur(3px);';
		}
	
	sentence1 = "N = "+newSamples+" samples";
	document.querySelector('#placeN1').value = "N = "+newSamples+" samples";
	sentence2 = "= "+d1round(1000*newSamples/sampFreq)+" ms";
	document.querySelector('#placeN2').value = sentence2;
	document.querySelector('#placeT').value = d1round(newSamples/sampFreq);
	
	// get random choice of probability alpha from choices
	lower = 0;
	upper = choices.length-1;
	alpha = 1/choices[randomInteger(lower,upper)];
	// initialize data in complex format
	for (var i = 0; i < 2*lengthMax; i += 2)
		rData[i] = randomExponential(alpha);
	yData = uRs(rData); // data is real
	
	for (var i = startSample; i < stopSample; i++)
		{
		xDataDT[i] = i; // discrete time index
		tauDT[i] = i - middleSample;
		xDataCT[i] = 1000*i/sampFreq; // continuous time in [ms]
		tauCT[i] = 1000*(i - middleSample)/sampFreq;
		zeroes[i] = 0;
		};
	
	for (var i = 0; i < nLabels; i++)
		{
		freqTicks[i] = Math.floor(i*newSamples/(nLabels-1));
		if (i == (nLabels-1)) freqTicks[i] = newSamples-1;
		
		if (i < (nLabels-1)/2)
			freqLabels[i] = evenQ(i) ? negPiSymbol : negPiSymbol+'/'+scaleLabel
		else if (i == (nLabels-1)/2)
			freqLabels[i] = 0
		else
			freqLabels[i] = evenQ(i) ? posPiSymbol : posPiSymbol+'/'+scaleLabel
		};
		
	process_6_3a();
	getData('acquire');
		

// signal processing initiating ends here
// *****************************************************************
// now start displays
//
	// raw data: signal & amplitude histogram
	
	rstg.x = binning(xDataCT,binningFactor);
	rstg.y = binning(yData,binningFactor);
	rstl.annotations[0].text = 't [ms]';
	
	// raw & filtered data, corr. function, power spectral densities & filter
	
	var rotSamples = Math.floor(autoCorrData.length/2);

	// these "symmetrics" require binning because they are ANALOG
	rctg.y = rotateRight(binning(autoCorrData,binningFactor),binningFactor/2);
	rctg.x = binning(tauCT,binningFactor);
	rctl.title = '';
	rctl.annotations[0].text = tau+' [ms]';
	autoCorrData = rotateRight(autoCorrData,rotSamples);

	rpg.y = rotateRight(binning(rpsd,binningFactor),binningFactor/2);
	rpg.x = binning(xDataDT,binningFactor);
	rpl.title = '';
	freqTicks[nLabels-1] = rpg.x[rpg.x.length-1];
	rpl.xaxis4.tickvals = freqTicks;
	rpl.xaxis4.ticktext = freqLabels;
	rpl.annotations[0].text = Omega;
	rpsd = rotateRight(rpsd,rotSamples);

	// these do not require binning because they are DIGITAL
	rsdg.x = xDataDT;
	rsdg.y = yData;
	rsdg.error_y.array = zeroes;
	rsdg.error_y.arrayminus = yData;
	rsdl.annotations[0].text = 'n';

	rcdg.x = tauDT;
	rcdg.y = autoCorrData;
	rcdl.title = '';
	rcdl.annotations[0].text = 'k';

	deltaN = 0; // change in number of samples (zoom)
	power = 0;

	dispState = 'SH';
	digiState = 'ANALOG';

	thisZoom = 0;
	document.querySelector('#zoomG').value = thisZoom;
	myFunctionZoom(thisZoom);
	// Await interaction
	};
