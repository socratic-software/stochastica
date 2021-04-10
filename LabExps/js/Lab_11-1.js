// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// Laboratory experiment 11.1
// i.t. young
// Thursday, 15 February 2018
// 
// ****************************************************************
// checked Thursday, 15 February 2018

// global defined here (for now)
var SIMULATION = false;

var rows = Math.pow(2,1);
var cols = rows; // square picture
var imageData = createArray(rows,cols);
var histos = [];

var plotImage = cloneObj(ImagePlot); // template in SSPplotting.js
var Imagelayout = cloneObj(layoutImage); // template in SSPplotting.js
	Imagelayout.margin.t = 20;
	Imagelayout.margin.l = 50;
	Imagelayout.margin.b = 115;

var imageHisto = cloneObj(Histogram); // template in SSPplotting.js
	imageHisto.nbinsx = 256;
	imageHisto.xbins.size = 1;
var layoutHisto = cloneObj(layoutH); // template in SSPplotting.js
	layoutHisto.margin.t = 80;
	layoutHisto.margin.l = Imagelayout.margin.l;
	layoutHisto.margin.b = 85;
	layoutHisto.title = '';
	layoutHisto.font.size = Imagelayout.font.size;
	layoutHisto.bargap = 0;
	layoutHisto.annotations[0].x = 0;
	layoutHisto.annotations[0].y = 1.05;
	layoutHisto.annotations[0].yanchor = 'bottom';
	layoutHisto.annotations[0].text = '<i>n</i>(<i>x</i>)';
	layoutHisto.annotations[1].text = '<i>x</i>';

var histCumulative = false;
var histnormStyle = '';
var average = 128;
var markerLineWidth = 2;

var randProcess = 2; // global & initialize
var results = [4,0,64,128,192,128,255]; // global & initialize

// *****************************************************************
// Functions defined here

function getStatistics(image)
// Compute simple descriptors of a grey-value image and return the
// results in an array (vector):
// 		[
// 			length,
// 			minimum,
// 			harmonic mean,
// 			geometric mean,
// 			arithmetic mean,
// 			median,
// 			maximum
// 		]
//
// Wednesday, 21 February 2018
	{
	var flatRealImage = flatten(image);
	var flatUnivImage = suR(flatRealImage);
	var length = flatRealImage.length;
	var minVal = getMinOfArray(flatRealImage);
	var maxVal = getMaxOfArray(flatRealImage);
	var medianVal = median(flatUnivImage)[0];
	var meanA = 0;
	var meanG = 0;
	var meanH = 0;
	let temp = 0;
	
	// arithmetic mean
	let sumA = 0;
	for ( let i = 0; i < length; i++)
		sumA += flatRealImage[i];
	meanA = sumA / length;
	
	// geometric mean
	let sumG = 0;
	for ( let i = 0; i < length; i++)
		{
		temp = flatRealImage[i];
		if (temp == 0)
			sumG = 0
		else
			sumG += Math.log(temp);
		};
	if (sumG == 0)
		meanG = 0
	else
		meanG = Math.exp(sumG/length);
		
	// harmonic mean
	let sumH = 0;
	for ( let i = 0; i < length; i++)
		{
		temp = flatRealImage[i];
		if (temp == 0)
			sumH = Infinity
		else 
			sumH += (1/temp);
		};
	if (sumH == Infinity) meanH = 0
	else meanH = length/sumH;
	
	return [length, minVal, meanH, meanG, meanA, medianVal, maxVal]
	
	};

// ***************************************************************** \\
function displayStatistics(results)
	{
	document.querySelector('#statistics1').value =
		'histogram with '+ results[0]+' pixels';
	document.querySelector('#statistics2').value =
		'minimum = '+d3round(results[1])+', maximum = '+d3round(results[6]);
	document.querySelector('#stat3H').value = d2round(results[2])+spaces5;
	document.querySelector('#stat3G').value = d2round(results[3])+spaces5;
	document.querySelector('#stat3A').value = d2round(results[4]);
	};

// *****************************************************************
function displayStuff( )
	{
	displayStatistics(results);

	plotImage.z = imageData;
	imageHisto.x = flatten(imageData);

	histos = [imageHisto, harmHisto, geomHisto, arithHisto];
	Plotly.newPlot(wA, [plotImage], Imagelayout, noMode);
	Plotly.react(wB, histos, layoutHisto, noMode);
	};

// ***************************************************************** \\
function prepareHistos(results)
	{
	'use strict';

	var myData = flatten(imageData);
	var totalN = myData.length;
	var extrema = getDynRange(myData);
	var range = extrema[0];
	var minval = extrema[1];
	var maxval = extrema[2];
	var hBins = 256+1;
	var frac = 0;
	var index = 0;

	var myHistogramList = Array(hBins).fill(0);
	for (var i = 0; i < totalN; i++)
		{
		frac = (myData[i] - minval)/range; // 0 ≤ frac ≤ 1
		index = Math.round(hBins*frac);
		if (index < 0) index = 0;
		if (index > 255) index = 255;
		myHistogramList[index] += 1;
		};
		
	let maxT = -Infinity;
	let hlistTemp = 0;
	for ( let i = 0; i < hBins; i++)
		{
		hlistTemp = myHistogramList[i];
		if (maxT < hlistTemp) maxT = hlistTemp;
		};
	let lengthMax = Math.ceil(maxT);

	harmHisto.x = Array(lengthMax).fill(results[2]);
	geomHisto.x = Array(lengthMax).fill(results[3]);
	arithHisto.x = Array(lengthMax).fill(results[4]);
	layoutHisto.xaxis3.range = [Math.floor(results[1]), Math.floor(results[6])]; 
	layoutHisto.xaxis3.range = [0,256];
	layoutHisto.yaxis3.range = [0, lengthMax]; // for the future?
	};

// Choose SNR factor with slider
function moveSizeSlider(val)
	{
	rows = Math.pow(2,val);
	cols = rows;
	document.querySelector('#clickN').value = rows+" x "+cols+" pixels";
	};

// ***************************************************************** \\
// choose which type of graphic display for random process

function distributionDisp(val)
	{
	rows = Math.pow(2,val);
	cols = rows;
	document.querySelector('#clickN').value = rows+" x "+cols+" pixels";

	imageData = createArray(rows,cols);
	
	for (var i = 0; i < rows; i++)
		for (var j = 0; j < cols; j++)
			imageData[i][j] = Math.round(chooseProcess(randProcess,average));

	results = getStatistics(imageData);
	prepareHistos(results);
	displayStuff( );
	};

// ***************************************************************** \\
// fill image with chosen random process

function fillImage(target)
	{
	if (target === 'Gaussian') randProcess = 1;
	else if (target === 'Uniform') randProcess = 2;
	else if (target === 'Exponential') randProcess = 3;
	else if (target === 'Rayleigh') randProcess = 4;
	else if (target === 'Laplace') randProcess = 5;
	else throw('Houston, we have a problem in fillImage.');;
	
	for (var i = 0; i < rows; i++)
		for (var j = 0; j < cols; j++)
			imageData[i][j] = Math.round(chooseProcess(randProcess,average));

	results = getStatistics(imageData);
	prepareHistos(results);
	displayStuff( );
	};

// ***************************************************************** \\
// choose which random process will be used

function chooseProcess(process,average)
	{
	var sigma = average/6;
	switch(process)
		{
		case 1:
			return randomGaussian(average,sigma);
			break;
		case 2:
			return randomReal(5,250);
			break;
		case 3:
			return 255*randomExponential(0.1);
			break;
		case 4:
			return randomRayleigh(0.6*average*Math.sqrt(2/Math.PI));
			break;
		case 5:
			sigma = Math.SQRT1_2*average/9;
			return randomLaplace(average,sigma);
			break;
		};
	};

// ***************************************************************** \\
// start here

function prepareLab_11_1( )
	{
	plotImage.visible = true;

	Imagelayout.title = '';
	Imagelayout.font.size = 0.9*myTitleSize;
	Imagelayout.xaxis7.showline = true;
	Imagelayout.xaxis7.linewidth = 1;
	Imagelayout.xaxis7.mirror = true;
	Imagelayout.xaxis7.ticks = '';

	Imagelayout.yaxis7.showline = true;
	Imagelayout.yaxis7.mirror = true;
	Imagelayout.yaxis7.ticks = '';
	Imagelayout.height = Math.floor(1.3*graphHeight[twoImages]); // special case

	imageHisto.marker.line.color = '#66b3ff'; // light blue
	imageHisto.marker.line.width = thinHistoBar; // normal width
	imageHisto.histnorm = histnormStyle;
	imageHisto.cumulative.enabled = histCumulative;

	harmHisto = cloneObj(imageHisto);
	harmHisto.marker.line.width = markerLineWidth;
	harmHisto.marker.line.color = 'red';
	
	geomHisto = cloneObj(harmHisto);
	geomHisto.marker.line.color = '#33ff00'; // green
	
	arithHisto = cloneObj(harmHisto);
	arithHisto.marker.line.color = '#990033'; // purple
	
	// get initial random image using uniform real distribution
	for (var i = 0; i < rows; i++)
		for (var j = 0; j < cols; j++)
			imageData[i][j] = randomInteger(0,255);

	results = getStatistics(imageData);
	prepareHistos(results);
	displayStuff( );
	};

// ***************************************************************** \\
