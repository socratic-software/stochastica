// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2022
// Licensed under the MIT license.
// Laboratory experiment 4.2
// i.t. young
// Thursday, 28 September 2017
// 
// ****************************************************************
// checked Thursday, 5 October 2017

// global defined here (for now)
var rows = Math.pow(2,1);
var cols = rows; // square picture
var imageData = createArray(rows,cols);

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
	layoutHisto.margin.b = 95;
	layoutHisto.title = '';
	layoutHisto.font.size = Imagelayout.font.size;
	layoutHisto.bargap = 0;
	layoutHisto.annotations[0].x = 0;
	layoutHisto.annotations[0].y = 1.05;
	layoutHisto.annotations[0].yanchor = 'bottom';

var histCumulative = false;
var histnormStyle = '';
var randProcess = 1; // initialize

// *****************************************************************
function displayStuff( )
	{
	plotImage.z = imageData;
	imageHisto.histnorm = histnormStyle;
	imageHisto.cumulative.enabled = histCumulative;
	imageHisto.x = flatten(imageData);

	Plotly.newPlot(wA, [plotImage], Imagelayout, noMode);
	Plotly.react(wB, [imageHisto], layoutHisto, noMode);
	};

// *****************************************************************
// stochastic signal synthesized here.
function prepareLab_4_2( )
	{
	plotImage.visible = true;

	Imagelayout.title = '';
	Imagelayout.font.size = 0.8*myTitleSize;
	Imagelayout.xaxis7.showline = true;
	Imagelayout.xaxis7.linewidth = 1;
	Imagelayout.xaxis7.mirror = true;
	Imagelayout.xaxis7.ticks = '';
	
	Imagelayout.yaxis7.showline = true;
	Imagelayout.yaxis7.mirror = true;
	Imagelayout.yaxis7.ticks = '';
	Imagelayout.height = Math.floor(1.3*graphHeight[twoImages]); // special case
	
	imageHisto.x = flatten(imageData);
	layoutHisto.xaxis3.range = [0,256];
	
	layoutHisto.annotations[0].text = '<i>n</i>(<i>x</i>)';
	layoutHisto.annotations[1].text = '<i>x</i>';
	
	for (var i = 0; i < rows; i++)
		for (var j = 0; j < cols; j++)
			imageData[i][j] = randomInteger(0,255);

	displayStuff( );
	};

// ***************************************************************** \\
// choose which type of graphic display for random process

function distributionDisp(val,target)
	{
	if (target === 'N')
		{
		rows = Math.pow(2,val);
		cols = rows;
		imageData = createArray(rows,cols);
		for (var i = 0; i < rows; i++)
			for (var j = 0; j < cols; j++)
				imageData[i][j] = chooseProcess(randProcess);
		document.querySelector('#clickN').value = rows+" x "+cols+" pixels";
		}
	else if (target === 'Cnt')
		{
		histCumulative = false;
		histnormStyle = '';
		layoutHisto.annotations[0].text = '<i>n</i>(<i>x</i>)';
		layoutHisto.annotations[1].text = ' <i>x</i>';
		}
	else if (target === 'Prob')
		{
		histCumulative = false;
		histnormStyle = 'probability density';
		layoutHisto.annotations[0].text = '<i>p</i>(<i>x</i>)\u0394<i>x</i>';
		layoutHisto.annotations[1].text = ' <i>x</i>';
		}
	else if (target === 'CDF')
		{
		histCumulative = true;
		histnormStyle = 'probability';
		layoutHisto.annotations[0].text = '<i>P</i>(<i>x</i><<i>X</i>)';
		layoutHisto.annotations[1].text = ' <i>X</i>';
		}
	else 
		throw('Houston, we have a problem in distributionDisp.');

	displayStuff( );
	};

// ***************************************************************** \\
// choose which random process will be used

function chooseProcess(process)
	{
	var mean = 128;
	var sigma = mean/4;
	switch(process)
		{
		case 1:
			return randomGaussian(mean,sigma);
			break;
		case 2:
			return randomReal(0,255);
			break;
		case 3:
			return 255*randomBinary(0.4);
			break;
		case 4:
			return randomRayleigh(0.9*mean*Math.sqrt(2/Math.PI));
			break;
		case 5:
			return randomLaplace(mean,sigma*Math.SQRT1_2);
			break;
		case 6:
			return randomTriangular(0,255,110);
			break;
		case 7:
			return randomPoisson(mean);
			break;
		};
	};

// ***************************************************************** \\
// fill image with chosen random process

function fillImage(target)
	{
	imageHisto.marker.line.width = thinHistoBar; // normal width
	randProcess = +target; // convert string to number

	for (var i = 0; i < rows; i++)
		for (var j = 0; j < cols; j++)
			imageData[i][j] = chooseProcess(randProcess); 

	displayStuff( );
	};

