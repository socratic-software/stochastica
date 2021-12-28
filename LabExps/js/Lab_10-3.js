// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2022
// Licensed under the MIT license.
// Laboratory experiment 10.3
// i.t. young
// Sunday, 22 October 2017
// 
// ****************************************************************
// checked Sunday, 22 October 2017

// global defined here (for now)
var SIMULATION = false;

var dispState = 'SH';
var dispState = 'SH';
var digiState = 'ANALOG';
var experiment = '10.3';
var snrValues = [0.1, 0.3, 1, 2, 3, 6, 10, 30, 100, 1000];

	// *****************************************************************
// Functions defined here

// Choose SNR factor with slider
function moveSlider(val)
	{
	let thisSNR = snrValues[val];
	document.querySelector('#placeSNR0').value =
		"SNR = "+thisSNR+":1";
	document.querySelector('#placeSNR1').value =
		"Noisy Solvay Image (SNR = "+thisSNR+":1)";
	};

// Dirty the image and 'restore' with Wiener filter
function getNoiseAndFilter(val)
	{
	let thisSNR = snrValues[val];

	var myMean = 0;
	var sigma = dynRange/thisSNR;

	nn = [rows, cols]; // in the target image
	ndim = nn.length;
	
	// memory-eating arrays
	let redNoise = Array(rows*cols);
	let greenNoise = Array(rows*cols);
	let blueNoise = Array(rows*cols);
	let redWienerFilter = Array(2*rows*cols);
	let greenWienerFilter = Array(2*rows*cols);
	let blueWienerFilter = Array(2*rows*cols);
	let dirtyRed = Array(rows*cols);
	let dirtyGreen = Array(rows*cols);
	let dirtyBlue = Array(rows*cols);
		
	for (let i = 0; i < redNoise.length; i++)
		{
		redNoise[i] = randomGaussian(myMean,sigma);
		greenNoise[i] = randomGaussian(myMean,sigma);
		blueNoise[i] = randomGaussian(myMean,sigma);
		};
		
	let t0 = performance.now(); // start timing
	
	let redNoiseSpect = fft(suR(redNoise), nn, ndim, FORWARD);
	var redNoisePSD = abssq(redNoiseSpect); // power spectral density
	
	let greenNoiseSpect = fft(suR(greenNoise), nn, ndim, FORWARD);
	var greenNoisePSD = abssq(greenNoiseSpect); // power spectral density
	
	let blueNoiseSpect = fft(suR(blueNoise), nn, ndim, FORWARD);
	var blueNoisePSD = abssq(blueNoiseSpect); // power spectral density
	
	for (let i = 0; i < redWienerFilter.length; i++)
		{
		redWienerFilter[i] =
			(redPSD[i] == 0) ?
				0 : redPSD[i]/(redPSD[i]+redNoisePSD[i]);
		greenWienerFilter[i] =
			(greenPSD[i] == 0) ?
				0 : greenPSD[i]/(greenPSD[i]+greenNoisePSD[i]);
		blueWienerFilter[i] =
			(bluePSD[i] == 0) ?
				0 : bluePSD[i]/(bluePSD[i]+blueNoisePSD[i]);
		};

	let t1 = performance.now(); // stop timing
	
	let minVal = +Infinity;
	let maxVal = -Infinity;
	let minTempVal = 0;
	let maxTempVal = 0;
	for (let j = 0; j < redNoise.length; j++)
		{
		dirtyRed[j] = SolvayRed[j] + redNoise[j];		// red
		dirtyGreen[j] = SolvayGreen[j] + greenNoise[j];	// green
		dirtyBlue[j] = SolvayBlue[j] + blueNoise[j];	// blue
		
		minTempVal = Math.min(dirtyRed[j],dirtyGreen[j],dirtyBlue[j])
		maxTempVal = Math.max(dirtyRed[j],dirtyGreen[j],dirtyBlue[j])
		if (minTempVal < minVal) minVal = minTempVal;
		if (maxTempVal > maxVal) maxVal = maxTempVal;
		};

	// Caveat Emptor: pixels are in a data format that is CLAMPED to
	// the integer range 0 to 255. Do all processing with "float" and
	// then rescale to this range before writing in pixels.
	for (let i = 0; i < pixelsSN.length; i += 4)
		{
		j = i/4;
		pixelsSN[i  ] = 255*(dirtyRed[j]-minVal)/(maxVal-minVal); // red
		pixelsSN[i+1] = 255*(dirtyGreen[j]-minVal)/(maxVal-minVal); // green
		pixelsSN[i+2] = 255*(dirtyBlue[j]-minVal)/(maxVal-minVal); // blue
		pixelsSN[i+3] = 255; 				// alpha
		};

	ctxSN.putImageData(imgDataSN,xoffset,yoffset);
	ctxB.drawImage(imgB,xoffset, yoffset, scaledCols, scaledRows);

	let t2 = performance.now(); // start timing
	
	// now the Wiener filtering per color channel starts
	let redSpect = fft(suR(dirtyRed), nn, ndim, FORWARD);
	let resRedSpect = filterMult(redWienerFilter,redSpect);
	let resRedImage = chop(uRs(fft(resRedSpect, nn, ndim, BACKWARD)));

	let greenSpect = fft(suR(dirtyGreen), nn, ndim, FORWARD);
	let resGreenSpect = filterMult(greenWienerFilter, greenSpect);
	let resGreenImage = chop(uRs(fft(resGreenSpect, nn, ndim, BACKWARD)));

	let blueSpect = fft(suR(dirtyBlue), nn, ndim, FORWARD);
	let resBlueSpect = filterMult(blueWienerFilter, blueSpect);
	let resBlueImage = chop(uRs(fft(resBlueSpect, nn, ndim, BACKWARD)));

	let duration = Math.ceil(t1 - t0 + performance.now() - t2);
	document.querySelector('#placeTime').value = 
		"Computation time = "+duration+" ms";

	minVal = +Infinity;
	maxVal = -Infinity;
	minTempVal = 0;
	maxTempVal = 0;
	for (let i = 0; i < resRedImage.length; i++)
		{
		minTempVal = Math.min(resRedImage[i],resGreenImage[i],resBlueImage[i])
		maxTempVal = Math.max(resRedImage[i],resGreenImage[i],resBlueImage[i])
		if (minTempVal < minVal) minVal = minTempVal;
		if (maxTempVal > maxVal) maxVal = maxTempVal;
		};
	// Caveat Emptor: pixels are in a data format that is CLAMPED to
	// the integer range 0 to 255. Do all processing with "float" and
	// then rescale to this range before writing in pixels.
	for (let i = 0; i < pixelsOR.length; i += 4)
		{
		j = i/4;
		pixelsRE[i  ] = 255*(resRedImage[j]-minVal)/(maxVal-minVal); // red
		pixelsRE[i+1] = 255*(resGreenImage[j]-minVal)/(maxVal-minVal); // green
		pixelsRE[i+2] = 255*(resBlueImage[j]-minVal)/(maxVal-minVal); // blue
		pixelsRE[i+3] = 255; 				// alpha
		};
	
	ctxRE.putImageData(imgDataRE,xoffset,yoffset);
	ctxC.drawImage(imgC,xoffset, yoffset, scaledCols, scaledRows);
	
	redNoise = []; // take out the garbage
	greenNoise = []; // take out the garbage
	blueNoise = []; // take out the garbage
	redWienerFilter = []; // take out the garbage
	greenWienerFilter = []; // take out the garbage
	blueWienerFilter = []; // take out the garbage
	dirtyRed = []; // take out the garbage
	dirtyGreen = []; // take out the garbage
	dirtyBlue = []; // take out the garbage
	};

// *****************************************************************
// for speed put first-used subroutine at bottom, second-used subroutine
// above that, etc.

function prepareLab_10_3()
	{
	rows = SolvayColor.rows; // global
	cols = SolvayColor.cols; // global
	nn = [rows, cols]; // in the target image
	ndim = nn.length;
	
	scaledCols = Math.floor(0.875*window.innerWidth); // fine tuned scale factor
	scaledRows = Math.floor(rows*(scaledCols/cols));
	xoffset = 0;
	yoffset = 0;

	SolvayRed = SolvayColor.data1[0]; // global
	let redSpect = fft(suR(SolvayRed), nn, ndim, FORWARD);
	redPSD = abssq(redSpect); // power spectral density

	SolvayGreen = SolvayColor.data1[1]; // global
	let greenSpect = fft(suR(SolvayGreen), nn, ndim, FORWARD);
	greenPSD = abssq(greenSpect); // power spectral density
	
	SolvayBlue = SolvayColor.data1[2]; // global
	let blueSpect = fft(suR(SolvayBlue), nn, ndim, FORWARD);
	bluePSD = abssq(blueSpect); // power spectral density

	// ********************
	canvasOR = document.getElementById(wDummyOR); // global
	canvasOR.hidden = true;
	ctxOR = canvasOR.getContext('2d'); // global
	imgDataOR = ctxOR.createImageData(cols, rows);
	pixelsOR  = imgDataOR.data;
	
	var canvasA = document.getElementById(wA); // original image
	canvasA.style.border = "1px solid maroon";  
	ctxA = canvasA.getContext("2d");
	var imgA = document.getElementById(wDummyOR);
	canvasA.width = scaledCols;
	canvasA.height = scaledRows;
	ctxA.drawImage(imgA, xoffset, yoffset, scaledCols, scaledRows);

	// ********************
	canvasSN = document.getElementById(wDummySN);
	canvasSN.hidden = true;
	ctxSN = canvasSN.getContext('2d');
	imgDataSN = ctxSN.createImageData(cols, rows);
	pixelsSN  = imgDataSN.data;	

	canvasB = document.getElementById(wB); // noisy image
	canvasB.style.border = "1px solid maroon";  
	ctxB = canvasB.getContext("2d");
	imgB = document.getElementById(wDummySN);
	canvasB.width = scaledCols;
	canvasB.height = scaledRows;
	ctxB.drawImage(imgB, xoffset, yoffset, scaledCols, scaledRows);
	
	// ********************
	canvasRE = document.getElementById(wDummyRE);
	canvasRE.hidden = true;
	ctxRE = canvasRE.getContext('2d');
	imgDataRE = ctxRE.createImageData(cols, rows);
	pixelsRE  = imgDataRE.data;	

	var canvasC = document.getElementById(wC); // restored image
	canvasC.style.border = "1px solid maroon";  
	ctxC = canvasC.getContext("2d");
	imgC = document.getElementById(wDummyRE);
	canvasC.width = scaledCols;
	canvasC.height = scaledRows;
	ctxC.drawImage(imgC, xoffset, yoffset, scaledCols, scaledRows);

	// ********************
	// Caveat Emptor: pixels are in a data format that is CLAMPED to
	// the integer range 0 to 255. Do all processing with "float" and
	// then rescale to this range before writing in pixels.
	
	// In a "real" imaging system there is a certain noise power. That noise
	// appears in all three color channels, in this case as additive noise.
	// That means the SNR in each color channel will be different. I use the
	// green channel to get the SNR that will determine the sigma that will
	// be used in all three channels.
	
	let minVal = Infinity;
	let maxVal = -Infinity;
	let tempVal = 0;
	for (let i = 0; i < pixelsOR.length; i += 4)
		{
		j = i/4;
		pixelsOR[i  ] = SolvayRed[j];		// red
		pixelsOR[i+1] = SolvayGreen[j];	// green
		pixelsOR[i+2] = SolvayBlue[j];	// blue
		pixelsOR[i+3] = 255; 				// alpha
		
		tempVal = SolvayGreen[j]; // for SNR calculation
		if (tempVal < minVal) minVal = tempVal;
		if (tempVal > maxVal) maxVal = tempVal;
		};
		
	dynRange = maxVal - minVal; // needed for SNR calculation above
	ctxOR.putImageData(imgDataOR,xoffset,yoffset);
	ctxA.drawImage(imgA, xoffset, yoffset, scaledCols, scaledRows);
	
	let firstSNR = snrValues.length - 1;

	moveSlider(firstSNR);
	getNoiseAndFilter(firstSNR);
	};

