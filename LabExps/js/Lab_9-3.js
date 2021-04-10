// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// Laboratory experiment 9.3 (Fourier Domain)
// i.t. young
// Sunday, 22 October 2017
// 
// ****************************************************************
// checked Sunday, 22 October 2017

// globals defined here (for now)
var SIMULATION = false;

var dispState = 'SH';
var digiState = 'ANALOG';
var experiment = '9.3';
var centerPos = [0,0];
var template = [];

var rows = null; // global
var cols = null; // global
var ndim = null;
var nn = [];
var nnn = [];
var normedTemplate = null;
var uNoisyData = null;
var ctxDumC = null;
var imgDataC = null;
var ctxDumBW = null;
var imgDataBW = null;
var pixelsBW = null;
var ctxBW = null;
var imgBW = null;
var ctxC = null;
var imgC = null;

var scaledCols = null;
var scaledRows = null;
var xoffset = null;
var yoffset = null;
var fRows = null; 
var fCols = null; 
var shiftR = null;
var deltaR = null;
var shiftC = null;
var deltaC = null;
var sjablonSpect = null;

var crossCorr = [];
var coordinates = [0,0,1024,512];
var ndim = nn.length;
var thisVal = 7; // starting SNR = 1000:1
var padValue = [0,0];
var dispFactor = 1;

var snrValues = [1, 2, 4, 5, 10, 50, 100, 1000];

// *****************************************************************
// Functions defined here

function updateColorCanvas(imageName,xy)
	{
	'use strict';

	var scaleCanvasX = scaledCols/cols; // fine tuned scale factor
	var x0 = xy[1] - (fCols>>1); // convert center x to left edge
	var y0 = xy[0] - (fRows>>1); // convert center y to top edge
	
	let scaleW = 1.5*(scaledCols/cols);
	let xwidth = xy[2]*scaleW;
	let yheight = xy[3]*scaleW;

	// upper-left corner, horizontal
	var xstart = Math.floor(scaleCanvasX*(x0-7));
	// upper-left corner, vertical
	var ystart = Math.floor(scaleCanvasX*(y0-10));
	
	ctxDumC.putImageData(imgDataC,xoffset,yoffset);
	ctxC.drawImage(imgC,xoffset, yoffset, scaledCols, scaledRows);
	ctxC.strokeStyle="aqua";
	ctxC.lineWidth=2;
	if (xstart <= 0) xstart = +1;
	if (ystart <= 0) ystart = -1;
	ctxC.strokeRect(xstart,ystart,xwidth,yheight);
	};

// *****************************************************************
function cosDistImagCorr(image,template)
	{
	// the cosine distance correlation is the angle between
	// two vectors a and b:
	//         cosDis(a,b) = (a•b)/(|a||b|) = (a/|a|)•(b/|b|)
	'use strict';

	let t0 = performance.now();

	let imageView = image[1].slice();
	let normedImage = Array(imageView.length);
	for (let i = 0; i < normedImage.length; i += 2)
		{
		normedImage[i] = imageView[i]**2;
		normedImage[i+1] = 0;
		};

	let photoView = normedTemplate.slice();
	
	// Calculation
	let smallDummy = Array(photoView.length);
	for (let i = 0; i < smallDummy.length; i += 2)
		{
		smallDummy[i] = 1;
		smallDummy[i+1] = 0;
		};

	let paddedTemplate =
		imagePad([deltaR,deltaC], [template[0],smallDummy], padValue);
	let dummy = dataRotate(paddedTemplate,shiftR,shiftC);
	
	let normSjablonSpect = fft(dummy[1], nn, ndim, FORWARD);
	let imageSpect = fft(normedImage, nn, ndim, FORWARD);
	
	let normSpect = filterMult(normSjablonSpect, imageSpect);
	let result = re(fft(normSpect, nn, ndim, BACKWARD));
	
	imageSpect = fft(imageView, nn, ndim, FORWARD);
	
	normSpect = filterMult(imageSpect, conjugate(sjablonSpect));
	crossCorr = re(fft(normSpect, nn, ndim, BACKWARD));
	
	for (let i = 0; i < crossCorr.length; i += 2) crossCorr[i] = 
		(result[i] == 0) ? 0 : crossCorr[i]/Math.sqrt(result[i]);

	let maxVal = -Infinity;
	let tempVal = 0;
	for (let i = 0; i < crossCorr.length; i += 2)
		{
		tempVal = crossCorr[i];
		if (maxVal < tempVal)  maxVal = tempVal; // max image correlation
		};
	
	// throwing out the garbage
	imageView = [];
	normedImage = [];
	photoView = [];
	smallDummy = [];
	paddedTemplate = [];
	dummy = [];
	normSjablonSpect = [];
	normSpect = [];
	result = [];
	let duration = Math.ceil(performance.now() - t0);
	document.querySelector('#placeTime').value = 
		"Computation time = "+duration+" ms";

	return [[nn,crossCorr],maxVal];
	};

// *****************************************************************
function process_9_3(data,template)
	{
	// Find position of max correlation of filter with data
	// Calculating cosine correlation in Fourier domain
	'use strict';

	var result = cosDistImagCorr(data,template);
	var reCorr = result[0];
	var maxPixel = result[1];
	var coords = pixelValuePositions(reCorr,maxPixel);
	return coords[0];
	};

// *****************************************************************
function getTemplate(target)
	{
	'use strict';

	if (target === '1') // Langevin
		{
		nnn[0] = Langevin.rows; // rows
		nnn[1] = Langevin.cols; // cols
		template = [nnn,suR(Langevin.data1)];
		}
	else if (target === '2') // Lorentz
		{
		nnn[0] = Lorentz.rows; // rows
		nnn[1] = Lorentz.cols; // cols
		template = [nnn,suR(Lorentz.data1)];
		}
	else if (target === '3') // Schrödinger
		{
		nnn[0] = Schrodinger.rows; // rows
		nnn[1] = Schrodinger.cols; // cols
		template = [nnn,suR(Schrodinger.data1)];
		}
	else if (target === '4') // Pauli
		{
		nnn[0] = Pauli.rows; // rows
		nnn[1] = Pauli.cols; // cols
		template = [nnn,suR(Pauli.data1)];
		}
	else throw('Houston, we have a problem in getTemplate.');;
	
	fRows = nnn[0];
	fCols = nnn[1];
	shiftR = rows - (fRows>>1);
	deltaR = rows - fRows;
	shiftC = cols - (fCols>>1);
	deltaC = cols - fCols;

	// now normalize the template with the L2norm
	normedTemplate = template[1];
	let scaleFactor = L2norm(normedTemplate);
	for (let i = 0; i < normedTemplate.length; i++) normedTemplate[i] = 
		(scaleFactor == 0) ? 1 : normedTemplate[i]/scaleFactor;

	let paddedTemplate = imagePad([deltaR,deltaC], [nnn,normedTemplate], padValue);
	let dummy = dataRotate(paddedTemplate,shiftR,shiftC);
	sjablonSpect = fft(dummy[1], nn, ndim, FORWARD);

	getSNR(thisVal);
	};

// *****************************************************************
// Choose SNR factor with slider
function moveSnrSlider(val)
	{
	'use strict';

	let thisSNR = snrValues[val];
	document.querySelector('#placeSNR').value = "SNR = "+thisSNR+":1";
	};

// *****************************************************************
// Choose SNR factor with slider
function getSNR(val)
	{
	'use strict';

	thisVal = +val;
	let thisSNR = snrValues[thisVal];
	document.querySelector('#placeSNR').value = "SNR = "+thisSNR+":1";

	let imageData = Array(SolvayBW.data1.length);
	imageData = SolvayBW.data1;
	let noisyData = Array(imageData.length); // array for noisy Solvay
	
	let uImageData = Array(2*imageData.length);
	uImageData = suR(imageData);
	
	let rangeResult = getDynRange(imageData);
	let dynRange = rangeResult[0];

	var myMean = 0;
	var sigma = dynRange/thisSNR;
	
	let minVal = Infinity;
	let maxVal = -Infinity;
	let tempVal = 0;
	let noise = 0;
	for (let i = 0; i < uNoisyData.length; i += 2)
		{
		noise = randomGaussian(myMean,sigma);
		tempVal = uImageData[i] + noise; // for display
		uNoisyData[i] = tempVal; // for processing
		uNoisyData[i+1] = 0; // imaginary part = 0
		noisyData[i>>1] = tempVal;
		if (tempVal < minVal) minVal = tempVal;
		if (tempVal > maxVal) maxVal = tempVal;
		};

	for (let i = 0; i < pixelsBW.length; i += 4)
			{
			tempVal = noisyData[i>>2];
			pixelsBW[i  ] = 255*(tempVal-minVal)/(maxVal-minVal); // red
			pixelsBW[i+1] = 255*(tempVal-minVal)/(maxVal-minVal);	// green
			pixelsBW[i+2] = 255*(tempVal-minVal)/(maxVal-minVal);	// blue
			pixelsBW[i+3] = 255;  // alpha
			};
	ctxDumBW.putImageData(imgDataBW,xoffset,yoffset);
	ctxBW.drawImage(imgBW,xoffset, yoffset, scaledCols, scaledRows);

	let nData = [nn,uNoisyData]; // to universal format
	centerPos = process_9_3(nData,template);
	let x0 = centerPos[0]; // center position
	let y0 = centerPos[1]; // center position
	let dy = nnn[0]; // rows
	let dx = nnn[1]; // cols
	coordinates = [x0,y0,dx,dy];
	updateColorCanvas(wC,coordinates);
	
	imageData = []; // take out the garbage
	noisyData = []; // take out the garbage
	uImageData = []; // take out the garbage
	};

// *****************************************************************
// for speed put first-used subroutine at bottom, second-used subroutine
// above that, etc.

function prepareLab_9_3( )
	{
	'use strict';

	rows = SolvayColor.rows; // global
	cols = SolvayColor.cols; // global
	nn = [rows, cols]; // in the target image
	ndim = nn.length;
	let urows = 2*rows; // universal rows = 2*rows
	
	// global template & image arrays
	normedTemplate = Array(2*Langevin.data1.length);
	// array for noisy Solvay
	uNoisyData = Array(2*SolvayBW.data1.length);
	let SolvayRed = SolvayColor.data1[0];
	let SolvayGreen = SolvayColor.data1[1];
	let SolvayBlue = SolvayColor.data1[2];

	// set up dummy displays before going to getTemplate
	let canvasDumC = document.getElementById(wDummyC); // global
	canvasDumC.hidden = true;
	ctxDumC = canvasDumC.getContext('2d'); // global
	imgDataC = ctxDumC.createImageData(cols, rows);
	
	let canvasDumBW = document.getElementById(wDummyBW); // global
	canvasDumBW.hidden = true;
	ctxDumBW = canvasDumBW.getContext('2d'); // global
	imgDataBW = ctxDumBW.createImageData(cols, rows);
	
	// Caveat Emptor: pixels are in a data format that is CLAMPED to
	// the integer range 0 to 255. Do all processing with "float" and
	// then rescale to this range before writing in pixels.
	let pixelsC  = imgDataC.data;
	pixelsBW  = imgDataBW.data;
	let j = null;
	for (let i = 0; i < pixelsC.length; i += 4)
		{
		j = i>>2;
		pixelsC[i  ] = SolvayRed[j];		// red
		pixelsC[i+1] = SolvayGreen[j];	// green
		pixelsC[i+2] = SolvayBlue[j];	// blue
		pixelsC[i+3] = 255; 				// alpha
		
		pixelsBW[i  ] = SolvayBW.data1[j];		// red
		pixelsBW[i+1] = SolvayBW.data1[j];	// green
		pixelsBW[i+2] = SolvayBW.data1[j];	// blue
		pixelsBW[i+3] = 255; 				// alpha
		};
	let innerW = window.innerWidth;
	scaledCols = Math.floor(0.875*innerW); // fine tuned scale factor
	scaledRows = Math.floor(rows*(scaledCols/cols));
	xoffset = 0;
	yoffset = 0;
	ctxDumC.putImageData(imgDataC,xoffset,yoffset);
	ctxDumBW.putImageData(imgDataBW,xoffset,yoffset);

	var canvasBW = document.getElementById(wBW);
	canvasBW.style.border = "1px solid maroon";  
	ctxBW = canvasBW.getContext("2d");
	imgBW = document.getElementById(wDummyBW);
	canvasBW.width = scaledCols;
	canvasBW.height = scaledRows;
	ctxBW.drawImage(imgBW, xoffset, yoffset, scaledCols, scaledRows);

	var canvasC = document.getElementById(wC);
	canvasC.style.border = "1px solid maroon";  
	ctxC = canvasC.getContext("2d");
	imgC = document.getElementById(wDummyC);
	canvasC.width = scaledCols;
	canvasC.height = scaledRows;
	ctxC.drawImage(imgC, xoffset, yoffset, scaledCols, scaledRows);
	
	SolvayRed = [];
	SolvayGreen = [];
	SolvayBlue = [];
	
	let firstTarget = '1';
	getTemplate(firstTarget);
	
	// now wait for interaction
	};

