// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// Laboratory experiment 6.1
// i.t. young
// Wednesday, 11 December 2019
// 
// ****************************************************************
// checked Wednesday, 11 December 2019

// global defined here (for now)
var dispState = 'SH';
var digiState = 'ANALOG';
var experiment = '6.1a';
var deltaN = 0; // change in number of samples (zoom)
var power = 0;
var autoCorrData = [];
var rpsd = [];
var nbins = 1;

var lengthMax = 2**(factor2-1);
var startSample = 0;
var stopSample = lengthMax;
var middleSample = (stopSample+startSample) >> 1;

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
var p = 0.5;

// templates in SSPplotting.js
// r=raw, f=filtered, s=signal, h=histogram, c=correlation, p=psd
// t=continuous time, d = discrete time
var rstg = cloneObj(CTPlot);
var rctg = cloneObj(rstg);

var rsdg = cloneObj(DTPlot);
var rcdg = cloneObj(rsdg);

var rhg = cloneObj(Histogram);
	rhg.xbins.start = null;
	rhg.xbins.end = null;

var rpg = cloneObj(SpectrumPlot);

var rstl = cloneObj(layoutCT);
	rstl.font.family = axisLabelFont;
	rstl.font.size = 0.9*myTitleSize;
	rstl.margin.t = 20;
	rstl.margin.l = setLeftMargin(); // orientation & platform check;
	rstl.margin.r = 100;
	rstl.title = '';
var rctl = cloneObj(rstl);

var rsdl = cloneObj(layoutDT);
	rsdl.font.family = rstl.font.family;
	rsdl.font.size = rstl.font.size;
	rsdl.margin.t = rstl.margin.t;
	rsdl.margin.l = rstl.margin.l;
	rsdl.margin.r = rstl.margin.r;
	rsdl.title = '';
var rcdl = cloneObj(rsdl);

var rhl = cloneObj(layoutH);
	rhl.font.family = rstl.font.family;
	rhl.font.size = rstl.font.size;
	rhl.margin.t = rstl.margin.t;
	rhl.margin.l = rstl.margin.l;
	rhl.margin.r = rstl.margin.r;
	rhl.title = '';

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

var rh = [[rhg], rhl];


// *****************************************************************
// Functions defined here

function process_6_1()
	{
	// Note use of global definitions for thisAlg, rdata, etc.
	// compute normalized autocorrelation gg through Fourier domain
	var rpsdTemp = abssq(fft(rData, nn, ndim, FORWARD)); // power spectral density
	rpsd = uRs(rpsdTemp);
	autoCorrData = uRs(fft(rpsdTemp, nn, ndim, BACKWARD));
		
	theName0.fS = sampFreq;
	theName0.data = ampNormalizeReal(uRs(rData));
	
	// normalize autocorrelations & power spectra for display
	autoCorrData = ampNormalizeReal(autoCorrData);
	rpsd = ampNormalizeReal(rpsd);
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
		rhg.visible = true;
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
		document.querySelector('#tauk').value = '(\u03C4)'; // (tau)
		Plotly.react(wA, rst[0], rst[1], noMode); // raw CT signal
		Plotly.react(wB, rh[0], rh[1], noMode); // raw histogram
		Plotly.react(wC, rct[0], rct[1], noMode); // CT correlation
		Plotly.react(wD, rp[0], rp[1], noMode); // power spectral density
		}
	else if (digiState === 'DIGITAL')
		{
		document.querySelector('#tn').value = '[n]';
		document.querySelector('#tauk').value = '[k]';
		Plotly.react(wA, rsd[0], rsd[1], noMode); // raw DT signal
		Plotly.react(wB, rh[0], rh[1], noMode); // raw histogram
		Plotly.react(wC, rcd[0], rcd[1], noMode); // DT correlation
		Plotly.react(wD, rp[0], rp[1], noMode); // power spectral density
		};
	};

// *****************************************************************
// Choose zoom factor with slider
function myFunctionZoom(val)
	{
	thisZoom = val;
	power = 2**thisZoom;
	newSamples = lengthMax >> thisZoom;
	if (oddQ(newSamples)) newSamples--; // make it even
	sentence1 = "N = "+newSamples+" samples";
	document.querySelector('#placeN1').value = "N = "+newSamples+" samples";
	sentence2 = "= "+d1round(1000*newSamples/sampFreq)+" ms";
	document.querySelector('#placeN2').value = sentence2;
	deltaN = newSamples >> 1;

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

	rstg.x = binning(xCDataNew,altBinningFactor);
	rstg.y = binning(yDataNew,altBinningFactor);

	rsdg.x = xDDataNew;
	rsdg.y = yDataNew;
	
	rsdg.error_y.array = zeroesNew;
	rsdg.error_y.arrayminus = yDataNew;
	
	rctg.x = binning(tauCTnew,altBinningFactor);
	rctg.y = binning(zAuCoDN,altBinningFactor);

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

	rhg.x = yDataNew;
	let dynRange = getDynRange(rhg.x)[0]; // get dynamic range
	nbins = Math.floor(Math.sqrt(rhg.x.length));
	rhg.xbins.size = dynRange/nbins; // automatic choice

	// adjust freqTicks & freqLabels
	scaleLabel = power;
	rpg.x = binning(xDDataNew,altBinningFactor);
	let rpgLength = rpg.x.length;
	
	for (var i = 0; i < nLabels; i++)
		{
		// choose label positions from binned data
		freqTicksNew[i] = rpg.x[Math.floor(i*rpgLength/(nLabels-1))];
		if (i == (nLabels-1)) freqTicksNew[i] = rpg.x[rpgLength-1];

		if (i < (nLabels-1)>>1)
			{
			freqLabels[i] = negPiSymbol + '/'+(scaleLabel)
			if (oddQ(i)) freqLabels[i] = negPiSymbol + '/'+(2*scaleLabel)
			}
		else if (i == (nLabels-1)>>1)
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

	rpg.y = ampNormalizeReal(binning(zRpsdN,altBinningFactor));
	rpl.xaxis4.tickvals = freqTicksNew;
	rpl.xaxis4.ticktext = freqLabels;

	if (digiState === 'ANALOG')
		{
		document.querySelector('#tn').value = '(t)';
		document.querySelector('#tauk').value = '(\u03C4)'; // (tau)
		Plotly.react(wA, rst[0], rst[1], noMode); // raw CT signal
		Plotly.react(wB, rh[0], rh[1], noMode); // raw histogram
		Plotly.react(wC, rct[0], rct[1], noMode); // CT correlation
		Plotly.react(wD, rp[0], rp[1], noMode); // power spectral density
		}
	else if (digiState === 'DIGITAL')
		{
		document.querySelector('#tn').value = '[n]';
		document.querySelector('#tauk').value = '[k]';
		Plotly.react(wA, rsd[0], rsd[1], noMode); // raw DT signal
		Plotly.react(wB, rh[0], rh[1], noMode); // raw histogram
		Plotly.react(wC, rcd[0], rcd[1], noMode); // DT correlation
		Plotly.react(wD, rp[0], rp[1], noMode); // power spectral density
		};
	};

// *****************************************************************
// test signal synthesized here
// For the sampling frequency, see: SSPconstants.js
//
function prepareLab_6_1( )
	{
	deltaN = 0; // change in number of samples (zoom)
	power = 0;
	autoCorrData = [];
	rpsd = [];
	nbins = 1;

	lengthMax = 2**(factor2-1);
	newSamples = lengthMax;
	startSample = 0;
	stopSample = lengthMax;
	middleSample = (stopSample+startSample) >> 1;

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
	document.querySelector('#placeT1').value = d1round(newSamples/sampFreq);
	document.querySelector('#placeT2').value = d1round(newSamples/sampFreq);
	
	// initialize data in complex format
	for (var i = 0; i < 2*lengthMax; i += 2)
		rData[i] = randomGaussian(myMean,sigma);
	
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
		
		if (i < (nLabels-1)>>1)
			freqLabels[i] = evenQ(i) ? negPiSymbol : negPiSymbol+'/'+scaleLabel
		else if (i == (nLabels-1)>>1)
			freqLabels[i] = 0
		else
			freqLabels[i] = evenQ(i) ? posPiSymbol : posPiSymbol+'/'+scaleLabel
		};
		
	process_6_1();
	getData('acquire');
		

// signal processing initiating ends here
// *****************************************************************
// now start displays
//
	// raw data: signal & amplitude histogram
	
	rstg.x = binning(xDataCT,altBinningFactor);
	rstg.y = binning(yData,altBinningFactor);
	rstl.annotations[0].text = 't [ms]';

	rhg.x = yData;
	let dynRange = getDynRange(rhg.x)[0]; // get dynamic range
	nbins = Math.floor(Math.sqrt(rhg.x.length));
	rhg.xbins.size = dynRange/nbins; // automatic choice
	rhl.annotations[0].text = 'signal amplitude';
	
	// raw & filtered data, corr. function, power spectral densities & filter
	
	var rotSamples = autoCorrData.length >> 1;

	// these "symmetrics" require binning because they are ANALOG
	rctg.y = rotateRight(binning(autoCorrData,altBinningFactor),altBinningFactor >> 1);
	rctg.x = binning(tauCT,altBinningFactor);
	rctl.title = '';
	rctl.annotations[0].text = tau+' [ms]';
	autoCorrData = rotateRight(autoCorrData,rotSamples);

	rpg.y = rotateRight(binning(rpsd,altBinningFactor),altBinningFactor>>1);
	rpg.x = binning(xDataDT,altBinningFactor);
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

	dispState = 'SH';
	digiState = 'ANALOG';

	myFunctionZoom(thisZoom);
	// Await interaction
	};
