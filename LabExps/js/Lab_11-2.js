// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// Laboratory experiment 11.2
// i.t. young
// Thursday, 15 February 2018
// 
// ****************************************************************
// checked Wednesday, 28 February 2018

// global defined here (for now)
var nDarts = [1, 3, 7, 11, 15, 23, 31, 47, 101]; // global
var thisDarts = 1; // global & initialize
var target = 'Jack'; // global & initialize
var randProcess = 1; // global & initialize
var locDarts = []; // global

// *****************************************************************
// Functions defined here

function updateColorCanvas(imageName) // imagename = wB
	{
	let x0 = 0;
	let y0 = 0;
	
	// this erases the old, used image with a new clean version
	for (let i = 0; i < pixelsC.length; i += 4)
		{
		j = i/4;
		pixelsC[i  ] = DartBoardRed[j];		// red
		pixelsC[i+1] = DartBoardGreen[j];	// green
		pixelsC[i+2] = DartBoardBlue[j];	// blue
		pixelsC[i+3] = 255; 				// alpha
		};
	ctxDumC.putImageData(imgDataC,xOffset,yOffset);
	ctxC.clearRect(0, 0, cols, rows);
	ctxC.drawImage(imgC, xOffset, yOffset, cols, rows, xCentered, yCentered, xReducedSize, yReducedSize);
	
	for (var i = 0; i < thisDarts; i++)
		{
		x0 = Math.floor(cols*(1+locDarts[i][0])/2);
		y0 = Math.floor(cols*(1-locDarts[i][1])/2);
		drawDart(x0,y0);
		};
	};
	
function drawDart(x,y)
	{
	// recalculate for reduced target size
	let xT = Math.floor(dartScale*x + xCentered);
	let yT = Math.floor(dartScale*y + yCentered);
	
// 	ctxC.shadowColor="gray";
// 	ctxC.shadowOffsetX=0;
// 	ctxC.shadowOffsetY=5;

	ctxC.shadowBlur=4;
	ctxC.beginPath(); // dart tip
	ctxC.moveTo(xT, yT); // starting point
	ctxC.lineTo(xT+3, yT-5);
	ctxC.lineTo(xT+5, yT-3);
	ctxC.closePath();
	ctxC.lineWidth = 1;
	ctxC.fillStyle="#737373";
	ctxC.fill();

	ctxC.shadowBlur=10;
	ctxC.beginPath(); // dart body 1
	ctxC.moveTo(xT+4, yT-4); // starting point
	var gradient=ctxC.createLinearGradient(xT+4,yT-4,xT+10, yT-10);
	gradient.addColorStop("0","red");
	gradient.addColorStop("0.1","silver");
	gradient.addColorStop("0.4","silver");
	gradient.addColorStop("0.5","blue");
	gradient.addColorStop("0.5","silver");
	gradient.addColorStop("0.85","silver");
	gradient.addColorStop("1.0","red");
	ctxC.strokeStyle=gradient;
	ctxC.lineWidth = 4;
	ctxC.lineTo(xT+10, yT-10);
	ctxC.closePath();
	ctxC.stroke();
	
	ctxC.shadowBlur=15;
	ctxC.beginPath(); // dart body 2
	ctxC.moveTo(xT+11,yT-11); // starting point
	ctxC.strokeStyle='#8c8c8c'; // w3schools.com/colors/colors_x11.asp
	ctxC.lineWidth = 2;
	ctxC.lineTo(xT+15, yT-15);
	ctxC.closePath();
	ctxC.stroke();
	
	ctxC.shadowBlur=20;
	let startXWing = xT+13;
	let startYWing = yT-13;
	ctxC.beginPath(); // dart wing
	ctxC.moveTo(startXWing, startYWing); // starting point
	ctxC.lineTo(startXWing+0, startYWing-5);
	ctxC.lineTo(startXWing+3, startYWing-8);
	ctxC.lineTo(startXWing+4, startYWing-7);
	ctxC.lineTo(startXWing+4, startYWing-4);
	ctxC.lineTo(startXWing+7, startYWing-4);
	ctxC.lineTo(startXWing+8, startYWing-3);
	ctxC.lineTo(startXWing+5, startYWing-0);
	ctxC.closePath();
	ctxC.lineWidth = 1;
	ctxC.fillStyle="#003d99";
	ctxC.fill();
	
	};

// Choose number of darts with slider
function moveDartSlider(val)
	{
	thisDarts = nDarts[val];
	dartLabel = (thisDarts == 1) ? ' dart' : ' darts';
	document.querySelector('#clickN').value = 'N = '+thisDarts+dartLabel;
	};

function distributionDisp(val)
	{
	thisDarts = nDarts[val];
	let dartLabel = (thisDarts == 1) ? ' dart' : ' darts';
	document.querySelector('#clickN').value = 'N = '+thisDarts+dartLabel;
	throwDarts(target);
	};

function throwDarts(val)
	{
	locDarts = Array(thisDarts);
	target = val;
	if (target === 'Jack') randProcess = 1;
	else if (target === 'Tobin') randProcess = 2;
	else if (target === 'Casey') randProcess = 3;
	else if (target === 'Yael') randProcess = 4;
	else if (target === 'Jamie') randProcess = 5;
	else if (target === 'Johanna') randProcess = 6;
	else throw('Houston, we have a problem in throwDarts.');;
	
	for (var i = 0; i < thisDarts; i++)
		locDarts[i] = chooseProcess(randProcess);

	updateColorCanvas(wB);
	};

// ***************************************************************** \\
// choose which random process will be used

function chooseProcess(process)
	{
	let R = 1.0;
	let r = 0;
	let theta = 0; // with respect to horizontal axis
	let minTheta = -Math.PI;
	let maxTheta = Math.PI;
	let xShift = 0.2*dartScale;
	let yShift = -0.15*dartScale;
	let x = 0;
	let y = 0;
	
	switch(process)
		{
		case 1:
			r =  randomReal(0.0, R);
			theta =  randomReal(minTheta, maxTheta);
			break;
		case 2:
			r =  randomReal(0.0, R/3);
			theta =  randomReal(minTheta, maxTheta);
			break;
		case 3:
			r =  randomRayleigh(0.05) + 0.3;
			r = (r > R) ? R : r;
			theta =  randomReal(minTheta + Math.PI/3, maxTheta);
			break;
		case 4:
			r =  randomRayleigh(0.1) + 0.3;
			r = (r > R) ? R : r;
			theta =  randomReal(minTheta, maxTheta);
			break;
		case 5:
			r =  Math.abs(randomGaussian(0.0, R/4));
			r = (r > R) ? R : r;
			theta =  randomReal(minTheta, maxTheta);
			break;
		case 6:
			r =  Math.abs(randomExponential(R/8));
			r = (r > R) ? R : r;
			theta =  randomReal(minTheta, maxTheta);
			break;
		};
	if ( process == 2 || process == 6)
		{
		x = r*Math.cos(theta) + xShift;
		y = r*Math.sin(theta) - yShift;
		}
	else
		{
		x = r*Math.cos(theta);
		y = r*Math.sin(theta);
		};
		
	return [x, y];
	};

// ***************************************************************** \\
// start here

function prepareLab_11_2( )
	{
	rows = DartBoardColor.rows; // global
	cols = DartBoardColor.cols; // global
	dartScale = 0.90;
	xReducedSize = Math.floor(dartScale*cols);
	yReducedSize = Math.floor(dartScale*rows);
	xCentered = Math.floor((1 - dartScale)*cols/2);
	yCentered = 0;

	DartBoardRed = DartBoardColor.data1[0];
	DartBoardGreen = DartBoardColor.data1[1];
	DartBoardBlue = DartBoardColor.data1[2];

	// set up dummy displays before going to getTemplate
	canvasDumC = document.getElementById(wA); // global
	canvasDumC.hidden = true;
	ctxDumC = canvasDumC.getContext('2d'); // global
	imgDataC = ctxDumC.createImageData(cols, rows);
		
	// Caveat Emptor: pixels are in a data format that is CLAMPED to
	// the integer range 0 to 255. Do all processing with "float" and
	// then rescale to this range before writing in pixels.
	pixelsC  = imgDataC.data;
	for (let i = 0; i < pixelsC.length; i += 4)
		{
		j = i/4;
		pixelsC[i  ] = DartBoardRed[j];		// red
		pixelsC[i+1] = DartBoardGreen[j];	// green
		pixelsC[i+2] = DartBoardBlue[j];	// blue
		pixelsC[i+3] = 255; 				// alpha
		};
	
	xOffset = 0;
	yOffset = 0;
	ctxDumC.putImageData(imgDataC,xOffset,yOffset);

	var canvasC = document.getElementById(wB);
	canvasC.style.border = "0px solid blue";  
	ctxC = canvasC.getContext("2d");
	imgC = document.getElementById(wA);
	ctxC.clearRect(0, 0, cols, rows);
	ctxC.drawImage(imgC, xOffset, yOffset, cols, rows, xCentered, yCentered, xReducedSize, yReducedSize);

	throwDarts(target);
	};

// ***************************************************************** \\
