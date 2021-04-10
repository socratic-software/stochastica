// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// Laboratory experiment 6.6
// i.t. young
// Thursday, 28 September 2017
// 
// ****************************************************************
// checked Tuesday, 3 October 2017

// global defined here (for now)
var dispState = 'SH';
var digiState = 'ANALOG';
var experiment = '6.6a';
var deltaN = 0; // change in number of samples (zoom)
var power = 0;
var autoCorrData = [];
var autoFiltCorrData = [];
var rpsd = [];
var fpsd = [];
var origFilter = [];
var nbins = 1;

lengthMax = 2**Math.floor(Math.log2(100000/binningFactor))*binningFactor;
var startSample = 0;
var stopSample = lengthMax;
var middleSample = (stopSample+startSample)/2;

var newSamples = lengthMax;
var sentence = '';
var sentence1 = '';
var sentence2 = '';

var rData = Array(2*lengthMax).fill(0); // initialize
var yData = Array(lengthMax);
var yfData = Array(lengthMax);
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

var leftCoeffs = [1,0];
var rightCoeffs = [1,0];
var coefficients = [ leftCoeffs, rightCoeffs ];

var thisZoom = 0;

// for normal (Gaussian) distribution
var myMean = 0;
var sigma = 0.25;
// for Uniform distribution
var upper = sigma*Math.sqrt(3);
var lower = -upper;
// for Exponential distribution
var lambda = sigma;

// templates in SSPplotting.js
// r=raw, f=filtered, s=signal, h=histogram, c=correlation, p=psd
// t=continuous time, d = discrete time
var rstg = cloneObj(CTPlot);
	rstg.visible = true;
var rctg = cloneObj(rstg);
var fstg = cloneObj(rstg);
var fctg = cloneObj(rstg);

var rsdg = cloneObj(DTPlot);
	rsdg.visible = true;
var rcdg = cloneObj(rsdg);
var fsdg = cloneObj(rsdg);
var fcdg = cloneObj(rsdg);

var rhg = cloneObj(Histogram);
	rhg.xbins.start = null;
	rhg.xbins.end = null;
var fhg = cloneObj(rhg);

var rpg = cloneObj(SpectrumPlot);
	rpg.visible = true;
var fpg = cloneObj(rpg);
var opg = cloneObj(rpg);

var rstl = cloneObj(layoutCT);
	rstl.font.family = axisLabelFont;
	rstl.font.size = 0.8*myTitleSize;
	rstl.margin.t = 30;
	rstl.margin.l = setLeftMargin(); // orientation & platform check;
	rstl.margin.b = 110;
	rstl.margin.r = 100;
var rctl = cloneObj(rstl);
var fstl = cloneObj(rstl);
var fctl = cloneObj(rstl);

var rsdl = cloneObj(layoutDT);
	rsdl.font.family = axisLabelFont;
	rsdl.font.size = rstl.font.size;
	rsdl.margin.t = rstl.margin.t;
	rsdl.margin.l = rstl.margin.l;
	rsdl.margin.b = rstl.margin.b;
	rsdl.margin.r = rstl.margin.r;
var rcdl = cloneObj(rsdl);
var fsdl = cloneObj(rsdl);
var fcdl = cloneObj(rsdl);

var rhl = cloneObj(layoutH);
	rhl.font.family = axisLabelFont;
	rhl.font.size = rstl.font.size;
	rhl.margin.t = rstl.margin.t;
	rhl.margin.l = rstl.margin.l;
	rhl.margin.b = rstl.margin.b;
	rhl.margin.r = rstl.margin.r;
var fhl = cloneObj(rhl);

var rpl = cloneObj(layoutSpect);
	rpl.font.family = axisLabelFont;
	rpl.font.size = rstl.font.size;
	rpl.margin.t = rstl.margin.t;
	rpl.margin.l = rstl.margin.l;
	rpl.margin.b = rstl.margin.b;
	rpl.margin.r = rstl.margin.r;
var fpl = cloneObj(rpl);
var opl = cloneObj(rpl);

// Define 12 display packages
var rst = [[rstg], rstl];
var rsd = [[rsdg], rsdl];

var fst = [[fstg], fstl];
var fsd = [[fsdg], fsdl];

var rct = [[rctg], rctl];
var rcd = [[rcdg], rcdl];

var fct = [[fctg], fctl];
var fcd = [[fcdg], fcdl];

var rp = [[rpg], rpl];
var fp = [[fpg], fpl];
var op = [[opg], opl];

var rh = [[rhg], rhl];
var fh = [[fhg], fhl];


// *****************************************************************
// Functions defined here

function process_6_6()
	{
	// Note use of global definitions for thisAlg, rdata, etc.
	// compute normalized autocorrelation gg through Fourier domain
	var rSpect = fft(rData, nn, ndim, FORWARD); // signal spectrum
	var Spect,fpsdTemp;
	var rpsdTemp = abssq(rSpect); // power spectral density
	rpsd = uRs(rpsdTemp);
	autoCorrData = uRs(fft(rpsdTemp, nn, ndim, BACKWARD));
	
	// filter in t-domain
	let fData = recurrenceFilter(coefficients, rData); // two pole, t-domain filtering
	yfData = uRs(fData); // data is real
	// compute normalized autocorrelation FF through Fourier domain
	Spect = fft(fData, nn, ndim, FORWARD); // signal spectrum
	
	theName0.fS = sampFreq;
	theName0.data = ampNormalizeReal(yData);
	
	theName1.fS = sampFreq;
	theName1.data = ampNormalizeReal(yfData);

	// compute power spectrum, normalized autocorrelation, |H(Omega)|**2;
	fpsdTemp = abssq(Spect); // power spectral density
	fpsd = uRs(fpsdTemp); // power spectral density
	autoFiltCorrData = uRs(fft(fpsdTemp, nn, ndim, BACKWARD));
	for(var i = 0; i < fpsd.length; i++)
		origFilter[i] = fpsd[i]/rpsd[i];

	// normalize autocorrelations & power spectra for display
	autoCorrData = ampNormalizeReal(autoCorrData);
	autoFiltCorrData = ampNormalizeReal(autoFiltCorrData);
	console.log('|H(Ω=0)| = ',fpsd[0].toExponential(5), rpsd[0].toExponential(5), 
		(fpsd[0]/rpsd[0]).toExponential(5), origFilter[0].toFixed(5), 
		Math.pow(origFilter[0],0.5).toFixed(5));
	};

// *****************************************************************
function rotateSymmetrics()
	{
	// Note use of global definitions for autoCorrData, etc.
	autoCorrData = rotateRight(autoCorrData,autoCorrData.length >> 1);
	autoFiltCorrData = rotateRight(autoFiltCorrData,autoFiltCorrData.length >> 1);
	rpsd = rotateRight(rpsd,rpsd.length >> 1);
	fpsd = rotateRight(fpsd,fpsd.length >> 1);
	origFilter = rotateRight(origFilter,origFilter.length >> 1);
	};

// *****************************************************************
// Choose zoom factor with slider
function myFunctionZoom(val)
	{
	thisZoom = val;
	power = Math.pow(2,thisZoom);
	newSamples = lengthMax >> thisZoom;
	sentence1 = "N = "+newSamples+" samples";
	document.querySelector('#placeN1').value = sentence1;
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
	var zFdN = Array(newSamples); // zoom filt data
	var freqTicksNew = Array(nLabels);
	
	// the following involve real, rotated arrays
	var tauCTnew = Array(newSamples); // correlation index
	var tauDTnew = Array(newSamples); // correlation index
	var zAuCoDN = Array(newSamples); // zoom raw phi
	var zAuFiCoDN = Array(newSamples); // zoom filt phi
	var zRpsdN = Array(newSamples); // zoom raw psd
	var zfilter = Array(newSamples); // zoom filter
	var ofilter = Array(newSamples); // zoom filter

	// here is where the "zooming" occurs
	for (var i = 0; i < newSamples; i++)
		{
		// first the signals
		xCDataNew[i] = xDataCT[i+startSample];
		xDDataNew[i] = xDataDT[i+startSample];
		yDataNew[i] = yData[i+startSample]; // raw data
		zFdN[i] = yfData[i+startSample]; // filtered data
		zeroesNew[i] = 0;
		// now the correlation functions and the power spectral densities
		zAuCoDN[i] = autoCorrData[i+startSample]; // raw ø
		zAuFiCoDN[i] = autoFiltCorrData[i+startSample]; // filt ø
		zRpsdN[i] = rpsd[i+startSample]; // raw psd
		zfilter[i] = fpsd[i+startSample]; // filt psd
		ofilter[i] = origFilter[i+startSample]; // filt psd
		tauCTnew[i] = tauCT[i+startSample];
		tauDTnew[i] = tauDT[i+startSample];
		};

	rstg.x = binning(xCDataNew,binningFactor);
	fstg.x = rstg.x;
	rstg.y = binning(yDataNew,binningFactor);
	fstg.y = binning(zFdN,binningFactor);

	rsdg.x = xDDataNew;
	fsdg.x = rsdg.x;
	rsdg.y = yDataNew;
	fsdg.y = zFdN;
	
	rsdg.error_y.array = zeroesNew;
	fsdg.error_y.array = rsdg.error_y.array;
	rsdg.error_y.arrayminus = yDataNew;
	fsdg.error_y.arrayminus = zFdN;
	
	rctg.x = binning(tauCTnew,binningFactor);
	fctg.x = rctg.x;
	rctg.y = binning(zAuCoDN,binningFactor);
	fctg.y = binning(zAuFiCoDN,binningFactor);

	rcdg.x = tauDTnew;
	fcdg.x = rcdg.x;
	rcdg.y = zAuCoDN;
	fcdg.y = zAuFiCoDN;
	
	rcdg.error_y.array = zeroesNew;
	fcdg.error_y.array = rcdg.error_y.array;
	rcdg.error_y.arrayminus = zAuCoDN;
	fcdg.error_y.arrayminus = zAuFiCoDN;

	fpl.yaxis4.tickmode = 'log';
	opl.yaxis4.tickmode = fpl.yaxis4.tickmode;
	if (newSamples <= maxDTdisplay)
		{
		fpl.yaxis4.tickfont.size =  0.85*axisTickSize;
		opl.yaxis4.tickfont.size = fpl.yaxis4.tickfont.size;
		if (experiment === '6.6a')
			{
			fpl.yaxis4.tickformat = fpl.yaxis4.tickformat // do nothing
			opl.yaxis4.tickformat = opl.yaxis4.tickformat // do nothing
			}
		else if (experiment === '6.6b')
			{
			fpl.yaxis4.tickformat = fpl.yaxis4.tickformat // do nothing
			opl.yaxis4.tickformat = opl.yaxis4.tickformat // do nothing
			}
		else if (experiment === '6.6c')
			{
			fpl.yaxis4.tickformat = fpl.yaxis4.tickformat // do nothing
			opl.yaxis4.tickformat = opl.yaxis4.tickformat // do nothing
			}
		else throw('Lab 6.6.js: Problem in myFunctionZoom()');

		if (newSamples > changeDTparams)
			{
			rsdg.error_y.thickness = DTlineThick;
			rsdg.marker.size = 3*DTlineThick;
		
			fsdg.error_y.thickness = DTlineThick;
			fsdg.marker.size = 3*DTlineThick;
		
			rcdg.error_y.thickness = DTlineThick;
			rcdg.marker.size = 3*DTlineThick;
		
			fcdg.error_y.thickness = DTlineThick;
			fcdg.marker.size = 3*DTlineThick;
			}
		else
			{
			rsdg.error_y.thickness = 2*DTlineThick;
			rsdg.marker.size = 5*DTlineThick;
		
			fsdg.error_y.thickness = 2*DTlineThick;
			fsdg.marker.size = 5*DTlineThick;
		
			rcdg.error_y.thickness = 2*DTlineThick;
			rcdg.marker.size = 5*DTlineThick;
		
			fcdg.error_y.thickness = 2*DTlineThick;
			fcdg.marker.size = 5*DTlineThick;
			};
		digiState = 'DIGITAL';
		}
	else
		{
		fpl.yaxis4.tickfont.size = 0.85*axisTickSize;
		opl.yaxis4.tickfont.size = fpl.yaxis4.tickfont.size;
		digiState = 'ANALOG';
		};

	rhg.x = yDataNew;
	let dynRange = getDynRange(rhg.x)[0]; // get dynamic range
	nbins = Math.floor(Math.sqrt(rhg.x.length));
	rhg.xbins.size = dynRange/nbins; // automatic choice

	fhg.x = zFdN;
	dynRange = getDynRange(fhg.x)[0]; // get dynamic range
	nbins = Math.floor(Math.sqrt(fhg.x.length));
	fhg.xbins.size = dynRange/nbins; // automatic choice

	fhl.title = '<i>Filtered amplitude histogram</i>';

	// adjust freqTicks & freqLabels
	scaleLabel = power;
	rpg.x = binning(xDDataNew,binningFactor);
	let rpgLength = rpg.x.length;
	
	for (var i = 0; i < nLabels; i++)
		{
		// choose label positions from binned data
		freqTicksNew[i] = rpg.x[Math.floor(i*rpgLength/(nLabels-1))];
		if (i == (nLabels-1)) freqTicksNew[i] = rpg.x[rpgLength-1];
		if (thisZoom >= document.querySelector('#zm').max-1)
			freqLabels[i] = d3round((sampFreq/scaleLabel)*(i - ((nLabels-1)/2))/4000)
		else
			freqLabels[i] = d2round((sampFreq/scaleLabel)*(i - ((nLabels-1)/2))/4000);
		};

	rpg.y = binning(zRpsdN,binningFactor);
	rpl.xaxis4.tickvals = freqTicksNew;
	rpl.xaxis4.ticktext = freqLabels;
	rpl.yaxis4.tickfont.size = 0.85*axisTickSize;

	fpg.x = rpg.x;
	fpg.y = binning(zfilter,binningFactor); // no normalization
	fpl.xaxis4.tickvals = freqTicksNew;
	fpl.xaxis4.ticktext = freqLabels;

	opg.x = rpg.x;
	opg.y = binning(ofilter,binningFactor); // no normalization
	opl.xaxis4.tickvals = fpl.xaxis4.tickvals;
	opl.xaxis4.ticktext = fpl.xaxis4.ticktext;

	myFunctionDisp(dispState,digiState,wA,wB,wC,wD);
	};

// *****************************************************************
// test signal synthesized here
// For the sampling frequency, see: SSPconstants.js
//
function prepareLab_6_6()
	{
	audioNum = 0;
	thisDuration = 1000*lengthMax/sampFreq; // defined in SSPmedia.js

	for (const num of listPlayBacks)
		{
		myDuration[num] = thisDuration;
		document.getElementById('playCapture-'+num).disabled = true;
		document.getElementById('play_'+num).style = 'filter:opacity(50%) blur(3px);';
		}
	
	sentence1 = "N = "+newSamples+" samples";
	document.querySelector('#placeN1').value = sentence1;
	sentence2 = "= "+d1round(1000*newSamples/sampFreq)+" ms";
	document.querySelector('#placeN2').value = sentence2;
	document.querySelector('#placeT').value = d1round(newSamples/sampFreq);
	
	let cutoff = 2*Math.PI*4135;
	let radius = 0.98;
	let beta = cutoff/sampFreq;
	if(experiment === '6.6a')
		{
		leftCoeffs = [1, 0, - 2*r*Math.cos(beta), 0, r*r, 0]; // complex format
		coefficients = [ leftCoeffs, rightCoeffs ];
		// generate Gaussian data in complex format
		for (var i = 0; i < 2*lengthMax; i += 2)
			rData[i] = randomGaussian(myMean,sigma);
		}
	else if(experiment === '6.6b')
		{
		leftCoeffs = [1, 0, - 2*r*Math.cos(beta), 0, r*r, 0]; // complex format
		rightCoeffs = [1 + r*r - 2*r*Math.cos(beta), 0]; // complex format
		// generate yniform data in complex format
		for (var i = 0; i < 2*lengthMax; i += 2)
			rData[i] = randomReal(lower,upper);
		}
	else if(experiment === '6.6c')
		{
		leftCoeffs = [1, 0, - 2*r*Math.cos(beta), 0, r*r, 0]; // complex format
		rightCoeffs = [Math.sin(beta), 0]; // complex format
		// generate exponential data in complex format
		for (var i = 0; i < 2*lengthMax; i += 2)
			rData[i] = randomExponential(lambda);
		}
	else throw('Problem in prepareLab_6_6');
	coefficients = [ leftCoeffs, rightCoeffs ];

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
		freqLabels[i] = d2round(sampFreq*(i - ((nLabels-1)/2))/4000);
		};
		
	console.log('true H(Ω=0) = ', (total(rightCoeffs)[0]/total(leftCoeffs)[0]).toFixed(5));
	
	process_6_6();
		

// signal processing initiating ends here
// *****************************************************************
// now start displays
//
	// raw data: signal & amplitude histogram
	
	rstg.x = binning(xDataCT,binningFactor);
	rstg.y = binning(yData,binningFactor);
	rstl.annotations[0].text = 't [ms]';

	rhg.x = yData;
	let dynRange = getDynRange(rhg.x)[0]; // get dynamic range
	nbins = Math.floor(Math.sqrt(rhg.x.length));
	rhg.xbins.size = dynRange/nbins; // automatic choice
	rhl.title = 'Amplitude histogram';
	rhl.annotations[0].text = 'signal amplitude';

	// filtered data: signal & amplitude histogram
	fstg.x = rstg.x;
	fstg.y = binning(yfData,binningFactor);
	fstl.title = '<i>Filtered Gaussian noise</i>';
	fstl.annotations[0].text = 't [ms]';


	fhg.x = yfData;
	dynRange = getDynRange(fhg.x)[0]; // get dynamic range
	nbins = Math.floor(Math.sqrt(fhg.x.length));
	fhg.xbins.size = dynRange/nbins; // automatic choice
	fhl.title = 'Filtered amplitude histogram';
	fhl.annotations[0].text = 'signal amplitude';
	
	// raw & filtered data, corr. function, power spectral densities & filter
	
	var rotSamples = autoCorrData.length >> 1;

	// these "symmetrics" require binning because they are ANALOG
	rctg.y = rotateRight(binning(autoCorrData,binningFactor),binningFactor/2);
	rctg.x = binning(tauCT,binningFactor);
	rctl.title = '<i>Normalized 𝜑<sub>gg</sub>(\u03C4 = kT)</i>';
	rctl.annotations[0].text = tau+' [ms]';
	autoCorrData = rotateRight(autoCorrData,rotSamples);

	fctg.y = rotateRight(binning(autoFiltCorrData,binningFactor),binningFactor/2);
	fctg.x = rctg.x;
	fctl.title = '<i>Normalized 𝜑<sub>FF</sub>(\u03C4 = kT)</i>';
	fctl.annotations[0].text = rctl.annotations[0].text;
	autoFiltCorrData = rotateRight(autoFiltCorrData,rotSamples);

	rpg.y = rotateRight(binning(rpsd,binningFactor),binningFactor/2);
	rpg.x = binning(xDataDT,binningFactor);
	rpl.title = 'log<sub>10</sub> S<sub>gg</sub>(2\u03C0f)';
	freqTicks[nLabels-1] = rpg.x[rpg.x.length-1];
	rpl.xaxis4.tickvals = freqTicks;
	rpl.xaxis4.ticktext = freqLabels;
	rpl.yaxis4.tickfont.size = 0.95*axisTickSize;
	rpl.annotations[0].text = 'f  [kHz]';
	rpsd = rotateRight(rpsd,rotSamples);

	fpg.y = rotateRight(binning(fpsd,binningFactor),binningFactor >> 1);
	fpg.x = rpg.x;
	fpl.title = 'log<sub>10</sub> S<sub>FF</sub>(2\u03C0f)';
	fpl.xaxis4.tickvals = rpl.xaxis4.tickvals;
	fpl.xaxis4.ticktext = rpl.xaxis4.ticktext;
	fpl.yaxis4.tickfont.size = rpl.yaxis4.tickfont.size;
	fpl.annotations[0].text = rpl.annotations[0].text;
	fpsd = rotateRight(fpsd,rotSamples);
	
	opg.y = rotateRight(binning(origFilter,binningFactor),binningFactor >> 1);
	opg.x = rpg.x;
	opl.title = 'log<sub>10</sub> S<sub>FF</sub>(Ω)/S<sub>ee</sub>(Ω)';
	opl.xaxis4.tickvals = fpl.xaxis4.tickvals;
	opl.xaxis4.ticktext = fpl.xaxis4.ticktext;
	opl.yaxis4.tickfont.size = fpl.yaxis4.tickfont.size;
	opl.annotations[0].text = fpl.annotations[0].text;
	origFilter = rotateRight(origFilter,rotSamples);

	// these do not require binning because they are DIGITAL
	rsdg.x = xDataDT;
	rsdg.y = yData;
	rsdg.error_y.array = zeroes;
	rsdg.error_y.arrayminus = yData;
	rsdl.annotations[0].text = 'n';

	fsdg.x = rsdg.x;
	fsdg.y = yfData;
	fsdg.error_y.array = rsdg.error_y.array;
	fsdg.error_y.arrayminus = yfData;
	fsdl.title = '<i>Filtered Gaussian noise</i>';
	fsdl.annotations[0].text = rsdl.annotations[0].text;

	rcdg.x = tauDT;
	rcdg.y = autoCorrData;
	rcdl.title = '<i>Normalized 𝜑<sub>gg</sub>[k]</i>';
	rcdl.annotations[0].text = 'k';

	fcdg.x = rcdg.x;
	fcdg.y = autoFiltCorrData;
	rcdl.title = '<i>Normalized 𝜑<sub>FF</sub>[k]</i>';
	fcdl.annotations[0].text = rcdl.annotations[0].text;

	deltaN = 0; // change in number of samples (zoom)
	power = 0;

	createWavBlob(0, theNames[0].data);
	document.getElementById('playCapture-'+0).disabled = false;
	document.getElementById('play_'+0).style = 'filter:opacity(100%);';

	createWavBlob(1, theNames[1].data);
	document.getElementById('playCapture-'+1).disabled = false;
	document.getElementById('play_'+1).style = 'filter:opacity(100%);';

	// Await interaction

	};
