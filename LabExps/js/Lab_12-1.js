// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// Laboratory experiment 12.1
// i.t. young
// Wednesday, 4 April 2018
// 
// ****************************************************************
// checked Sunday, 22 April 2018
// Thursday, 29 November 2018
//
// test signal synthesized here.
// For the sampling frequency, see: SSPconstants.js
//
// global defined here (for now)
var SIMULATION = false;

var f0 = G3; // ≈(2*7)^2  (see SSPconstants.js)
var freq = f0;
var phase = 0;

var alpha = 16;
lengthMax = alpha*Math.floor(sampFreq/f0); // sampFreq = (2*3*5*7)^2
var newstartSample = 0;
var newstopSample = lengthMax >> 2;
var middleSample = (newstopSample+newstartSample) >> 1;
var maxSegmentT = lengthMax >> 2;
var newSamples = maxSegmentT;
// var sentenceT = 'Synthetic signal x(t) = sin(2<i>\u03c0f<sub>o</sub>t + \u03c6</i>)';
// var sentenceN = 'Synthetic signal x[n] = sin(2<i>\u03c0f<sub>o</sub>n + \u03c6</i>)';

// taken from Lab 10-1.js
var nn = [lengthMax] // number of complex values
var ndim = nn.length; // 1-D signal
var firstIndex = 8;
var lastIndex = 60;
var nLabels = 9;
var freqTicks = [firstIndex];
var freqLabels = [98];
for (var i = 0; i < nLabels; i++)
	{
	freqTicks.push(Math.round(16*(notefactor**(3*i)),-1));
	freqLabels.push(Math.round(f0*(notefactor**(3*i)),-1));
	};
	
function synthesizeData()
	{
	for (var i = 0; i < lengthMax; i++)
		{
		xDataDT[i] = i; // discrete time index
		xDataCT[i] = 1000*i/sampFreq; // continuous time in [ms]
		yData[i] = Math.sin((2*Math.PI*freq*i/sampFreq) + phase);
		zeroes[i] = 0;
		};
	for (var i = 0; i < audioData.length; i++)
		audioData[i] = Math.sin((2*Math.PI*freq*i/sampFreq) + phase);
	
	theName0.fS = sampFreq; // for audio reproduction
	theName0.data = ampNormalize(audioData); // for audio reproduction
	createWavBlob(audioNum, theNames[audioNum].data);
	
	let rSpect = fft(suR(yData), nn, ndim, FORWARD); // signal spectrum
	// global, normalized, graphics format
	rpsd = takeAtoB(uRs(ampNormalize(abssq(rSpect))),0,yData.length >> 1);
	};
	
function displayData()
	{
	ContTPlot.x = takeAtoB(xDataCT,newstartSample,newstopSample);
	ContTPlot.y = takeAtoB(yData,newstartSample,newstopSample);
	DiscTPlot.x = takeAtoB(xDataDT,newstartSample,newstopSample);
	DiscTPlot.y = ContTPlot.y;
	DiscTPlot.error_y.array = takeAtoB(zeroes,newstartSample,newstopSample);
	DiscTPlot.error_y.arrayminus = DiscTPlot.y;
	
	psdPlot.x = takeAtoB(xDataDT,firstIndex,lastIndex);
	psdPlot.y = takeAtoB(rpsd,firstIndex,lastIndex);
	psdPlot.error_y.array = takeAtoB(zeroes,firstIndex,lastIndex);
	psdPlot.error_y.arrayminus = psdPlot.y;
	
	layoutPSD.xaxis2.tickvals = freqTicks;
	layoutPSD.xaxis2.ticktext = freqLabels;

	var sigPlot = ContTPlot;
	var layoutSig = CTlayout;
	plotList[0] = [wA, [sigPlot], layoutSig, noMode];
	plotList[1] = [wB, [psdPlot], layoutPSD, noMode];
	for (var j = 0; j < plotList.length; j++)
		{
		Plotly.react (
			plotList[j][0], // which window
			plotList[j][1], // the plot data
			plotList[j][2], // the plot layout
			plotList[j][3] // no mode
			);
		};
	};
	
function prepareLab_12_1( )
	{
	audioNum = 0;
	acquired[audioNum] = true;
	
	thisDuration = 1000*lengthMax/sampFreq; // defined in SSPmedia.js
	myDuration[audioNum] = thisDuration;

	// don't blink
	for (var i = 0; i < nMics; i++)
		{
		document.getElementById('animX'+i).style.animationDuration  = "0s";
		document.getElementById('animX'+i).style.animationIterationCount = "infinite";
		document.getElementById('animX'+i).style.backgroundColor = "white";
		document.getElementById('mic_'+i).style = 'filter:hue-rotate(0deg);';
		};
	
	document.querySelector('#sampF').value = d1round(sampFreq/1000);
	document.querySelector('#totSamp1').value = lengthMax;

	xDataDT = Array(lengthMax);
	xDataCT = Array(lengthMax);
	yData = Array(lengthMax);
	zeroes = Array(lengthMax);
	audioData = Array(sampFreq); // 1 second of audio data to listen to
	
	ContTPlot = cloneObj(CTPlot); // defined in SSPplotting.js
	DiscTPlot = cloneObj(DTPlot); // defined in SSPplotting.js
	CTlayout = cloneObj(layoutCT); // defined in SSPplotting.js
	DTlayout = cloneObj(layoutDT); // defined in SSPplotting.js

	psdPlot = cloneObj(DTPlot); // Power spectrum graph
	layoutPSD = cloneObj(layoutDT); // Power spectrum layout

	ContTPlot.visible = true;
	DiscTPlot.visible = true;
	
	psdPlot.visible = true;
	psdPlot.marker.color = japanRed1;
	psdPlot.marker.size = 5;
	
	graphMargins();
	CTlayout.height *= verticalScale;
	CTlayout.title = '';
	CTlayout.margin.t = margins.top;
	CTlayout.margin.b = margins.bottom;
	CTlayout.margin.l = setLeftMargin(); // orientation & platform check;
	CTlayout.margin.r = CTlayout.margin.l;

	CTlayout.annotations[0].x = 0;
	CTlayout.annotations[0].xanchor = 'left';
	CTlayout.annotations[0].y = 1.025;
	CTlayout.annotations[0].yanchor = 'bottom';
	CTlayout.annotations[0].text = '<i>x(t)</i> = sin(2<i>\u03c0f<sub>o</sub>t + \u03c6</i>)';
	CTlayout.annotations[0].font.family ='Georgia';

	CTlayout.annotations[1].text = 't [ms]';

	DTlayout.title = '';
	DTlayout.width =  CTlayout.width;
	DTlayout.height = CTlayout.height;
	DTlayout.margin.t = CTlayout.margin.t;
	DTlayout.margin.b = CTlayout.margin.b;
	DTlayout.margin.l = CTlayout.margin.l;
	DTlayout.margin.r = DTlayout.margin.l;
	DTlayout.font.family = CTlayout.font.family;
	DTlayout.font.size = CTlayout.font.size;

	DTlayout.annotations[0].x = CTlayout.annotations[0].x;
	DTlayout.annotations[0].xanchor = CTlayout.annotations[0].xanchor;
	DTlayout.annotations[0].y = CTlayout.annotations[0].y;
	DTlayout.annotations[0].yanchor = CTlayout.annotations[0].yanchor;
	DTlayout.annotations[0].text = '<i>x[n]</i> = sin(2<i>\u03c0f<sub>o</sub>nT + \u03c6</i>)';
	DTlayout.annotations[0].font.family = CTlayout.annotations[0].font.family;

	DTlayout.annotations[1].y = CTlayout.annotations[1].y;
	DTlayout.annotations[1].yanchor = CTlayout.annotations[1].yanchor;
	DTlayout.annotations[1].text = 'n';

	layoutPSD.title = '';
	layoutPSD.width = CTlayout.width;
	layoutPSD.height = CTlayout.height;
	layoutPSD.margin.t = CTlayout.margin.t;
	layoutPSD.margin.b = CTlayout.margin.b;
	layoutPSD.margin.l = CTlayout.margin.l;
	layoutPSD.margin.r = layoutPSD.margin.l;
	layoutPSD.xaxis2.tickmode = "array";
	layoutPSD.xaxis2.tickvals = freqTicks;
	layoutPSD.xaxis2.ticktext = freqLabels;
	layoutPSD.font.family = CTlayout.font.family;
	layoutPSD.font.size = CTlayout.font.size;
	
	layoutPSD.yaxis2.type = 'lin';
	layoutPSD.yaxis2.showgrid = true;
	layoutPSD.yaxis2.gridwidth = 1;
	layoutPSD.yaxis2.gridcolor = 'darkgrey';
	layoutPSD.yaxis2.showgrid = true;
	layoutPSD.yaxis2.tickmode = 'array';
	layoutPSD.yaxis2.tickvals = [0, 0.25, 0.5, 0.75, 1];

	layoutPSD.annotations[0].x = 0;
	layoutPSD.annotations[0].xanchor = 'left';
	layoutPSD.annotations[0].y = CTlayout.annotations[0].y;
	layoutPSD.annotations[0].yanchor = CTlayout.annotations[0].yanchor;
	layoutPSD.annotations[0].text = '<i>Normalized S<sub>xx</sub>(2πf)</i>';

	layoutPSD.annotations[1].y = CTlayout.annotations[1].y;
	layoutPSD.annotations[1].yanchor = CTlayout.annotations[1].yanchor;
	layoutPSD.annotations[1].text = 'f  [Hz]';

	synthesizeData();
	displayData();
	};

// ***************************************************************** \\
// 

function sliderChoices(val,target)
	{
	var deltaN = 0; // change in number of samples (zoom)
	var deltaMid = 0; // change in center position (pan)
	var newMiddle = 0;
	
	if (target === 'Z') // Zoom
		{
		newSamples = maxSegmentT >> val;
		if (oddQ(newSamples)) newSamples--; // make it even
		document.querySelector('#placeZ').value = "N = "+newSamples+" Samples";
		deltaN = newSamples >> 1;
		if (val == 0)
			{
			middleSample = lengthMax >> 3; // a very special case
			document.querySelector('#pan').value = middleSample;
			}
	
		newstartSample = middleSample - deltaN;
		newstopSample = middleSample + deltaN;
	
		if (newstartSample < 0)
			{
			newstartSample = 0;
			newstopSample = newstartSample + newSamples;
			};
		if (newstopSample > maxSegmentT)
			{
			newstopSample = maxSegmentT;
			newstartSample = newstopSample - newSamples;
			};
		middleSample = (newstopSample+newstartSample) >> 1;
		document.querySelector('#placePa1').value =
			d1round(1000*newstartSample/sampFreq);
		document.querySelector('#placePa2').value =
			d1round(1000*newstopSample/sampFreq);
		}
		
	else if (target === 'Pa') // Pan
		{
		newMiddle = val;
		deltaMid = newMiddle - middleSample; 
		newstartSample += deltaMid;
		newstopSample += deltaMid;
	
		if (newstartSample < 0)
			{
			newstartSample = 0;
			newstopSample = newstartSample + newSamples;
			}
		else if (newstopSample > maxSegmentT)
			{
			newstopSample = maxSegmentT;
			newstartSample = newstopSample - newSamples;
			};

		document.querySelector('#placePa1').value =
			d1round(1000*newstartSample/sampFreq);
		document.querySelector('#placePa2').value =
			d1round(1000*newstopSample/sampFreq);
		middleSample = (newstopSample+newstartSample) >> 1;
		}
		
	else if (target === 'F') // Frequency
		{
		let index = val;
		freq = f0*(notefactor**index);
		document.querySelector('#placeF').value =
		" "+d2round(freq)+" Hz";
		synthesizeData();
		displayData();
		}
		
	else if (target === 'Ph') // Phase
		{
		let phiDeg = val;
		phase = (phiDeg/180)*Math.PI
		document.querySelector('#placePh').value =
			"\u03c6 = "+phiDeg+"º = "+d2round(phase)+" radians";
		synthesizeData();
		displayData();
		}
		
	else 
		throw("Sliders");
	
	if (newSamples == maxSegmentT)
		document.querySelector('#placeZ').value = "N = "+maxSegmentT+" Samples";
	
	let xDataNew = Array(newSamples);
	let yDataNew = Array(newSamples);
	let zeroesNew = Array(newSamples);

	for (var i = 0; i < newSamples; i++)
		{
		zeroesNew[i] = 0;
		if (newSamples <= maxDTdisplay)
			xDataNew[i] = xDataDT[i+newstartSample]
		else
			xDataNew[i] = xDataCT[i+newstartSample];
		yDataNew[i] = yData[i+newstartSample];
		};

	if (xDataNew.length <= maxDTdisplay)
		{
		DiscTPlot.x = xDataNew;
		DiscTPlot.y = yDataNew;
		DiscTPlot.error_y.array = zeroesNew;
		DiscTPlot.error_y.arrayminus = yDataNew;
		if (xDataNew.length > changeDTparams)
			{
			DiscTPlot.error_y.thickness = DTlineThick;
			DiscTPlot.marker.size = 3*DTlineThick;
			}
		else
			{
			DiscTPlot.error_y.thickness = 2.1*DTlineThick;
			DiscTPlot.marker.size = 5.3*DTlineThick;
			};
		sigPlot = DiscTPlot;
		layoutSig = DTlayout;
		}
	else
		{
		ContTPlot.x = xDataNew;
		ContTPlot.y = yDataNew;
		sigPlot = ContTPlot;
		layoutSig = CTlayout;
		};
	plotList[0] = [wA, [sigPlot], layoutSig, noMode];
	plotList[1] = [wB, [psdPlot], layoutPSD, noMode];
	for (var j = 0; j < plotList.length; j++)
		{
		Plotly.react (
			plotList[j][0], // which window
			plotList[j][1], // the plot data
			plotList[j][2], // the plot layout
			plotList[j][3] // no mode
			);
		};
	};
