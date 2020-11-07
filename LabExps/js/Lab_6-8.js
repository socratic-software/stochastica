// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// Laboratory experiment 6.8
// i.t. young
// Thursday, 28 September 2017
// 
// ****************************************************************
// checked Tuesday, 3 October 2017

// global defined here (for now)
var dispState = 'SH';
var digiState = 'ANALOG';
var experiment = '6.8';
var deltaN = 0; // change in number of samples (zoom)
var power = 0;
var autoCorrData = [];
var crossCorrData = [];
var ggPSD = [];
var xyPSD = [];
var nbins = 1;
var newSamples = 1;

lengthMax = 2**Math.floor(Math.log2(100000/binningFactor))*binningFactor;
var startSample = 0;
var stopSample = lengthMax;
var middleSample = (stopSample+startSample) >> 1;

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
var xySpect = Array(lengthMax);
var zeroes = Array(lengthMax);

var nn = [lengthMax] // number of complex values
var ndim = 1; // 1-D signal

var nLabels = 5;
var freqTicks = Array(nLabels);
var freqLabels = Array(nLabels);
var scaleLabel = 2;

var leftCoeffs = [1,0];
var rightCoeffs = youngBPFilter;
var coefficients = [ leftCoeffs, rightCoeffs ];
var filterLength = rightCoeffs.length >> 1;
var thisZoom = 0;
var thisAlg = 'f'; // 't'=filter time domain & 'f'=filter freq. domain

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

var hsdg1 = cloneObj(rsdg);
var hsdg2 = cloneObj(hsdg1);
var hsdg3 = cloneObj(hsdg1);
var hsdg4 = cloneObj(hsdg1);

var rhg = cloneObj(Histogram);
	rhg.xbins.start = null;
	rhg.xbins.end = null;
var fhg = cloneObj(rhg);

var rpg = cloneObj(SpectrumPlot);
	rpg.visible = true;
var fpg = cloneObj(rpg);

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
var hsdl1 = cloneObj(rsdl);

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

var rh = [[rhg], rhl];
var fh = [[fhg], fhl];


// *****************************************************************
// Functions defined here

function process_6_8()
	{
	// Note use of global definitions for thisAlg, rdata, etc.
	// compute normalized autocorrelation gg through Fourier domain

	var gSpect = fft(rData, nn, ndim, FORWARD); // signal spectrum
	var gSpectTemp = abssq(gSpect); // gg PSD
	autoCorrData = uRs(fft(gSpectTemp, nn, ndim, BACKWARD));
	
	//  compute in f-domain
	//  first, zero pad the filter array
	let zpLength = (rData.length - coefficients[1].length) >> 1;
	let zpFilter = arrayPad(coefficients[1], zpLength, [0,0])
	hSpect = fft(zpFilter, nn, ndim, FORWARD); // filter spectrum
	
	ySpect = filterMult(hSpect, gSpect); // f-domain cross-correlation
	yfData = uRs(fft(ySpect, nn, ndim, BACKWARD));

	xySpect = filterMult(hSpect, gSpectTemp); // f-domain cross-correlation
// 	yxSpect = filterMult(gSpectTemp, conjugate(hSpect)); // f-domain cross-correlation

	xyCorr = uRs(fft(xySpect, nn, ndim, BACKWARD));
// 	yxCorr = ampNormalizeReal(uRs(fft(yxSpect, nn, ndim, BACKWARD)));


	autoCorrData = ampNormalizeReal(autoCorrData);	 // to be displayed, top left
	ggPSD = uRs(gSpectTemp);						 // to be displayed, top right
	crossCorrData = ampNormalizeReal(xyCorr);		 // to be displayed, bottom left
	xyPSD = uRs(abs(xySpect));						 // to be displayed, bottom right
	
	theName0.fS = sampFreq;
	theName0.data = ampNormalizeReal(yData);
	
	theName1.fS = sampFreq;
	theName1.data = ampNormalizeReal(yfData);
	};

// *****************************************************************
function rotateSymmetrics()
	{
	// Note use of global definitions for autoCorrData, etc.
	autoCorrData = rotateRight(autoCorrData,autoCorrData.length >> 1);
	ggPSD = rotateRight(ggPSD,ggPSD.length >> 1);
	crossCorrData = rotateRight(crossCorrData,crossCorrData.length >> 1);
	xyPSD = rotateRight(xyPSD,xyPSD.length >> 1);
	};

// *****************************************************************
// Choose zoom factor with slider
function myFunctionZoom(val)
	{
	thisZoom = val;
	power = Math.pow(2,thisZoom);
	newSamples = Math.floor(lengthMax/power);
	if (oddQ(newSamples)) newSamples--; // make it even
	sentence1 =  "N = "+newSamples+" samples";
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
	var zFdN = Array(newSamples); // zoom filt data
	var freqTicksNew = Array(nLabels);
	
	// the following involve real, rotated arrays
	var tauCTnew = Array(newSamples); // correlation index
	var tauDTnew = Array(newSamples); // correlation index
	var zAuCoDN = Array(newSamples); // zoom raw phi
	var zAuFiCoDN = Array(newSamples); // zoom filt phi
	var zRpsdN = Array(newSamples); // zoom raw psd
	var zfilter = Array(newSamples); // zoom filter

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
		zAuFiCoDN[i] = crossCorrData[i+startSample]; // filt ø
		zRpsdN[i] = ggPSD[i+startSample]; // raw psd
		zfilter[i] = xyPSD[i+startSample]; // filt psd
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
	if (newSamples <= maxDTdisplay)
		{
		fpl.yaxis4.tickfont.size =  0.75*axisTickSize;
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
		fpl.yaxis4.tickformat = '';
		fpl.yaxis4.tickfont.size =  0.85*axisTickSize;
		digiState = 'ANALOG';
		};

	rhg.x = yDataNew;
	nbins = Math.floor(Math.sqrt(rhg.x.length));
	rhg.nbinsx = nbins;
	rhg.xbins.start = getMinOfArray(rhg.x);
// 	rhg.xbins.end = getMaxOfArray(rhg.x);

	fhg.x = zFdN;
	fhg.nbinsx = nbins;
	fhg.xbins.start = getMinOfArray(fhg.x);
// 	fhg.xbins.end = getMaxOfArray(fhg.x);

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

	fpg.x = rpg.x;
	fpg.y = binning(zfilter,binningFactor); // no normalization
	fpl.xaxis4.tickvals = freqTicksNew;
	fpl.xaxis4.ticktext = freqLabels;
	
	// Following is just for the special case of this lab experiment
	if (zAuFiCoDN.length <= maxDTdisplay)
		{
		let shiftPatch = Math.max(zAuFiCoDN.length >> 1, filterLength);
		fcdg.x = [];
		for (var i = 0; i < tauDTnew.length; i++)
			fcdg.x[i] = tauDTnew[i] + (zAuFiCoDN.length >> 1);
		fcdg.y = rotateLeft(zAuFiCoDN, shiftPatch);
		fcdg.error_y.arrayminus = fcdg.y;
		fcdg.error_y.array = rotateLeft(zeroesNew, shiftPatch);
		};
	myFunctionDisp(dispState,digiState,wA,wB,wC,wD);
	};

// *****************************************************************
// test signal synthesized here
// For the sampling frequency, see: SSPconstants.js
//
function prepareLab_6_8( )
	{
	audioNum = 0;
	thisDuration = 1000*lengthMax/sampFreq; // defined in SSPmedia.js

	for (const num of listPlayBacks)
		{
		myDuration[num] = thisDuration;
		document.getElementById('playCapture-'+num).disabled = false;
		document.getElementById('play_'+num).style = 'filter:opacity(50%) blur(3px);';
		}
	
	sentence1 =  "N = "+newSamples+" samples";
	document.querySelector('#placeN1').value = "N = "+newSamples+" samples";
	sentence2 = "= "+d1round(1000*newSamples/sampFreq)+" ms";
	document.querySelector('#placeN2').value = sentence2;
	document.querySelector('#placeT').value = d1round(newSamples/sampFreq);
	
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
		freqLabels[i] = d2round(sampFreq*(i - ((nLabels-1)/2))/4000);
		};
		
	process_6_8();
		

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
	rhl.annotations[0].text = 'signal amplitude';
	

	// filtered data: signal & amplitude histogram
	fstg.x = rstg.x;
	fstg.y = binning(yfData,binningFactor);
	fstl.title = '';
	fstl.annotations[0].text = 't [ms]';


	fhg.x = yfData;
	dynRange = getDynRange(fhg.x)[0]; // get dynamic range
	nbins = Math.floor(Math.sqrt(fhg.x.length));
	fhg.xbins.size = dynRange/nbins; // automatic choice
	fhl.title = '';
	fhl.annotations[0].text = 'signal amplitude';
	
	// raw & filtered data, corr. function, power spectral densities & filter
	
	var rotSamples = autoCorrData.length >> 1;

	// these "symmetrics" require binning because they are ANALOG
	rctg.y = rotateRight(binning(autoCorrData,binningFactor),binningFactor >> 1);
	rctg.x = binning(tauCT,binningFactor);
	rctl.title = '';
	rctl.annotations[0].text = tau+' [ms]';
	autoCorrData = rotateRight(autoCorrData,rotSamples);

	fctg.y = rotateRight(binning(crossCorrData,binningFactor),binningFactor >> 1);
	fctg.x = rctg.x;
	fctl.title = '';
	fctl.annotations[0].text = rctl.annotations[0].text;
	crossCorrData = rotateRight(crossCorrData,rotSamples);

	rpg.y = rotateRight(binning(ggPSD,binningFactor),binningFactor >> 1);
	rpg.x = binning(xDataDT,binningFactor);
	rpl.title = '';
	freqTicks[nLabels-1] = rpg.x[rpg.x.length-1];
	rpl.xaxis4.tickvals = freqTicks;
	rpl.xaxis4.ticktext = freqLabels;
	rpl.yaxis4.tickfont.size = 0.85*axisTickSize;
	rpl.annotations[0].text = 'f  [kHz]';
	ggPSD = rotateRight(ggPSD,rotSamples);

	fpg.y = rotateRight(binning(xyPSD,binningFactor),binningFactor >> 1);
	fpg.x = rpg.x;
	fpl.title = '';
	fpl.xaxis4.tickvals = rpl.xaxis4.tickvals;
	fpl.xaxis4.ticktext = rpl.xaxis4.ticktext;
	fpl.yaxis4.tickfont.size = rpl.yaxis4.tickfont.size;
	fpl.annotations[0].text = rpl.annotations[0].text;
	xyPSD = rotateRight(xyPSD,rotSamples);

	// these do not require binning because they are DIGITAL
	rsdg.x = xDataDT;
	rsdg.y = yData;
	rsdg.error_y.array = zeroes;
	rsdg.error_y.arrayminus = yData;
	rsdl.annotations[0].text = 'n';
	
	let tempArrayLength = 64;
	for (var i = 0; i < tempArrayLength; i++) hsdg1.x[i] = i;
	hsdg2.x = hsdg1.x;
	hsdg3.x = hsdg1.x;
	hsdg4.x = hsdg1.x;
	
	hsdg1.y = Array(tempArrayLength).fill(0);
	hsdg2.y = Array(tempArrayLength).fill(0);
	hsdg3.y = Array(tempArrayLength).fill(0);
	hsdg4.y = Array(tempArrayLength).fill(0);
	hzeroes = Array(tempArrayLength).fill(0);
	
	// these filters all have the same length
	for (var i = 0; i < (youngBPFilter.length >> 1); i++)
		{
		hsdg1.y[i] = youngBPFilter[2*i]; // skip imaginary part
		hsdg2.y[i] = youngNotchFilter[2*i]; // skip imaginary part
		hsdg3.y[i] = -hsdg1.y[i];
		}
	hsdg4.y = rotateRight(hsdg1.y,8);
	
	hsdg1.error_y.array = hzeroes;
	hsdg2.error_y.array = hsdg1.error_y.array;
	hsdg3.error_y.array = hsdg1.error_y.array;
	hsdg4.error_y.array = hsdg1.error_y.array;
	
	hsdg1.error_y.arrayminus = hsdg1.y;
	hsdg2.error_y.arrayminus = hsdg2.y;
	hsdg3.error_y.arrayminus = hsdg3.y;
	hsdg4.error_y.arrayminus = hsdg4.y;
	
	hsdl1.title = '';
	hsdl1.width = Math.floor(graphWidth[fourImages]);
	hsdl1.height = Math.floor(graphHeight[fourImages]);
	
	hsdl1.annotations[1].x = 0.5;
	hsdl1.annotations[1].y = 2*titleBelowAxis;
	hsdl1.annotations[1].yanchor = 'auto';
	hsdl1.annotations[1].text = 'n';

	hsdl1.annotations[0].x = 0;
	hsdl1.annotations[0].xanchor = 'left';
	hsdl1.annotations[0].y = 1.025;
	hsdl1.annotations[0].yanchor = 'bottom';
	hsdl1.annotations[0].text = 'h<sub>1</sub>[n]';
	
	hsdl2 = cloneObj(hsdl1);
	hsdl3 = cloneObj(hsdl1);
	hsdl4 = cloneObj(hsdl1);

	hsdl2.annotations[0].text = 'h<sub>2</sub>[n]';
	hsdl3.annotations[0].text = 'h<sub>3</sub>[n]';
	hsdl4.annotations[0].text = 'h<sub>4</sub>[n]';

	fsdg.x = rsdg.x;
	fsdg.y = yfData;
	fsdg.error_y.array = rsdg.error_y.array;
	fsdg.error_y.arrayminus = yfData;
	fsdl.title = '';
	fsdl.annotations[0].text = rsdl.annotations[0].text;

	rcdg.x = tauDT;
	rcdg.y = autoCorrData;
	rcdl.title = '';
	rcdl.annotations[0].text = 'k';

	fcdg.x = rcdg.x;
	fcdg.y = crossCorrData;
	rcdl.title = '';
	fcdl.annotations[0].text = rcdl.annotations[0].text;

	deltaN = 0; // change in number of samples (zoom)
	power = 0;

	createWavBlob(0, theNames[0].data);
	document.getElementById('playCapture-'+0).disabled = false;
	document.getElementById('play_'+0).style = 'filter:opacity(100%);';

	createWavBlob(1, theNames[1].data);
	document.getElementById('playCapture-'+1).disabled = false;
	document.getElementById('play_'+1).style = 'filter:opacity(100%);';

	executeLab_6_8( );

	// Await interaction

	};

// *****************************************************************
function executeLab_6_8( )
	{
	// critical values defined here (for now)
	dispState = 'SH';
	digiState = 'ANALOG';

	thisAlg = 'f';
	leftCoeffs = [1,0];
	rightCoeffs = youngBPFilter;
	filterLength = rightCoeffs.length >> 1;
	coefficients = [ leftCoeffs, rightCoeffs ];
	process_6_8( );
	myFunctionZoom(thisZoom);

// signal processing initiating ends here
// now start displays

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
		
	// raw data: signal & amplitude histogram
	
	rstg.x = binning(xDataCT,binningFactor);
	rstg.y = binning(yData,binningFactor);
	
	rstl.title = 'Gaussian noise';
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

	fstl.title = 'Filtered Gaussian noise';
	fstl.annotations[0].text = 't [ms]';

	fhg.x = yfData;
	dynRange = getDynRange(fhg.x)[0]; // get dynamic range
	nbins = Math.floor(Math.sqrt(fhg.x.length));
	fhg.xbins.size = dynRange/nbins; // automatic choice
	fhl.title = 'Filtered amplitude histogram';
	fhl.annotations[0].text = 'signal amplitude';
	
	// this is where the first (empty) displays gets placed
	Plotly.newPlot(wE, [hsdg4], hsdl1, noMode); // DT signal
	Plotly.newPlot(wF, [hsdg2], hsdl2, noMode); // DT signal
	Plotly.newPlot(wG, [hsdg1], hsdl3, noMode); // DT signal
	Plotly.newPlot(wH, [hsdg3], hsdl4, noMode); // DT signal
	myFunctionDisp(dispState,digiState,wA,wB,wC,wD);

	// to be used below when switching dispState
	// raw & filtered data, corr. function, power spectral densities & filter
	
	var rotSamples = autoCorrData.length >> 1;

	// these "symmetrics" require binning because they are ANALOG
	rctg.y = rotateRight(binning(autoCorrData,binningFactor),binningFactor >> 1);
	rctg.x = binning(tauCT,binningFactor);
	
	rctl.title = 'Normalized 𝜑<sub>gg</sub>(\u03C4 = kT)';
	rctl.annotations[0].text = tau+' [ms]';
	autoCorrData = rotateRight(autoCorrData,rotSamples);

	fctg.y = rotateRight(binning(crossCorrData,binningFactor),binningFactor >> 1);
	fctg.x = rctg.x;
	
	fctl.title = 'Normalized 𝜑<sub>gF</sub>(\u03C4 = kT)';
	fctl.annotations[0].text = rctl.annotations[0].text;
	crossCorrData = rotateRight(crossCorrData,rotSamples);

	rpg.y = rotateRight(binning(ggPSD,binningFactor),binningFactor >> 1);
	rpg.x = binning(xDataDT,binningFactor);
	rpl.title = 'S<sub>gg</sub>(2\u03C0f)';
	freqTicks[nLabels-1] = rpg.x[rpg.x.length-1];
	rpl.xaxis4.tickvals = freqTicks;
	rpl.xaxis4.ticktext = freqLabels;
	rpl.annotations[0].text = 'f  [kHz]';
	ggPSD = rotateRight(ggPSD,rotSamples);

	fpg.y = rotateRight(binning(xyPSD,binningFactor),binningFactor >> 1);
	fpg.x = rpg.x;
	fpl.title = '| S<sub>gF</sub>(2\u03C0f) |';
	fpl.xaxis4.tickvals = rpl.xaxis4.tickvals;
	fpl.xaxis4.ticktext = rpl.xaxis4.ticktext;
	fpl.annotations[0].text = rpl.annotations[0].text;
	xyPSD = rotateRight(xyPSD,rotSamples);

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
	fsdl.title = 'Filtered Gaussian noise';
	fsdl.annotations[0].text = rsdl.annotations[0].text;

	rcdg.x = tauDT;
	rcdg.y = autoCorrData;
	rcdl.title = 'Normalized 𝜑<sub>gg</sub>[k]';
	rcdl.annotations[0].text = 'k';

	fcdg.x = rcdg.x;
	fcdg.y = crossCorrData;
	fcdl.title = 'Normalized 𝜑<sub>gF</sub>[k]';
	fcdl.annotations[0].text = rcdl.annotations[0].text;

	var deltaN = 0; // change in number of samples (zoom)
	var power = 0;

// Await interaction
	};