// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// Laboratory experiment 10.7
// i.t. young
// Sunday, 22 October 2017
// 
// ****************************************************************
// checked Sunday, 22 October 2017
// Friday, 26 January 2018
// Thursday, 1 February 2018

// global defined here (for now)
var SIMULATION = false;

var dispState = 'SH';
var digiState = 'ANALOG';
var experiment = '10.7';
var snrValues = [1, 2, 3, 4, 5, 6, 10, 25, 50, 100, 1000];
var filtSpect = [];
var filtSpectSq = [];
var redDisSpect = [];
var greenDisSpect = [];
var blueDisSpect = [];
var redDistorted = [];
var greenDistorted = [];
var blueDistorted = [];
var indexSNR = snrValues.length - 1;
var thisArea = 1;
var closing = " pixels";
var plot3D = cloneObj(surfacePlot); // global, defined in SSPplotting.js
var layout3D = cloneObj(surfaceLayout); // global, defined in SSPplotting.js
var xTicks = [];
var yTicks = [];
var xLabels = [0,'π/4','π/2','3π/4','π'];

// *****************************************************************
// Choose Radius with slider
function moveRadiusSlider(val)
	{
	let r = +val; // convert string to number
	closing = " pixels";
	if (r == 1) closing = " pixel"
	document.querySelector('#placeR').value =
		"R = " + r + closing;
	};

// *****************************************************************
// Choose SNR factor with slider
function moveSnrSlider(val)
	{
	let thisSNR = snrValues[val];
	document.querySelector('#placeSNR0').value =
		"SNR = "+thisSNR+":1";
	};

// *****************************************************************
// Dirty the image and 'restore' with Wiener filter
function getNoiseAndFilter(val)
	{
	indexSNR = val;
	nn = [rows, cols]; // in the target image
	ndim = nn.length;
	
	// memory-eating arrays
	let dirtyRed = Array(rows*cols);
	let dirtyGreen = Array(rows*cols);
	let dirtyBlue = Array(rows*cols);
	let wienerFilter = Array(2*rows*cols);
	
	let thisSNR = snrValues[indexSNR];

	var myMean = 0;
	var sigma = dynRange/thisSNR;
	for (let i = 0; i < redDistorted.length; i++)
		{
		dirtyRed[i] = redDistorted[i] + randomGaussian(myMean,sigma);
		dirtyGreen[i] = greenDistorted[i] + randomGaussian(myMean,sigma);
		dirtyBlue[i] = blueDistorted[i] + randomGaussian(myMean,sigma);
		};

	let dirtyRedSpect = fft(suR(dirtyRed), nn, ndim, FORWARD);
	let dirtyGreenSpect = fft(suR(dirtyGreen), nn, ndim, FORWARD);
	let dirtyBlueSpect = fft(suR(dirtyBlue), nn, ndim, FORWARD);
	
	let redRange = getDynRange(dirtyRed);
	let greenRange = getDynRange(dirtyGreen);
	let blueRange = getDynRange(dirtyBlue);
	minVal = Math.min(redRange[1],greenRange[1],blueRange[1]);
	maxVal = Math.max(redRange[2],greenRange[2],blueRange[2]);
	scaleForCanvas(pixelsPH,dirtyRed,dirtyGreen,dirtyBlue,minVal,maxVal)

	ctxPH.putImageData(imgDataPH,xoffset,yoffset);
	ctxB.drawImage(imgB,xoffset, yoffset, scaledCols, scaledRows);

	// WienerFilter = Conjugate[Ho]/(|Ho|^2 + K);
	// Factor 1/(|Ho|^2 + K) is pure REAL
	let realFactor = 0;
	for (let i = 0; i < wienerFilter.length; i += 2)
		{
		realFactor = (filtSpectSq[i] == 0) ? 0 : 1/(filtSpectSq[i]+thisK);
		wienerFilter[i] = filtSpect[i]*realFactor;
		wienerFilter[i+1] = -filtSpect[i+1]*realFactor; // conjugate here
		};
	
	// now the Wiener filtering to restore each color channel starts
	let resRedSpect = filterMult(wienerFilter,dirtyRedSpect);
	let resRedImage = uRs(fft(resRedSpect, nn, ndim, BACKWARD));

	let resGreenSpect = filterMult(wienerFilter, dirtyGreenSpect);
	let resGreenImage = uRs(fft(resGreenSpect, nn, ndim, BACKWARD));

	let resBlueSpect = filterMult(wienerFilter, dirtyBlueSpect);
	let resBlueImage = uRs(fft(resBlueSpect, nn, ndim, BACKWARD));

	redRange = getDynRange(resRedImage);
	greenRange = getDynRange(resGreenImage);
	blueRange = getDynRange(resBlueImage);
	minVal = Math.min(redRange[1],greenRange[1],blueRange[1]);
	maxVal = Math.max(redRange[2],greenRange[2],blueRange[2]);

	scaleForCanvas(pixelsMG,resRedImage,resGreenImage,resBlueImage,minVal,maxVal)
	
	ctxMG.putImageData(imgDataMG,xoffset,yoffset);
	ctxC.drawImage(imgC,xoffset, yoffset, scaledCols, scaledRows);
	
	// throw out the garbage
	dirtyRed = []; dirtyGreen = []; dirtyBlue = [];
	
	dirtyRedSpect = []; dirtyGreenSpect = []; dirtyBlueSpect = [];
	
	wienerFilter = [];

	closing = " pixels, ";
	if (thisArea == 1) closing = " pixel, "
	document.querySelector('#placeSNR1').value =
		"Circular aperture with Area = " + thisArea + closing +
			"SNR = "+thisSNR+":1, and K = "+thisK;
			
	Plotly.newPlot('Spectrum_2D', [plot3D], layout3D, noMode);

	};

// ********************************************************
function getRadiusAndFilter(radius)
	{
	let thresh = +radius; // convert string to number
	let padFilt = [];
	let padVal = [0,0];
	let filtersize = 51;
	let fRows = filtersize;
	let fCols = filtersize;
	let circle = createArray(2*fRows,fCols);
	let ycenter = fRows/2 - 0.5;
	let xcenter = fCols/2 - 0.5;
	let tempV = 0;
	let shiftR = 0;
	let shiftC = 0;
	
	for (var i = 0; i < 2*fRows; i += 2)
		for (var j = 0; j < fCols; j++)
			{
			circle[i+1][j] = 0; // imaginary part = 0
			tempV = Math.hypot((i/2-ycenter), (j-xcenter));
			if (tempV < thresh) // inside real circle
				circle[i][j] = 1;
			else // outside real circle
				circle[i][j] = 0;
			};
	let nnn = [fRows, fCols];
	let aperture = [nnn,merge(circle,nnn)];
	thisArea = total(aperture[1])[0]; // total of real part
	if (thisArea == 1)
		closing = " pixel & "
	else
		{
		closing = " pixels & ";
		for (var i = 0; i < aperture[1].length; i++)
			aperture[1][i] /= thisArea;
		};
// 	let myR = Math.sqrt(thisArea/Math.PI); // effective radius

	padFilt = imagePad([rows-fRows,cols-fCols], aperture, padVal);
	shiftR = (fRows-1) >> 1;
	shiftC = (fCols-1) >> 1;
	padFilt = dataRotate(padFilt,rows-shiftR,cols-shiftC);
	filtSpect = fft(padFilt[1], nn, ndim, FORWARD);
	filtSpectSq = abssq(filtSpect);
	
	redDisSpect = filterMult(filtSpect, redSpect);
	redDistorted = uRs(fft(redDisSpect, nn, ndim, BACKWARD));
	
	greenDisSpect = filterMult(filtSpect, greenSpect);
	greenDistorted = uRs(fft(greenDisSpect, nn, ndim, BACKWARD));
	
	blueDisSpect = filterMult(filtSpect, blueSpect);
	blueDistorted = uRs(fft(blueDisSpect, nn, ndim, BACKWARD));
	
	let temp = abs(filtSpect);
	temp = imageTake([nn,temp],[0,rows >> 1,0,cols >> 1]);
	plot3D.z = toPlotlyFormat(temp);

	if (SIMULATION) validatePlotly('plot3D',plot3D,layout3D,noMode)

	padFilt = [];
	temp = [];

	getNoiseAndFilter(indexSNR);
	};

// *****************************************************************
// Choose K factor with slider
function moveKSlider(val)
	{
	thisK = +val;
	document.querySelector('#placeK0').value = "K = "+thisK;
	};

// *****************************************************************
function getKandFilter(val)
	{
	thisK = +val;
	document.querySelector('#placeK0').value = "K = "+thisK;
	getNoiseAndFilter(indexSNR);
	};

// *****************************************************************
// for speed put first-used subroutine at bottom, second-used subroutine
// above that, etc.
function prepareLab_10_7()
	{
	rows = TruiColor.rows; // global
	cols = TruiColor.cols; // global
	nn = [rows, cols]; // in the target image
	ndim = nn.length;
	
	myWidth = Math.floor(0.875*window.innerWidth)>>1;
	scaledCols = (cols > myWidth) ? myWidth : cols; // fine tuned scale factor
	scaledRows = Math.floor(rows*(scaledCols/cols));
	xoffset = 0;
	yoffset = 0;

	truiRed = TruiColor.data1[0]; // global
	redSpect = fft(suR(truiRed), nn, ndim, FORWARD);
	redPSD = abssq(redSpect); // power spectral density

	truiGreen = TruiColor.data1[1]; // global
	greenSpect = fft(suR(truiGreen), nn, ndim, FORWARD);
	greenPSD = abssq(greenSpect); // power spectral density
	
	truiBlue = TruiColor.data1[2]; // global
	blueSpect = fft(suR(truiBlue), nn, ndim, FORWARD);
	bluePSD = abssq(blueSpect); // power spectral density

	// Caveat Emptor: pixels are in a data format that is CLAMPED to
	// the integer range 0 to 255. Do all processing with "float" and
	// then rescale to this range before writing in pixels.
	canvasBW = document.getElementById(wDummyBW);
	canvasBW.hidden = true;
	ctxBW = canvasBW.getContext('2d');
	imgDataBW = ctxBW.createImageData(cols, rows);
	pixelsBW  = imgDataBW.data;	
	
	canvasA = document.getElementById(wA);
	canvasA.style.border = imgBorder;
	ctxA = canvasA.getContext("2d");
	imgA = document.getElementById(wDummyBW);
	canvasA.width = scaledCols;
	canvasA.height = scaledRows;

	canvasPH = document.getElementById(wDummyPH);
	canvasPH.hidden = true;
	ctxPH = canvasPH.getContext('2d');
	imgDataPH = ctxPH.createImageData(cols, rows);
	pixelsPH  = imgDataPH.data;	

	canvasB = document.getElementById(wB);
	canvasB.style.border = imgBorder;  
	ctxB = canvasB.getContext("2d");
	imgB = document.getElementById(wDummyPH);
	canvasB.width = scaledCols;
	canvasB.height = scaledRows;
	
	canvasMG = document.getElementById(wDummyMG);
	canvasMG.hidden = true;
	ctxMG = canvasMG.getContext('2d');
	imgDataMG = ctxMG.createImageData(cols, rows);
	pixelsMG  = imgDataMG.data;	

	canvasC = document.getElementById(wC);
	canvasC.style.border = imgBorder;  
	ctxC = canvasC.getContext("2d");
	imgC = document.getElementById(wDummyMG);
	canvasC.width = scaledCols;
	canvasC.height = scaledRows;

	// In a "real" imaging system there is a certain noise power. That noise
	// appears in all three color channels, in this case as additive noise.
	// That means the SNR in each color channel will be different. I use the
	// green channel to get the SNR that will determine the sigma that will
	// be used in all three channels.
	
	let greenRange = getDynRange(truiGreen);
	scaleForCanvas(pixelsBW,truiRed,truiGreen,truiBlue,greenRange[1],greenRange[2])
	
	dynRange = greenRange[0];
	ctxBW.putImageData(imgDataBW,xoffset,yoffset);
	ctxA.drawImage(imgA, xoffset, yoffset, scaledCols, scaledRows);
	
	let firstSNRval = snrValues.length - 1;
	let thisSNR = snrValues[firstSNRval];
	let firstArea = 1;
	thisSNR = snrValues[firstSNRval];
	document.querySelector('#placeSNR0').value = "SNR = "+thisSNR+":1";
	
	var sub10 = '10';
	var subx = 'x';
	var suby = 'y';
	var italicY = 'rows';
	var italicOmegaX = 'Ω<sub>x</sub>';
	var italicX = 'columns';
	var italicOmegaY = 'Ω<sub>y</sub>';
	var italicZ = '';

	// creating display objects..
	plot3D.visible = true;
	plot3D.showscale = false;
	plot3D.colorscale = 'RdBu';
	
	layout3D.scene.xaxis.title.text = italicOmegaX;
	layout3D.scene.yaxis.title.text = italicOmegaY;
	if (navigator.platform === 'iPhone') 
		{
		layout3D.scene.xaxis.tickfont.size = axisTickSize;
		layout3D.scene.yaxis.tickfont.size = axisTickSize;
		}
	layout3D.scene.camera.eye.x = eyeX;
	layout3D.scene.camera.eye.y = eyeY;
	layout3D.scene.camera.eye.z = eyeZ;
	layout3D.width = scaledCols;
	layout3D.height = scaledRows;

	var nLabels = 5; // must be odd
	for (var i = 0; i < nLabels; i++)
		{
		xTicks[i] = Math.floor(i*(rows/2)/(nLabels-1));
		if (i == (nLabels-1)) xTicks[i] = (rows >> 1)-1;
		yTicks[i] = Math.floor(i*(cols/2)/(nLabels-1));
		if (i == (nLabels-1)) yTicks[i] = (cols >> 1)-1;
		};

	layout3D.scene.xaxis.tickvals = xTicks;
	layout3D.scene.xaxis.ticktext = xLabels;
	layout3D.scene.yaxis.tickvals = yTicks;
	layout3D.scene.yaxis.ticktext = xLabels;

	truiRed = [];
	truiGreen = [];
	truiBlue = [];

	thisK = 0;
	let firstRadius = '1';
	getRadiusAndFilter(firstRadius)
	};

