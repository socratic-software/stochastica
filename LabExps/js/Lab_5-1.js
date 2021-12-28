// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2022
// Licensed under the MIT license.
// Laboratory experiment 5.1
// i.t. young
// 
// ****************************************************************
// Wednesday, 31 July 2019

// globals defined here
var SIMULATION = false;

var z0Data = [];
var z1Data = [];
var x1Data = [];
var x2Data = [];
var y1Data = [];
var y2Data = [];
var p0Data = [];
var p1Data = [];
var p2Data = [];
var q1Data = [];
var q2Data = [];
var zeroes1 = [];
var zeroes2 = [];

var choice = 'Easy';
var sigType = 1; // linearRamp
var samples = 12;

// *****************************************************************
// Functions defined here

function displayData()
	{
	Plotly.react(wA, [x1Plot], DTlayoutTop, noMode);
	Plotly.react(wB, [x2Plot], DTlayoutTop, noMode);
	Plotly.react(wC, [y1Plot], DTlayoutBot, noMode);
	Plotly.react(wD, [y2Plot], DTlayoutBot, noMode);
	};

// *****************************************************************
//
function regenerate()
	{
	generate(choice);
	};

// *****************************************************************
//
function generate(tempChoice)
	{
	choice = tempChoice;
	z0Data = [];
	z1Data = [];
	x1Data = [];
	x2Data = [];
	y1Data = [];
	y2Data = [];
	p0Data = [];
	p1Data = [];
	p2Data = [];
	q1Data = [];
	q2Data = [];
	zeroes1 = [];
	zeroes2 = [];

	if(choice == 'Easy')
		{
		samples = randomInteger(2,6);

		p1Data = uRs(signalChoiceList(samples,sigType));
		z0Data = Array(samples).fill(0);
		z1Data = z0Data;
	
		p2Data = p1Data.slice();
		p1Data = z0Data.concat(p1Data,z1Data);
		for (var i = 0; i < p1Data.length; i++)
			{
			zeroes1[i] = 0;
			x1Data[i] = i - samples;
			};

		z0Data = Array(samples).fill(0);
		p2Data.reverse();
		p2Data = z0Data.concat(p2Data,z1Data);
		for (var i = 0; i < p2Data.length; i++)
			{
			zeroes2[i] = 0;
			x2Data[i] = i - samples;
			};
		}
	else if(choice == 'Difficult')
		{
		samples = randomInteger(2,12);
		sigType = randomInteger(0,7);
		p1Data = uRs(signalChoiceList(samples,sigType));
		z0Data = Array(samples).fill(0);
		z1Data = z0Data;
	
		p2Data = p1Data.slice();
		p1Data = z0Data.concat(p1Data,z1Data);
		for (var i = 0; i < p1Data.length; i++)
			{
			zeroes1[i] = 0;
			x1Data[i] = i - samples;
			};

		z0Data = Array(samples).fill(0);
		p2Data.reverse();
		p2Data = z0Data.concat(p2Data,z1Data);
		for (var i = 0; i < p2Data.length; i++)
			{
			zeroes2[i] = 0;
			x2Data[i] = i - samples;
			};
		}
	else if(choice == 'More_Difficult')
		{
		samples = randomInteger(2,12);
		sigType = randomInteger(0,7);
		p1Data = uRs(signalChoiceList(samples,sigType));
		
		z0Data = Array(samples).fill(0);
		z1Data = z0Data;
		p1Data = z0Data.concat(p1Data,z1Data);
		for (var i = 0; i < p1Data.length; i++)
			{
			zeroes1[i] = 0;
			x1Data[i] = i - samples;
			};

		z0Data = Array(samples).fill(0);
		z1Data = z0Data;
		sigType = randomInteger(0,7);
		p2Data = uRs(signalChoiceList(samples,sigType));
		p2Data = z0Data.concat(p2Data,z1Data);
		for (var i = 0; i < p2Data.length; i++)
			{
			zeroes2[i] = 0;
			x2Data[i] = i - samples;
			};
		}
	else
		{
		throw('generate: Problem with choice');
		return;
		};
	
		x1Plot.x = x1Data;
		x1Plot.y = p1Data;
		x1Plot.error_y.array = zeroes1;
		x1Plot.error_y.arrayminus = p1Data;
	
		x2Plot.x = x2Data;
		x2Plot.y = p2Data;
		x2Plot.error_y.array = zeroes2;
		x2Plot.error_y.arrayminus = p2Data;
	
		convResult = uRs(listConvolve(suR(p1Data), suR(p2Data)));
		corrResult = uRs(listCorrelate(suR(p1Data), suR(p2Data)));

		for (var i = 0; i < convResult.length; i++)
			{
			zeroes1[i] = 0;
			y1Data[i] = i - samples;
			};

		y1Plot.x = y1Data;
		y1Plot.y = convResult;
		y1Plot.error_y.array = zeroes1;
		y1Plot.error_y.arrayminus = convResult;
	
		for (var i = 0; i < corrResult.length; i++)
			{
			zeroes2[i] = 0;
			y2Data[i] = i - samples;
			};

		y2Plot.x = y2Data;
		y2Plot.y = corrResult;
		y2Plot.error_y.array = zeroes2;
		y2Plot.error_y.arrayminus = corrResult;
	
		let tempPlot = null;
		if (randomBinary(0.5) == 0)
			{
			tempPlot = y1Plot;
			y1Plot = y2Plot;
			y2Plot = tempPlot;
			};

		displayData();
	};

// *****************************************************************
//
function prepareLab_5_1( )
	{
	// now we define the layout structures for signals
	DTlayoutTop = cloneObj(layoutDT); // defined in SSPplotting.js
	DTlayoutTop.title = '';
	DTlayoutTop.height = Math.floor(0.8*graphHeight[twoImages]); // special case
	DTlayoutTop.margin.t = 5;
	DTlayoutTop.xaxis2.showgrid = false;
	DTlayoutTop.yaxis2.showgrid = false;

	DTlayoutTop.annotations[1].text = 'n';

	DTlayoutBot = cloneObj(DTlayoutTop); // defined in SSPplotting.js
	DTlayoutBot.xaxis2.ticks = '';
	DTlayoutBot.yaxis2.ticks = '';
	DTlayoutBot.xaxis2.showticklabels = false;
	DTlayoutBot.yaxis2.showticklabels = false;
	DTlayoutBot.annotations[1].text = '';

	x1Plot = cloneObj(DTPlot); // defined in SSPplotting.js
	x1Plot.visible = true;
	x1Plot.marker.size = 2.5*DTmarkerSize;
	x1Plot.error_y.thickness = 2*DTlineThick;
	
	x2Plot = cloneObj(x1Plot); // defined in SSPplotting.js
	y1Plot = cloneObj(x1Plot); // defined in SSPplotting.js
	y2Plot = cloneObj(x1Plot); // defined in SSPplotting.js

	sigType = 1; // linearRamp
	generate(choice);

	//  await interaction};
	};
	
