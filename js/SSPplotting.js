// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// ****************************************************************
// SSPplotting.js
//
// Plotting routines to be used with SSP package
// This includes constants and data structures associated with plotly.js
// i.t. young
//
// Sunday, 13 August 2017
// Friday, 18 August 2017
// Tuesday, 19 September 2017
// Tuesday, 26 September 2017
// Sunday, 6 May 2018
// Wednesday, 20 February 2019
// Wednesday, 25 September 2019
// Tuesday, 6 April 2021

// The "universal" signal format is characterized by an array name (e.g. "data"),
// an array "nn", and a number of dimensions "ndim". The "data" array takes data
// in the form of [r1,i1,r2,i2, ...,rn,in] where "r1" is the real part of a
// complex sample and "i1" is the imaginary part.
// 
// For a 1D signal, "nn" is an array with one element that gives the number of
// complex signal samples (e.g. nn[0] = 17). The number of dimensions
// ndim = nn.length. In this example ndim = 1. Note that because the data are
// complex data.length = 2*17 = 34. Signals that are 1D can have ANY length.

// For a 2D signal (image), "nn" is an array with two elements that gives
// the number of rows and columns where each sample is complex, that is,
// nn = [rows,columns]. In this case, the number of dimensions
// ndim = nn.length = 2. Obviously, rows - n[0] and columns = nn[1].

// For 2D signals there is a restriction. The number of rows MUST be a power
// of two, e.g. rows = 2^7 and the number of columns MUST also be a power of
// two, e,g.columns =  2^8. (See the routine "fourND" in "SSPfourier.js" for
// an explanation.). This means the data.length = 2*rows*columns = 2*(2^7)*(2^8)
// = 2^16. Caveat emptor!

// Added a formatting subroutine to be used with plotly.js. This seemed like
// the best place as it is not signal processing
//
// To make a textual annotation to display on a plotly.js graph, we assume
// the graph is in a normalized picture coordinates 0 ≤ x,y ≤ 1. Then:
//      theText is the annotation string. e.g. 'foo'
//      xCoord where the annotation text should be placed, e.g. x = 0
//      xPosition is the positioning of the text relative to x as in 'center'
//      yCoord where the annotation text should be placed, e.g. y = 0.5 or y = 1.1
//      yPosition is the positioning of the text relative to y as in 'top'
//

// ****************************************************************

const goldenRatio = 2/(1+Math.sqrt(5));

// INDEX to number of images / graphs in a row
const oneImage = 1-1;
const twoImages = 2-1;
const threeImages = 3-1;
const fourImages = 4-1;

const noMode = {displayModeBar: false};

// For Greek letters and other stuff, see: <https://brajeshwar.github.io/entities/>
const tau = '<i>\u03C4</i>';
const tauBold = '<b><i>\u03C4</i></b>';
const phi = '<i>\u03C6</i>';
const phiBold = '<b><i>\u03C6</i></b>';
const chi = '<i>\u03C7</i>';
const chiBold = '<b><i>\u03C7</i></b>';
const omega = '\u03C9';
const Omega = '\u03A9';
const OmegaBold = '<b>\u03A9</b>';
const ell = '\u02113';
const ellBold = '<b>\u02113</b>';
const blanks12 = '            ';

// For labeling axes
const negPiSymbol = '–π';
const posPiSymbol = '+π';

// Colors for multiple curves
const BofAred = 'rgba(174,24,16,1.0)';
const japanRed1 = 'rgba(221,33,36,1.0)';
const japanRed2 = 'rgba(159,40,45,1.0)';
const pantoneClassicBlue = 'rgba(30,68,126,1.0)'; // Pantone 19-4052 TCX
const darkRedSpectrumDots = BofAred;
const bottomCurve = 'steelblue';
const overlayStart = 'rgba(254, 129, 252,'; // pink
const overlayFinish = ')';
const secondOverlayStart = 'rgba(255, 102, 0,'; // orange
const secondOverlayFinish = ')';
const myiPadWidth = 768; // in pixels
const myiPadFontSize = 22; // standard Plotly font size specification
const myiPadLabFontSize = 0.9; // standard Plotly font size specification
const androidFontSize = '0.70rem';
const androidLineHeight = '150%';

var margins = {top:0, bottom:0};

// used in portrait camera window; see lines 804- 824 in Lab_10-10.js
// absolute vertical position at Bottom of Cancel button
const previewCancelHeight = 176;
// absolute vertical position at Top of Choose button
const chooseRecordHeight = 124;
const verticalSpacer = 70;

// **************************************************************
// ****************************************************************
//
var doRotate = true; // if microphone is being used then don't rotate
var myOrientation = readDeviceOrientation();
window.onorientationchange = function()
	{
	myOrientation = readDeviceOrientation();
	if (doRotate) location.replace(window.location.href);
	};

// **************************************************************
function validatePlotly(label,data,layout)
	{
	let check = Plotly.validate([data], layout, noMode);
	console.log(label+': ',check[0].msg);
	return;
	};

// **************************************************************
function setLeftMargin()
	{
	let result = null;
	let tempPlatform = navigator.platform;
	if (windowOrientation() === 'Landscape' && (tempPlatform === "iPad" || tempPlatform === 'MacIntel')) 
		result = 80
	else
		result = 60;
	return result;
	};

// **************************************************************
// Parameters & functions for various SVG routines
const xmlns = "http://www.w3.org/2000/svg";
var mySVG = null;
var myDiv = null;
var myDivSVG = null;
var mySvgDescr = null;
var myFrame = null;
var theFrame = null;
var crossHair = 40; // length of crosshair

var lineStyleVis = "stroke:aqua;stroke-width:3;fill:none;";
var lineStyleHid = "stroke:aqua;stroke-width:0;fill:none;";
var frameStyle = "stroke:firebrick;stroke-width:2;fill:none;";

function prepareSVG(which)
	{
	'use strict';

	let x1=0, x2=0, y1=0, y2=0;

	let x0 = cameraCoordX0;
	// correct iPhone landscape position
	if (navigator.platform === 'iPhone') x0 = cameraCoordX0 - deltaX0;
	let y0 = cameraCoordY0;

	let vertical = (which === 'VL') || (which === 'VP');
	let horizontal = (which === 'HL') || (which === 'HP');
	if (vertical)
		{
		// create vertical SVG path description
		mySvgDescr = document.createElementNS(xmlns, 'line');
		if (which === 'VL')
			mySvgDescr.setAttributeNS(null,"id","crossVL")
		else if (which === 'VP')
			mySvgDescr.setAttributeNS(null,"id","crossVP")
		else throw('prepareSVG vertical: Huh?')
		mySvgDescr.setAttributeNS(null,"style",lineStyleVis);
	
		x1 = x0 + (previewCols >> 1);
		x2 = x1;

		if (windowOrientation() === 'Landscape')
			y1 = y0 - crossHair
		else
			y1 = y0 - crossHair - previewCancelHeight;
		y2 = y1 + previewRows + (2*crossHair);

		mySvgDescr.setAttributeNS(null, "x1", ''+x1);
		mySvgDescr.setAttributeNS(null, "x2", ''+x2);
		mySvgDescr.setAttributeNS(null, "y1", ''+y1);
		mySvgDescr.setAttributeNS(null, "y2", ''+y2);
		}
	else if (horizontal)
		{
		// create vertical SVG path description
		mySvgDescr = document.createElementNS(xmlns, 'line');
		if (which === 'HL')
			mySvgDescr.setAttributeNS(null,"id","crossHL")
		else if (which === 'HP')
			mySvgDescr.setAttributeNS(null,"id","crossHP")
		else throw('prepareSVG horizontal: Huh?')
		mySvgDescr.setAttributeNS(null,"style",lineStyleVis);

		x1 = x0 - crossHair;
		x2 = x1 + previewCols + (2*crossHair);

		if (windowOrientation() === 'Landscape')
			y1 = y0 + (previewRows >> 1)
		else
			y1 = y0 + (previewRows >> 1) - previewCancelHeight;
		y2 = y1;

		mySvgDescr.setAttributeNS(null, "x1", ''+x1);
		mySvgDescr.setAttributeNS(null, "x2", ''+x2);
		mySvgDescr.setAttributeNS(null, "y1", ''+y1);
		mySvgDescr.setAttributeNS(null, "y2", ''+y2);
		}
	else if (which === 'F')
		{
		// create frame around camera preview 
		mySvgDescr = document.createElementNS(xmlns, 'rect');
		mySvgDescr.setAttributeNS(null,"style",frameStyle);

		mySvgDescr.setAttributeNS(null, "x", ''+x0);

		if (windowOrientation() === 'Landscape')
			mySvgDescr.setAttributeNS(null, "y", ''+y0)
		else
			mySvgDescr.setAttributeNS(null, "y", ''+(y0 - previewCancelHeight));

		mySvgDescr.setAttributeNS(null, "width", ''+previewCols);
		mySvgDescr.setAttributeNS(null, "height", ''+previewRows);
		}
	else throw('prepareSVG: Trouble in paradise.');
	
	return mySvgDescr;
	};

// **************************************************************
// Parameters & functions for various canvas & plotly.js routines
//

var d0round = d3.format('.0f');
var d1round = d3.format('.1f');
var d2round = d3.format('.2f');
var d3round = d3.format('.3f');
var d4round = d3.format('.4f');

var windowDimensions = {height: 0, width: 0};
var wRows = windowDimensions.height;
var wCols = windowDimensions.width;

// get display dimensions
var availableWidth = window.innerWidth || document.documentElement.clientWidth;

// not used as yet but maybe in the future
var availableHeight = window.innerHeight || document.documentElement.clientHeight;

// also not used but monitor - (menus + docks)
// var windowWidth = window.screen.availWidth;
// var windowHeight = window.screen.availHeight;

// canvas
const standardBlackBorder = "1px solid black";
const imgBorder = "1px solid maroon";

// plotly
var r = 1; // rescale with a little more empty space
var baseSizeW1 = r*availableWidth; // one item per row
var baseSizeW2 = r*availableWidth/2; // two items per row
var baseSizeW3 = r*availableWidth/3; // three items per row
var baseSizeW4 = r*availableWidth/4; // four items per row
var graphWidth = [baseSizeW1, baseSizeW2, baseSizeW3, baseSizeW4]; // graphs or images

var baseSizeH1 = 0.75*baseSizeW1; // one item per row
var baseSizeH2 = baseSizeH1/2; // two items per row
var baseSizeH3 = baseSizeH1/3; // three items per row
var baseSizeH4 = baseSizeH1/4; // four items per row
var graphHeight = [0.75*baseSizeH1, baseSizeH2, baseSizeH3, baseSizeH4]; // graphs & images

var verticalScale = 1.2; // expand graphHeight in certain displays

// font names for iOS can be found at <http://iosfonts.com>
// this includes bold and italic
// baseFontSize = myiPadFontSize*(availableWidth/myiPadWidth);
var baseFontSize = 22;

var myTitleFont = 'Helvetica, Arial, GillSans, san-serif';
var myTitleSize = 0.6*baseFontSize;
var myTitleColor = 'black';
var annotateFontSize = 0.6*baseFontSize;

var legendFont = 'Georgia, Palatino, Bodoni, serif';
var legendFontSize = 0.6*baseFontSize; // size of dimension label, i.e. 'time'
var legendColor = 'black';
var legendBkgColor = 'rgba(255,255,40,0.5)'; // lightyellow variant
var legendBorderColor = 'black';

var axisLabelFont = 'Georgia, Palatino, Bodoni, serif';
var axisLabelSize = 0.6*baseFontSize; // size of dimension label, i.e. 'time'
var axisLabelColor = 'grey';

var axisTitleFont = 'Georgia-Italic, Palatino-Italic, BodoniSvtyTwoITCTT-BookIta';
var axisTitleSize = 0.7*baseFontSize; // size of tick numbers, i.e. '0.2'
var axisTitleColor = 'black';

var axisTickFont = 'Georgia, Palatino, Bodoni, serif';
var axisTickSize = 0.6*baseFontSize; // size of tick numbers, i.e. '0.2'
var axisTickColor = 'darkred';
var axisTicksPosition = 'outside';

var titleAboveAxis = 1.15;
var titleRightAxis = 1.05;
var titleBelowAxis = -0.20;

var colorBarTitlePosition = 'right';
var colorBarTitleFont = 'Georgia-Italic, Palatino-Italic, BodoniSvtyTwoITCTT-BookIta';
var colorBarTitleSize = 0.7*baseFontSize;
var colorBarTitleColor = 'black';

var DTmarker = 'circle';
var DTlineThick = 1;
var DTmarkerSize = 3*DTlineThick;
// var DTmarkerColor = darkRedSpectrumDots;
var DTmarkerColor = 'steelblue';
var DTlineColor = '#808080';
var maxDTdisplay = 192; // max samples in DT format, otherwise screen crowded
var changeDTparams = 48; // max samples in "fat" format, otherwise screen crowded

var zeroline = 1;
var zeroLineThick = 1;
var scatterMarkerSize = 7;
var signalLineColor = bottomCurve;
var histoColor = 'rgb(0, 153, 153, 1)';
var thinHistoBar = 1;
var thickHistoBar = 4;
var spectLineColor = 'DarkGreen';
var scatterMarkerColor = darkRedSpectrumDots;
var scatterLineColor = 'green';

var alphaMin = 0.9; // for overlay displays
var alphaSecondMin = 0.6; // for overlay displays
var alphaMax = 1; // for overlay displays

// viewpoint for surfaces
var eyeX = +0.6;
var eyeY = -1.1;
var eyeZ = 1.9;

// **************************************************************
// **************************************************************
// utility program to clone object. See:
// <https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object>
//
// Note this utility is recursive
//
//  ity Tuesday, 15 August 2017

function cloneObj(obj)
	{
	var copy;
	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) return obj;
	
	// Handle Date
	if (obj instanceof Date)
		{
		copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
		}
	// Handle Array
	if (obj instanceof Array)
		{
		copy = [];
		for (var i = 0, len = obj.length; i < len; i++)
			{
			copy[i] = cloneObj(obj[i]);
			}
		return copy;
		}
	// Handle Object
	if (obj instanceof Object)
		{
		copy = {};
		for (var attr in obj)
			{
			if (obj.hasOwnProperty(attr)) copy[attr] = cloneObj(obj[attr]);
			}
		return copy;
		}
	throw new Error("Unable to copy obj! Its type isn't supported.");
	};
	
// **************************************************************
function scaleForCanvas(pixels,rImage,gImage,bImage,minVal,maxVal)
	{
	// Caveat Emptor: pixels are in a data format that is CLAMPED to
	// the integer range 0 to 255. Do all processing with "float" and
	// then rescale to this range before writing in pixels.
	// Warning the input array 'pixels' is modified

	let dynRange = maxVal - minVal;
	let temp = 0;
	if (dynRange == 0)
		{
		for (let i = 0; i < pixels.length; i += 4)
			{
			j = i/4;
			pixels[i  ] = 128; // red
			pixels[i+1] = 128; // green
			pixels[i+2] = 128; // blue
			pixels[i+3] = 255; // alpha
			};
		}
	else
		{
		for (let i = 0; i < pixels.length; i += 4)
			{
			j = i/4;
			temp = (rImage[j]-minVal)/dynRange;
			if (temp < 0) temp = 0;
			if (temp > 1) temp = 1;
			pixels[i  ] = 255*temp; // red
			
			temp = (gImage[j]-minVal)/dynRange;
			if (temp < 0) temp = 0;
			if (temp > 1) temp = 1;
			pixels[i+1] = 255*temp; // green
			
			temp = (bImage[j]-minVal)/dynRange;
			if (temp < 0) temp = 0;
			if (temp > 1) temp = 1;
			pixels[i+2] = 255*temp; // blue
			
			pixels[i+3] = 255; // alpha
			};
		};
	return;
	};

// **************************************************************
function graphMargins()
	{
	let tempPlatform = navigator.platform;
	if (tempPlatform === 'iPhone')
		{ margins.top = 40; margins.bottom = 110; }
	else if (tempPlatform === 'iPad' || tempPlatform === 'MacIntel')
		{ margins.top = 50; margins.bottom = 145; }
	else if (tempPlatform === 'Linux aarch64')
		{ margins.top = 50; margins.bottom = 130; }
	else 
		{
		margins.top = 40; margins.bottom = 110;
		console.log("Not an expected device: "+tempPlatform);
		};
	return;
	};

// **************************************************************
function chooseAlpha(temp)
	{
	let v = temp;
	// for zoom below 4 overlay colors are more transparent
	let vCrit = 4;
	let a = alphaMax; // as in rgba(r,g,b,a)
	if (v < vCrit)  a = alphaMin + (alphaMax - alphaMin)*(v/vCrit);
	return a;
	};

// **************************************************************
// plotly images differ (y=0 is at the bottom) from canvas images (y=0 is at the top)
// the following is for images so that they be properly used
// direction = H or V or HV
function flipImage(array, direction)
	{
	let doubleFlip = createArray(rows,cols);
	if (direction == 'HV')
		{
		for (var i = 0; i < rows; i++)
			for (var j = 0; j < cols; j++)
				doubleFlip[i][j] = array[(rows-1 - i)*cols + (cols-1 - j)];
		}
	else if (direction == 'H')
		{
		for (var i = 0; i < rows; i++)
			for (var j = 0; j < cols; j++)
				doubleFlip[i][j] = array[i*cols + (cols-1 - j)];
		}
	else if (direction == 'V')
		{
		for (var i = 0; i < rows; i++)
			for (var j = 0; j < cols; j++)
				doubleFlip[i][j] = array[(rows-1 - i)*cols + j];
		}
	else throw('Problem in flipImage');
	
	return flatten(doubleFlip);
	};
	
// **************************************************************
// **************************************************************
//
var annotateTemplate =
	{
		xref: 'paper',
		yref: 'paper',
		x: 0.5,
		xanchor: 'center',
		y: 3*titleBelowAxis/4,
		yanchor: 'top',
		text: '',
		font:
			{
			family: axisTitleFont,
			size: 0.7*baseFontSize,
			color: axisTitleColor
			},
		showarrow: false,
		bgcolor: 'rgba(0,0,0,0)'
	}

var textTemplate =
	{
		align: 'left',
		xref: 'paper',
		yref: 'paper',
		x: -0.15,
		xanchor: 'left',
		y: 1.12,
		yanchor: 'top',
		text: '',
		font:
			{
			family: 'Georgia, Palatino, Bodoni, serif',
			size: myTitleSize,
			color: 'black'
			},
		showarrow: false
	}

var imageTemplate =
	{
		"source": "",
		"xref": "paper",
		"yref": "paper",
		"x1": 0.5,
		"y1": 0.5,
		"sizex": 1,
		"sizey": 1,
		"xanchor": "left",
		"yanchor": "bottom"
	}

// **************************************************************
// **************************************************************
// Continuous-Time (CT) plotting
// Left vert. axis label: makeAnnotation(0,'center',1.05,'bottom','G(t)')
// Right horiz. axis label: Annotate(0.5,'center',titleBelowAxis,'top',' t [ms]'),
// Center top data: Annotate(0.5,'center',1.15,'top','N = '+xDataCT.length+' samples')

// ity Sunday, 13 August 2017


var CTPlot = // continuous-time plot
	{
		type: 'scatter',
		visible: false,
		mode: 'lines',
		line: {shape: 'spline'},
		hoverinfo: 'none',
		marker: { size: 3, color: signalLineColor },
		xaxis: 'x1',
		yaxis: 'y1',
		x: [],
		y: [],
	};

var layoutCT =
	{
	showlegend: false,
	
	title :'Gaussian Noise',
	
	font:
		{
		family: myTitleFont,
		size: myTitleSize,
		color: myTitleColor
		},
	
	margin:
		{
		t: 100, //top margin
		l: 80, //left margin
		r: 80, //right margin
		b: 125 //bottom margin
		},

	xaxis1:
		{
		font:
			{
			family: axisTitleFont,
			size: axisTitleSize,
			color: axisTitleColor,
			},
		zeroline: false,
		zerolinewidth: zeroLineThick,
		showline: true,
		showticklabels: true,
		ticks: axisTicksPosition,
		tickfont:
			{
			family: axisTickFont,
			size: axisTickSize,
			color: axisTickColor
			},
		tickmode: 'auto',
		autotick: true,
		fixedrange: true,
		},
	
	yaxis1:
		{
		font:
			{
			family: axisTitleFont,
			size: axisTitleSize,
			color: axisTitleColor,
			},
		zeroline: true,
		zerolinewidth: zeroLineThick,
		showline: true,
		showticklabels: true,
		ticks: axisTicksPosition,
		tickfont:
			{
			family: axisTickFont,
			size: axisTickSize,
			color: axisTickColor
			},
		type: '',
		gridcolor: 'lightgray',
		autorange: true,
		fixedrange: true,
		},
		
	width: Math.floor(graphWidth[twoImages]),
	height: Math.floor(graphHeight[twoImages]),

	annotations:
		[annotateTemplate, annotateTemplate, annotateTemplate],
	
	images:
		[imageTemplate, imageTemplate, imageTemplate],
	};


// **************************************************************
// Discrete-Time (DT) Layout
// Left vert. axis label: Annotate(0,'center',1.05,'bottom','G[n]')
// Right horiz. axis label: Annotate(0.5,'center',1.5*titleBelowAxis,'bottom','n'),
// Center top data: Annotate(0.5,'center',1.15,'top','N = ' +xDataDT.length + ' samples')
//
// ity Sunday, 13 August 2017

var DTPlot = // discrete-time plot
	{
	type: 'scatter',
	visible: false,
	mode: 'markers',
	hoverinfo: 'none',
	marker: {symbol: DTmarker, size: DTmarkerSize, color: DTmarkerColor},
	error_y: {
		type: 'data',
		thickness: DTlineThick,
		color: DTlineColor,
		symmetric: false,
		array: [], // use zero-filled array
		arrayminus: [], // re-use y values
		width: 0 // hide cross-bars at end of error bars
		},
	xaxis: 'x2',
	yaxis: 'y2',
	x: [],
	y: [],
	};

var layoutDT =
	{
	showlegend: false,
	
	title :'Gaussian Noise',
	
	font:
		{
		family: myTitleFont,
		size: myTitleSize,
		color: myTitleColor
		},
	
	margin:
		{
		t: 100, //top margin
		l: 80, //left margin
		r: 80, //right margin
		b: 125 //bottom margin
		},

	xaxis2:
		{
		font:
			{
			family: axisTitleFont,
			size: axisTitleSize,
			color: axisTitleColor,
			},
		zeroline: false,
		zerolinewidth: zeroLineThick,
		showline: true,
		showticklabels: true,
		tickmode: "auto",
		ticks: axisTicksPosition,
		tickfont:
			{
			family: axisTickFont,
			size: axisTickSize,
			color: axisTickColor
			},
		tickvals: [],
		ticktext: [],
		tickformat: '.0f',
		autotick: true,
		fixedrange: true,
		},
	
	yaxis2:
		{
		font:
			{
			family: axisTitleFont,
			size: axisTitleSize,
			color: axisTitleColor,
			},
			
		zeroline: true,
		zerolinewidth: zeroLineThick,
		showline: true,
		showticklabels: true,
		ticks: axisTicksPosition,
		tickfont:
			{
			family: axisTickFont,
			size: axisTickSize,
			color: axisTickColor
			},
		type: '',
		gridcolor: 'lightgray',
		autorange: true,
		fixedrange: true,
		},
		
	width: Math.floor(graphWidth[twoImages]),
	height: Math.floor(graphHeight[twoImages]),
	
	annotations:
		[annotateTemplate, annotateTemplate, annotateTemplate],
	
	images:
		[imageTemplate, imageTemplate, imageTemplate],
	};


// **************************************************************
// Histogram plotting
//
// Left vert. axis label: Annotate(0,'center',1.05,'bottom','n(G)')
// Right horiz. axis label: Annotate(titleRightAxis,'left',0,'top',' G')
//
// ity Sunday, 13 August 2017

var Histogram =
	{
	type: 'histogram',
	visible: true,
	cumulative: { enabled : false },
	histfunc: 'count',
	histnorm: '',
	hoverinfo: 'none',
	marker: {color: histoColor, line: {color: histoColor, width: 1} },
	xaxis: 'x3',
	yaxis: 'y3',
	autobinx: false,
	nbinsx: null,
	xbins: { start: 0, end: 256 },
	x: [],
	};


var layoutH =
	{
	showlegend: false,

	title :'Amplitude Histogram',
	font:
		{
		family: myTitleFont,
		size: myTitleSize,
		color: myTitleColor
		},
	
	margin:
		{
		t: 100, //top margin
		l: 80, //left margin
		r: 80, //right margin
		b: 125 //bottom margin
		},

	bargap: 0.0,
	
	xaxis3:
		{
		font:
			{
			family: axisTitleFont,
			size: axisTitleSize,
			color: axisTitleColor,
			},
		zeroline: false,
		zerolinewidth: zeroLineThick,
		showline: true,
		showticklabels: true,
		ticks: axisTicksPosition,
		tickmode: 'auto',
		tickvals: [],
		ticktext: [],
		tickfont:
			{
			family: axisTickFont,
			size: axisTickSize,
			color: axisTickColor
			},
		fixedrange: true,
		},
	
	yaxis3:
		{
		font:
			{
			family: axisTitleFont,
			size: axisTitleSize,
			color: axisTitleColor,
			},
		zeroline: false,
		zerolinewidth: zeroLineThick,
		showline: true,
		showticklabels: true,
		ticks: axisTicksPosition,
		tickmode: 'auto',
		tickvals: [],
		ticktext: [],
		tickfont:
			{
			family: axisTickFont,
			size: axisTickSize,
			color: axisTickColor
			},
		fixedrange: true,
		rangemode: 'tozero',
		},
		
	width: Math.floor(graphWidth[twoImages]),
	height: Math.floor(graphHeight[twoImages]),
	
	annotations:
		[annotateTemplate, annotateTemplate, annotateTemplate],
	
	images:
		[imageTemplate, imageTemplate, imageTemplate],
	};

// **************************************************************
// Frequency domain plotting
// Left vert. axis label: makeAnnotation(0,'center',1.05,'bottom','|G(f)|')
// Right horiz. axis label: Annotate(0.5,'center',titleBelowAxis,'top',' f [Hz]'),
// Center top data: Annotate(0.5,'center',1.15,'top','N = '+xDataCT.length+' samples')

// ity Sunday, Tuesday, 15 August 2017

var SpectrumPlot = // continuous-time plot
	{
		type: 'scatter',
		visible: false,
		mode: 'lines',
		line: {shape: 'spline'},
		hoverinfo: 'none',
		marker: { size: 3, color: signalLineColor },
		xaxis: 'x4',
		yaxis: 'y4',
		x: [],
		y: [],
	};

var layoutSpect =
	{
	showlegend: false,
	
	title :'Fourier Spectrum',
	font:
		{
		family: myTitleFont,
		size: myTitleSize,
		color: myTitleColor
		},
	
	margin:
		{
		t: 100, //top margin
		l: 80, //left margin
		r: 80, //right margin
		b: 125 //bottom margin
		},

	xaxis4:
		{
		font:
			{
			family: axisTitleFont,
			size: axisTitleSize,
			color: axisTitleColor,
			},
		zeroline: false,
		zerolinewidth: zeroLineThick,
		showline: true,
		showticklabels: true,
		ticks: axisTicksPosition,
		tickfont:
			{
			family: axisTickFont,
			size: axisTickSize,
			color: axisTickColor
			},
		tickvals: [],
		ticktext: [],
		type: '',
		fixedrange: true,
		},
	
	yaxis4:
		{
		font:
			{
			family: axisTitleFont,
			size: axisTitleSize,
			color: axisTitleColor,
			},
		zeroline: true,
		zerolinewidth: zeroLineThick,
		showline: true,
		showticklabels: true,
		showgrid: true,
		gridwidth: 1,
		gridcolor: 'darkgrey',
		ticks: axisTicksPosition,
		tickfont:
			{
			family: axisTickFont,
			size: axisTickSize,
			color: axisTickColor
			},
		type: 'log',
		fixedrange: true,
		},
		
	width: Math.floor(graphWidth[twoImages]),
	height: Math.floor(graphHeight[twoImages]),

	annotations:
		[annotateTemplate, annotateTemplate, annotateTemplate],
	
	images:
		[imageTemplate, imageTemplate, imageTemplate],
	};

// **************************************************************
// Blank plot
// Left vert. axis label: makeAnnotation(0,'center',1.05,'bottom','|G(f)|')
// Right horiz. axis label: Annotate(0.5,'center',titleBelowAxis,'top',' f [Hz]'),
// Center top data: Annotate(0.5,'center',1.15,'top','N = '+xDataCT.length+' samples')

// ity Wednesday, 13 September 2017


var BlankPlot = // discrete-time plot
	{
		type: 'scatter',
		visible: false,
		hoverinfo: 'none',
		xaxis: 'x5',
		yaxis: 'y5',
		x: [],
		y: [],
	};

var layoutBlank =
	{
	showlegend: false,

	title :'',
	font:
		{
		family: myTitleFont,
		size: myTitleSize,
		color: myTitleColor
		},

	margin:
		{
		t: 100, //top margin
		l: 80, //left margin
		r: 80, //right margin
		b: 125 //bottom margin
		},

	xaxis5:
		{
		zeroline: false,
		zerolinewidth: 0,
		showline: false,
		showticklabels: false,
		showspikes: false,
		showgrid: false,
		fixedrange: true,
		},

	yaxis5:
		{
		zeroline: false,
		zerolinewidth: 0,
		showline: false,
		showticklabels: false,
		showgrid: false,
		fixedrange: true,
		},
	
	width: Math.floor(graphWidth[twoImages]),
	height: Math.floor(graphHeight[twoImages]),

	annotations:
		[annotateTemplate, annotateTemplate, annotateTemplate],
	
	images:
		[imageTemplate, imageTemplate, imageTemplate],
	};


// **************************************************************
// Bar Plot Layout
//
// Left vert. axis label: Annotate(0,'center',1.05,'bottom','n(G)')
// Right horiz. axis label: Annotate(titleRightAxis,'left',0,'top',' G')
//
// ity Wednesday, 13 September 2017


var BarPlot = // bar plot of two counts, n(H) and n(T)
	{
		type: 'bar',
		visible: false,
		text: [],
		textposition: 'auto',
		textfont: {color: 'white'},
		hoverinfo: 'none',
		marker: {
			color: ['rgb(70, 130, 180)', 'rgb(180, 70, 70))'],
			line: { color: 'black', width: 1.5 }, 
			},
		xaxis: 'x6',
		yaxis: 'y6',
		x: ['Heads', 'Tails'],
		y: [],
	};


var layoutBar =
	{
	showlegend: false,

	title :'Histogram of Heads & Tails',
	font:
		{
		family: myTitleFont,
		size: myTitleSize,
		color: myTitleColor
		},

	margin:
		{
		t: 100, //top margin
		l: 80, //left margin
		r: 80, //right margin
		b: 125 //bottom margin
		},

	xaxis6:
		{
		font:
			{
			family: axisTitleFont,
			size: axisTitleSize,
			color: axisTitleColor,
			},
		tickfont:
			{
			family: axisTickFont,
			size: axisTickSize,
			color: axisTickColor
			},
		fixedrange: true,
		},

	yaxis6:
		{
		font:
			{
			family: axisTitleFont,
			size: axisTitleSize,
			color: axisTitleColor,
			},
		
		zeroline: true,
		zerolinewidth: zeroLineThick,
		showline: true,
		showticklabels: true,
		ticks: axisTicksPosition,
		tickfont:
			{
			family: axisTickFont,
			size: axisTickSize,
			color: axisTickColor
			},
		autotick: true,
		fixedrange: true,
		},
	
	width: Math.floor(graphWidth[twoImages]),
	height: Math.floor(graphHeight[twoImages]),
	
	annotations:
		[annotateTemplate, annotateTemplate, annotateTemplate],
	
	images:
		[imageTemplate, imageTemplate, imageTemplate],
	};

// **************************************************************
// Special Image Plot
//
// Left vert. axis label: Annotate(0,'center',1.05,'bottom','n(G)')
// Right horiz. axis label: Annotate(titleRightAxis,'left',0,'top',' G')
//
// ity Wednesday, 13 September 2017

var ImagePlot =
	{
	type: 'heatmap',
	visible: false,
	mode: 'markers',
	hoverinfo: 'none',
	marker: {
		symbol: 'circle',
		size: 9*DTmarkerSize,
		color: 'rgba(70, 130, 180,0.75)'
		},
	xaxis: 'x7',
	yaxis: 'y7',
	x: [],
	y: [],
	z: [],
	showscale: false,
	colorscale: 'Greys',
	colorbar: 
		{
		title: '',
		titleside: colorBarTitlePosition,
		font:
			{
			family: colorBarTitleFont,
			size: colorBarTitleSize,
			color: colorBarTitleColor
			},
		tickfont:
			{
			family: axisTickFont,
			size: axisTickSize,
			color: axisTickColor
			},
		thickness: 10
		},
	};


var layoutImage =
	{
	showlegend: false,
	
	title :'',
	font:
		{
		family: myTitleFont,
		size: myTitleSize,
		color: myTitleColor
		},
	
	margin:
		{
		t: 100, //top margin
		l: 80, //left margin
		r: 80, //right margin
		b: 125 //bottom margin
		},

	xaxis7:
		{
		font:
			{
			family: axisTitleFont,
			size: axisTitleSize,
			color: axisTitleColor,
			},
		zeroline: false,
		zerolinewidth: zeroLineThick,
		showline: true,
		showticklabels: false,
		showspikes: false,
		ticks: '',
		tickfont:
			{
			family: axisTickFont,
			size: axisTickSize,
			color: axisTickColor
			},
		fixedrange: true,
		linecolor: 'maroon',
		linewidth: 1,
		mirror: true,
		},
	
	yaxis7:
		{
		font:
			{
			family: axisTitleFont,
			size: axisTitleSize,
			color: axisTitleColor,
			},
			
		zeroline: false,
		zerolinewidth: zeroLineThick,
		showline: true,
		showticklabels: false,
		ticks: '',
		tickfont:
			{
			family: axisTickFont,
			size: axisTickSize,
			color: axisTickColor
			},
		
		fixedrange: true,
		linecolor: 'maroon',
		linewidth: 1,
		mirror: true,
		},
	
	width: Math.floor(graphWidth[twoImages]),
	height: Math.floor(graphWidth[twoImages]),
	
	annotations:
		[annotateTemplate, annotateTemplate, annotateTemplate],
	
	images:
		[imageTemplate, imageTemplate, imageTemplate],
	};


// **************************************************************
// 3D Surface Plot
//
// Left vert. axis label: Annotate(0,'center',1.05,'bottom','n(G)')
// Right horiz. axis label: Annotate(titleRightAxis,'left',0,'top',' G')
//
// ity Monday, 18 September 2017


var surfacePlot = // surface plot
	{
	type: 'surface',
	visible: false,
	z: [],
	opacity: 1,
	colorscale: [],
	hoverinfo: 'none',
	showscale: false,
	colorbar: 
		{
		title: '',
		titleside: colorBarTitlePosition,
		font:
			{
			family: colorBarTitleFont,
			size: colorBarTitleSize,
			color: colorBarTitleColor
			},
		tickfont:
			{
			family: axisTickFont,
			size: axisTickSize,
			color: axisTickColor
			},
		thickness: 10,
		len: 0.8,
		x: 1,
		xanchor: 'left',
		xpad: 10
		},
	};

var surfaceLayout =
	{
	showlegend: false,
	title:'',
	font:
		{
		family: myTitleFont,
		size: myTitleSize,
		color: myTitleColor
		},
	
	margin:
		{
		t: 0, //top margin
		l: 0, //left margin
		r: 0, //right margin
		b: 0 //bottom margin
		},

	scene:
		{
		dragmode: 'orbit',
		aspectratio:
			{
			x: 1,
			y: 1,
			z: goldenRatio
			},
		camera:
			{
			center:
				{
				x: 0,
				y: 0,
				z: 0
				},
			eye:
				{
				x: 1.25,
				y: -1.25,
				z: 1.25
				},
			up:
				{
				x: 0,
				y: 0,
				z: 1
				}
			},
		xaxis:
			{
			title: 
				{
				text:'',
				font:
					{
					family: axisTitleFont,
					size: 0.95*axisTitleSize,
					color: axisTitleColor,
					}
				},
			type: 'linear',
			zeroline: true,
			zerolinewidth: zeroline,
			showgrid: true,
			gridcolor: 'darkgreen',
			showline: true,
			showticklabels: true,
			ticks: axisTicksPosition,
			tickfont:
				{
				family: axisTickFont,
				size: 0.9*axisTickSize,
				color: axisTickColor
				},
			tickvals: [],
			ticktext: [],
			},
		yaxis:
			{
			title: 
				{
				text:'',
				font:
					{
					family: axisTitleFont,
					size: 0.95*axisTitleSize,
					color: axisTitleColor,
					}
				},
			type: 'linear',
			zeroline: true,
			zerolinewidth: zeroline,
			showgrid: true,
			gridcolor: 'darkgreen',
			showline: true,
			showticklabels: true,
			ticks: axisTicksPosition,
			tickfont:
				{
				family: axisTickFont,
				size: 0.9*axisTickSize,
				color: axisTickColor
				},
			tickvals: [],
			ticktext: [],
			},
		zaxis:
			{
			title: '',
			font:
				{
				family: axisTitleFont,
				size: axisTitleSize,
				color: axisTitleColor,
				},
			type: 'linear',
			zeroline: true,
			zerolinewidth: zeroline,
			autorange: true,
			showgrid: true,
			gridcolor: 'darkgreen',
			autotick: true,
			showticklabels: false,
			ticks: axisTicksPosition,
			tickfont:
				{
				family: axisTickFont,
				size: axisTickSize,
				color: axisTickColor
				},
			showline: true,
			},
		},
	
	width: Math.floor(graphWidth[twoImages]),
	height: Math.floor(graphHeight[twoImages]),
	autosize: true,
	
	annotations:
		[annotateTemplate, annotateTemplate, annotateTemplate],
	
	images:
		[imageTemplate, imageTemplate, imageTemplate],
	};


// **************************************************************
// Data plotting
// Left vert. axis label: makeAnnotation(0,'center',1.05,'bottom','G(t)')
// Right horiz. axis label: Annotate(0.5,'center',titleBelowAxis,'top',' t [ms]'),
// Center top data: Annotate(0.5,'center',1.15,'top','N = '+xDataCT.length+' samples')

// ity Friday, 13 March 2020


var DataPlot = // continuous-time plot
	{
		type: 'scatter',
		visible: true,
		mode: 'markers',
		line: {dash: 'solid', width: 2, shape: 'linear'},
		hoverinfo: 'none',
		marker: { symbol: "circle-dot", size: 8, color: signalLineColor },
		xaxis: 'x8',
		yaxis: 'y8',
		x: [],
		y: [],
	};

var layoutData =
	{
	showlegend: true,
	
	legend:
		{
		font:
			{
			family: legendFont,
			size: legendFontSize,
			color: legendColor
			},
		bgcolor: legendBkgColor,
		bordercolor: legendBorderColor,
		borderwidth: 0,
		x: 0.02,
		xanchor: 'left',
		y: 1,
		yanchor: 'top'
		},
	
	title :'',
	
	font:
		{
		family: myTitleFont,
		size: myTitleSize,
		color: myTitleColor
		},
	
	margin:
		{
		t: 80, //top margin
		l: 60, //left margin
		r: 80, //right margin
		b: 80 //bottom margin
		},

	xaxis8:
		{
		font:
			{
			family: axisTitleFont,
			size: axisTitleSize,
			color: axisTitleColor,
			},
		zeroline: false,
		zerolinewidth: zeroLineThick,
		showline: true,
		showticklabels: true,
		ticks: axisTicksPosition,
		tickfont:
			{
			family: axisTickFont,
			size: axisTickSize,
			color: axisTickColor
			},
		tickmode: 'auto',
		autotick: true,
		fixedrange: true,
		},
	
	yaxis8:
		{
		font:
			{
			family: axisTitleFont,
			size: axisTitleSize,
			color: axisTitleColor,
			},
		zeroline: true,
		zerolinewidth: zeroLineThick,
		showline: true,
		showticklabels: true,
		ticks: axisTicksPosition,
		tickfont:
			{
			family: axisTickFont,
			size: axisTickSize,
			color: axisTickColor
			},
		type: '',
		autorange: true,
		fixedrange: true,
		},
		
	width: Math.floor(graphWidth[twoImages]),
	height: Math.floor(graphHeight[twoImages]),

	annotations:
		[annotateTemplate, annotateTemplate, annotateTemplate],
	
	images:
		[imageTemplate, imageTemplate, imageTemplate],
	};


// **************************************************************
// Bin data for display.
//
// ity Tuesday, 29 August 2017
//
// The number of pixels in the horizontal (screen) direction will be limited
// (e.g. 120). The number of data points could be large (e.g. 6000). 
// We do not (necessarily) need to reduce the 6000 points to 120; the
// plotting program can do that for us. To visually emphasize the excess of data
// points over pixel width we use "overkill", (e.g. overkill = 8). The 
// graphing program (e.g. plotly.js) will take care of the rest. We,
// therefore, subsample the original "data" to produce the data samples
// that will be passed to the plotting program. This reduced number of
// data samples is targetLength = "overkill*layout.width",
// (e.g. targetLength = 8*120 = 960). The reason for all of this is that
// binning with the graphing program can be excruciatingly slow.
// So we do the heavy lifting.
//
// Tuesday, 17 October 2017

var overkill = 2**3; // power of two ≥ 4
var binningFactor = overkill*layoutCT.width;

function binning(data,targetLength)
	{
	let step = Math.floor(data.length/targetLength);
	if (step > 1)
		{
		let result = createArray(targetLength);
		for (var i = 0; i < targetLength; i++ )
			result[i] = data[step*i]; // sampling step
		return result;
		}
	else
		{
		return data;
		};
	};

// **************************************************************
// Normalize data for display.
//
// ity Tuesday, 29 August 2017
//
// display data are simple lists. Numerical lists are normalized so
// that the maximum value is 1

// normalizeDisp() replaced with ampNormalizeReal() in SSPmath.js    Wednesday, 11 December 2019


// **************************************************************
// Choose display mode with radio buttons
// wA = window A, wB = window B, etc.

function myFunctionDisp(val,target,wA,wB,wC,wD)
	{
	// display CT signal and histogram
	dispState = val;
	if (digiState === 'ANALOG' && dispState === 'SH')
		{
		Plotly.react(wA, rst[0], rst[1], noMode); // CT signal
		Plotly.react(wB, rh[0], rh[1], noMode); // histogram
		Plotly.react(wC, fst[0], fst[1], noMode); // CT signal
		Plotly.react(wD, fh[0], fh[1], noMode); // histogram
		}
	// display DT signal and histogram
	else if (digiState === 'DIGITAL' && dispState === 'SH')
		{
		Plotly.react(wA, rsd[0], rsd[1], noMode); // DT signal
		Plotly.react(wB, rh[0], rh[1], noMode); // histogram
		Plotly.react(wC, fsd[0], fsd[1], noMode); // DT signal
		Plotly.react(wD, fh[0], fh[1], noMode); // histogram
		}
	// display CT correlation and power spectrum
	else if (digiState === 'ANALOG' && dispState === 'CP')  
		{
		Plotly.react(wA, rct[0], rct[1], noMode); // CT correlation
		Plotly.react(wB, rp[0], rp[1], noMode); // power spectral density
		if(experiment === '6.6c') Plotly.react(wC, op[0], op[1], noMode) // CT signal 
		else Plotly.react(wC, fct[0], fct[1], noMode); // CT correlation
		Plotly.react(wD, fp[0], fp[1], noMode); // power spectral density
		}
	// display DT correlation and power spectrum
	else if (digiState === 'DIGITAL' && dispState === 'CP')
		{
		Plotly.react(wA, rcd[0], rcd[1], noMode); // DT correlation
		Plotly.react(wB, rp[0], rp[1], noMode); // power spectral density
		if(experiment === '6.6c') Plotly.react(wC, op[0], op[1], noMode) // CT signal 
		else Plotly.react(wC, fcd[0], fcd[1], noMode); // CT correlation
		Plotly.react(wD, fp[0], fp[1], noMode); // power spectral density
		}
	else
		throw('Houston, we have a problem in myFunctionDisp.');
	};


// **************************************************************
// **************************************************************

