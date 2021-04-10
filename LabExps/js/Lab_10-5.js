// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// Laboratory experiment 10.5
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
var plot3D = cloneObj(surfacePlot); // global, defined in SSPplotting.js
var layout3D = cloneObj(surfaceLayout); // global, defined in SSPplotting.js
var xTicks = [];
var yTicks = [];
var xLabels = [0,'π/4','π/2','3π/4','π'];

// *****************************************************************
// Functions defined here

// Choose SNR factor with slider
function moveSlider(val)
	{
	let thisSNR = snrValues[val];
	document.querySelector('#placeSNR0').value =
		"SNR = "+thisSNR+":1";
	document.querySelector('#placeSNR1').value =
		"Distorted Image + Noise (SNR = "+thisSNR+":1)";
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
	
	let redNoise = Array(rows*cols);
	let greenNoise = Array(rows*cols);
	let blueNoise = Array(rows*cols);
	
	let redWienerFilter = Array(2*rows*cols);
	let greenWienerFilter = Array(2*rows*cols);
	let blueWienerFilter = Array(2*rows*cols);

	let dirtyRedSpect = Array(2*rows*cols);
	let dirtyGreenSpect = Array(2*rows*cols);
	let dirtyBlueSpect = Array(2*rows*cols);
	
	let thisSNR = snrValues[indexSNR];

	var myMean = 0;
	var sigma = dynRange/thisSNR;
	for (let i = 0; i < redNoise.length; i++)
		{
		redNoise[i] = randomGaussian(myMean,sigma);
		dirtyRed[i] = redDistorted[i] + redNoise[i];
		
		greenNoise[i] = randomGaussian(myMean,sigma);
		dirtyGreen[i] = greenDistorted[i] + greenNoise[i];
		
		blueNoise[i] = randomGaussian(myMean,sigma);
		dirtyBlue[i] = blueDistorted[i] + blueNoise[i];
		};
	
	let redNoiseSpect = fft(suR(redNoise), nn, ndim, FORWARD);
	let redNoisePSD = abssq(redNoiseSpect); // power spectral density
	
	let greenNoiseSpect = fft(suR(greenNoise), nn, ndim, FORWARD);
	let greenNoisePSD = abssq(greenNoiseSpect); // power spectral density
	
	let blueNoiseSpect = fft(suR(blueNoise), nn, ndim, FORWARD);
	let blueNoisePSD = abssq(blueNoiseSpect); // power spectral density
	
	// distorted spectrum + noise spectrum
	for (let i = 0; i < redDisSpect.length; i++)
		{
		dirtyRedSpect[i] = redDisSpect[i] + redNoiseSpect[i];
		dirtyGreenSpect[i] = greenDisSpect[i] + greenNoiseSpect[i];
		dirtyBlueSpect[i] = blueDisSpect[i] + blueNoiseSpect[i];
		};

	let redRange = getDynRange(dirtyRed);
	let greenRange = getDynRange(dirtyGreen);
	let blueRange = getDynRange(dirtyBlue);
	minVal = Math.min(redRange[1],greenRange[1],blueRange[1]);
	maxVal = Math.max(redRange[2],greenRange[2],blueRange[2]);
	scaleForCanvas(pixelsPH,dirtyRed,dirtyGreen,dirtyBlue,minVal,maxVal)

	ctxPH.putImageData(imgDataPH,xoffset,yoffset);
	ctxB.drawImage(imgB,xoffset, yoffset, scaledCols, scaledRows);

	// WienerFilter = Conjugate[Ho]*Sxx/((|Ho|^2 *Sxx) + Snn);
	// Factor Sxx/((|Ho|^2 *Sxx) + Snn) is pure REAL
	let realFactor = 0;
	for (let i = 0; i < redWienerFilter.length; i += 2)
		{
		realFactor = (redPSD[i] == 0) ? 0 :
			1/(filtSpectSq[i]+(redNoisePSD[i]/redPSD[i]));
		redWienerFilter[i] = filtSpect[i]*realFactor;
		redWienerFilter[i+1] = -filtSpect[i+1]*realFactor; // conjugate here
				
		realFactor = (greenPSD[i] == 0) ? 0 :
			1/(filtSpectSq[i]+(greenNoisePSD[i]/greenPSD[i]));
		greenWienerFilter[i] = filtSpect[i]*realFactor;
		greenWienerFilter[i+1] = -filtSpect[i+1]*realFactor; // conjugate here
				
		realFactor = (bluePSD[i] == 0) ? 0 :
			1/(filtSpectSq[i]+(blueNoisePSD[i]/bluePSD[i]));
		blueWienerFilter[i] = filtSpect[i]*realFactor;
		blueWienerFilter[i+1] = -filtSpect[i+1]*realFactor; // conjugate here
		};
	
	// now the Wiener filtering per color channel starts
	let resRedSpect = filterMult(redWienerFilter,dirtyRedSpect);
	let resRedImage = uRs(fft(resRedSpect, nn, ndim, BACKWARD));

	let resGreenSpect = filterMult(greenWienerFilter, dirtyGreenSpect);
	let resGreenImage = uRs(fft(resGreenSpect, nn, ndim, BACKWARD));

	let resBlueSpect = filterMult(blueWienerFilter, dirtyBlueSpect);
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
	
	redNoise = []; greenNoise = []; blueNoise = [];
	
	redWienerFilter = []; greenWienerFilter = []; blueWienerFilter = [];
	
	dirtyRedSpect = []; dirtyGreenSpect = []; dirtyBlueSpect = [];
	
	redNoiseSpect = []; greenNoiseSpect = []; blueNoiseSpect = [];
	
	redNoisePSD = []; greenNoisePSD = []; blueNoisePSD = [];

	Plotly.react('Spectrum_2D', [plot3D], layout3D, noMode);
	};

// *****************************************************************
function getFilter(target)
	{
	let filter = null;
	let u = [];
	let v = [];
	let padFilt = [];
	let padVal = [0,0];
	let filtersize = 1;
	let shiftR = 0;
	let shiftC = 0;
	
	if (target === '1')
		{
		filter = identityFilter;
		}
	else if (target === '2')
		{
		filtersize = 23;
		filter = gaussianMatrix(filtersize,filtersize,filtersize/4,'None');
		}
	else if (target === '3')
		{
		v = youngHPFilterAlt;
		u = v;
		filter = vOuter(v,u);
		}
	else if (target === '4')
		{
		v = youngNotchFilterAlt;
		u = v;
		filter = vOuter(v,u);
		}
	else if (target === '5')
		{
// 		filtersize = 17;
// 		filter = gaussianMatrix(filtersize,filtersize,filtersize/8,'xy');
		filter = xySobelFilter;
		}
	else throw('getFilter: Houston, we have a problem.');
	
	let fRows = filter[0][0];
	let fCols = filter[0][1];
	padFilt = imagePad([rows-fRows,cols-fCols], filter, padVal);
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
// for speed put first-used subroutine at bottom, second-used subroutine
// above that, etc.

function prepareLab_10_5()
	{
	rows = TruiColor.rows; // global
	cols = TruiColor.cols; // global
	nn = [rows, cols]; // in the target image
	ndim = nn.length;
	
	scaledCols = Math.floor(0.9*window.innerWidth)>>1;
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
	
	var rangeResults = getDynRange(truiGreen);
	scaleForCanvas(pixelsBW,truiRed,truiGreen,truiBlue,rangeResults[1],rangeResults[2])
	
	dynRange = rangeResults[0];
	ctxBW.putImageData(imgDataBW,xoffset,yoffset);
	ctxA.drawImage(imgA, xoffset, yoffset, scaledCols, scaledRows);
		
	let firstSNRval = snrValues.length - 1;
	let thisSNR = snrValues[firstSNRval];
	document.querySelector('#placeSNR0').value =
		"SNR = "+thisSNR+":1";
	document.querySelector('#placeSNR1').value =
		"Distorted Image + Noise (SNR = "+thisSNR+":1)";

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

	let firstFilter = '1';
	getFilter(firstFilter)
	};

