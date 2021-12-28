// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2022
// Licensed under the MIT license.
// Laboratory experiment 9.1
// i.t. young
// 
// ****************************************************************
// Tuesday, 6 August 2019

// globals defined here
var SIMULATION = false;

var corrLayout = null;
var dtLayout = null;

var sigH = null;
var sigR = null;
var convRHPlot = null;
var crossCorrRHPlot = null;
var maxPositionPlotCorr = null;
var maxPositionPlotConv = null;

var xDataDT = null;
var xData = null;
var yData = null;
var c1Plot = null;
var c2Plot = null;
var c3Plot = null;
var c4Plot = null;

var lengthMax = 50;
var sigLength = 10;
var hSig = [];
var delay = 21;
var zeroSig = [];
var shiftSig = [];
var zeroesH = [];
var zeroesS = [];

var alpha = 0.9;
var maxAbsSignal = 0;
var snrValues = [0.5, 1, 2, 4, 6, 10, 50, 100, 1000];
var thisSNR = snrValues[snrValues.length - 1];

// *****************************************************************
// Functions defined here

function displayData()
	{
	Plotly.react (wA, c1Plot, dtLayout, noMode);
	Plotly.react (wB, c2Plot, dtLayout, noMode);
	Plotly.react (wC, c3Plot, corrLayout, noMode);
	Plotly.react (wD, c4Plot, dtLayout, noMode);
	};

// *****************************************************************
//
function processData()
	{
	// initialize data
	sigLength = 10;
	delay = 21;
	lengthMax = sigLength + delay + sigLength;
	
	hSig = Array(sigLength+delay).fill(0);
	shiftSig = Array(sigLength+2*delay).fill(0);
	zeroSig = Array(hSig.length).fill(0);
	xDataDT = Array(hSig.length).fill(0);
	xData = Array(hSig.length).fill(0);
	yData = Array(hSig.length).fill(0);
	zeroesH = Array(hSig.length).fill(0);
	zeroesS = Array(hSig.length).fill(0);

	// define basic signal
	for (var i=0; i < sigLength; i++)
		hSig[i] = alpha**i;

	maxAbsSignal = getMaxOfAbsArray(hSig)
	
	// definition of SNR = maxAbsSignal/sigma (eq. 8.2)
	for (var i = 0; i < shiftSig.length; i++)
		shiftSig[i] = randomGaussian(0,maxAbsSignal/thisSNR);
	for (var i = 0; i < hSig.length; i++)
		shiftSig[i] += hSig[i];
	shiftSig = rotateRight(shiftSig,delay);
	
	// initialize display
	for (var i = 0; i < lengthMax; i++)
		xDataDT[i] = i; // time index
	xData = hSig;
	yData = shiftSig;
	
	// compute convolution & cross-correlation in discrete-time-domain
	let convResult = uRs( listConvolve( suR(hSig), suR(shiftSig) ) );
	let corrResult = uRs( listCorrelate( suR(hSig), suR(shiftSig) ) );
	corrResult = rotateLeft(corrResult,sigLength);
	
	// top window
	sigH.x = xDataDT;
	sigH.y = xData;
	sigH.error_y.array = zeroesH;
	sigH.error_y.arrayminus = xData;
	
	sigR.x = xDataDT;
	sigR.y = yData;
	sigR.error_y.array = zeroesS;
	sigR.error_y.arrayminus = yData;
	
	// bottom window
	convRHPlot.x = xDataDT;
	convRHPlot.y = convResult;
	convRHPlot.error_y.array = zeroesS;
	convRHPlot.error_y.arrayminus = convResult;

	crossCorrRHPlot.x = xDataDT;
	crossCorrRHPlot.y = corrResult;
	crossCorrRHPlot.error_y.array = zeroesS;
	crossCorrRHPlot.error_y.arrayminus = corrResult;
	
	c1Plot = [sigH];
	c2Plot = [sigR];

	let maxCorr = getMaxOfArray(corrResult);
	let posCorr = position(suR(corrResult),0,maxCorr);
	
	maxPositionPlotCorr.x = [posCorr];
	maxPositionPlotCorr.y = [maxCorr];
	maxPositionPlotCorr.error_y.array = [0];
	maxPositionPlotCorr.error_y.arrayminus = [maxCorr];
	document.querySelector('#peakPosK').value = posCorr;
	
	c3Plot = [crossCorrRHPlot, maxPositionPlotCorr ];
	
	let maxConv = getMaxOfArray(convResult);
	let posConv = position(suR(convResult),0,maxConv);

	maxPositionPlotConv.x = [posConv];
	maxPositionPlotConv.y = [maxConv];
	maxPositionPlotConv.error_y.array = [0];
	maxPositionPlotConv.error_y.arrayminus = [maxConv];
	document.querySelector('#peakPosN').value = posConv;
	
	c4Plot = [convRHPlot, maxPositionPlotConv];
	
	displayData();
	};

// *****************************************************************
// Show and then Choose alpha
function showAlpha(val)
	{
	alpha = val;
	document.querySelector('#placeAlpha').value = alpha;
	};

function chooseAlpha(val)
	{
	alpha = val;
	document.querySelector('#placeAlpha').value = alpha;
	processData();
	};

// *****************************************************************
// Show and then Choose SNR
function showSNR(val)
	{
	let thisSNR = snrValues[val];
	document.querySelector('#placeSNR').value = thisSNR;
	};

function chooseSNR(val)
	{
	thisSNR = snrValues[val];
	document.querySelector('#placeSNR').value = thisSNR;
	processData();
	};

// *****************************************************************
// reTry
function reTry()
	{
	processData();
	};

// *****************************************************************
//
function prepareLab_9_1( )
	{
	// First, we set up layouts
	dtLayout = cloneObj(layoutDT); // defined in SSPplotting.js
	dtLayout.title = '';
	dtLayout.font.size = 0.75*myTitleSize;
	dtLayout.margin.t = 20;
	dtLayout.margin.l = setLeftMargin(); // orientation & platform check;
	dtLayout.yaxis2.range = [-1.05, +1.05];

	dtLayout.annotations[1].text = 'n';

	corrLayout = cloneObj(dtLayout);
	corrLayout.annotations[1].text = 'k';
	corrLayout.xaxis2.tickmode = 'auto';

	// Second, we set up time plots
	sigH = cloneObj(DTPlot); // defined in SSPplotting.js
	sigH.visible = true;
	sigH.marker.size = 2.2*DTmarkerSize;
	sigH.error_y.thickness = 1.7*DTlineThick;
	sigR = cloneObj(sigH);

	convRHPlot = cloneObj(sigH);
	crossCorrRHPlot = cloneObj(sigH);
	
	maxPositionPlotCorr = cloneObj(sigH);
	maxPositionPlotCorr.marker.color = "red";
	maxPositionPlotCorr.error_y.color = "red";
	maxPositionPlotCorr.marker.size = 4*DTmarkerSize;
	maxPositionPlotCorr.marker.symbol = 'circle-open';
	
	maxPositionPlotConv = cloneObj(maxPositionPlotCorr);
	
	// set up signals
	alpha = 0.9;
	document.querySelector('#rangeSNR').max = snrValues.length - 1;
	document.querySelector('#rangeSNR').value = thisSNR;

	processData();
	};
	
