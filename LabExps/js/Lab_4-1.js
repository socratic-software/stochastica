// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2022
// Licensed under the MIT license.
// Laboratory experiment 6.8
// i.t. young
// Thursday, 28 September 2017
// 
// ****************************************************************
// checked Thursday, 5 October 2017

// globals defined here (for now)
var cols = 5;
var coins, mytable;
var firstRun = true;

var startp = 0.4;
var p = startp;
var randV = 0;
var nOnes = 0;
var estpHeads = 0;
var n = 7;

var xPos = Array(n);
var flips = Array(n);
var zeroes = Array(n);

var plotDT = cloneObj(DTPlot); // template in SSPplotting.js
var DTlayout = cloneObj(layoutDT); // template in SSPplotting.js
	DTlayout.margin.t = 20;
	DTlayout.margin.l = 50;
var plotBar = cloneObj(BarPlot); // template in SSPplotting.js
var Barlayout = cloneObj(layoutBar); // template in SSPplotting.js
	Barlayout.title = '';
	Barlayout.margin.t = 20;
	Barlayout.margin.l = 50;

var str1 = 'With N = ';
var str2 = ' coin flips and p(H) = ';
var str3 = ',<br />the estimated probability of Heads = ';
var str4 = 'p<sub>est</sub>(H) = ';

var markersize = DTmarkerSize;
var lineThick = DTlineThick;

// *****************************************************************
// stochastic signal synthesized here.

function prepareLab_4_1( )
	{
	for (var i = 0; i < n; i++)
		{
		randV = randomBinary(p); // the coin flip --> 0 or 1
		if (randV == 1) nOnes++; // Heads = 1, count 'em
		xPos[i] = i;
		flips[i] = 2*randV-1;
		zeroes[i] = 0;
		};
	
	var nZeroes = n-nOnes; // the number of Tails
	var barData = [nOnes, nZeroes];

	estpHeads = d3round(nOnes/n);

	if (n <= 50)
		{
		markersize = 1.8*DTmarkerSize;
		lineThick = 2*DTlineThick;
		};

	document.querySelector('#placeN').value = n;
	document.querySelector('#placeP').value = p;
	document.querySelector('#placeH').value = estpHeads;

	plotDT.visible = true;
	plotDT.marker.size = markersize;
	plotDT.error_y.thickness = lineThick;
	plotDT.error_y.array = zeroes;
	plotDT.error_y.arrayminus = flips;
	plotDT.x = xPos.slice(0,n);
	plotDT.y = flips.slice(0,n);

	DTlayout.title = '';
	DTlayout.font.size = 0.8*myTitleSize;

	DTlayout.xaxis2.showline = false;
	DTlayout.xaxis2.showticklabels = false;
	DTlayout.xaxis2.showspikes = false;
	DTlayout.xaxis2.ticks = '';
	DTlayout.xaxis2.autotick = false;

	DTlayout.yaxis2.tickvals = [-1, 0, +1];
	DTlayout.yaxis2.ticktext = ['–1', '0', '+1'];
	DTlayout.yaxis2.range = [-1.05, +1.05];

	plotBar.visible = true;
	plotBar.text = barData;
	plotBar.y = barData;
	Barlayout.width = Math.floor(0.95*graphWidth[twoImages]); // special case
	Barlayout.font.size = DTlayout.font.size;
	
	Plotly.react(wB, [plotDT], DTlayout, noMode);
	Plotly.react(wC, [plotBar], Barlayout, noMode);
	
	genCoins(flips,firstRun);
	};

// ***************************************************************** \\

function flipCoins(val,target)
	{
	if (target === 'prob') // probability of Heads, p(H)
		{
		p = +val; // convert string to number
		}
	else if (target === 'N') // number of coin flips
		{
		n = +val; // convert string to number
		if (n <= 25) cols = 5
		else if (n <= 49) cols = 7
		else cols = 9;
		}
	else 
		throw('Houston, we have a problem in flipCoins.');

	xPos = Array(n);
	flips = Array(n);
	zeroes = Array(n);
	nOnes = 0;
	
	for (var i = 0; i < n; i++)
		{
		randV = randomBinary(p); // the coin flip --> 0 or 1
		if (randV == 1) nOnes++; // Heads = 1, count 'em
		xPos[i] = i;
		flips[i] = 2*randV-1;
		zeroes[i] = 0;
		};

	nZeroes = n-nOnes; // the number of Tails
	barData = [nOnes, nZeroes];
	
	estpHeads = d3round(nOnes/n);

	if (n <= 50)
		{
		markersize = 1.8*DTmarkerSize;
		lineThick = 2*DTlineThick;
		}
	else
		{
		markersize = DTmarkerSize;
		lineThick = DTlineThick;
		};
	
	document.querySelector('#placeN').value = n;
	document.querySelector('#placeP').value = p;
	document.querySelector('#placeH').value = estpHeads;
	
	plotDT.x = xPos.slice(0,n);
	plotDT.y = flips.slice(0,n);
	plotDT.marker.size = markersize;
	plotDT.error_y.array = zeroes;
	plotDT.error_y.arrayminus = flips;
	plotDT.error_y.thickness = lineThick;
	
	plotBar.y = barData;
	plotBar.text = barData;
		
	Plotly.react(wB, [plotDT], DTlayout, noMode);
	Plotly.react(wC, [plotBar], Barlayout, noMode);
	
	firstRun = false;
	genCoins(flips,firstRun);
	};

// ***************************************************************** \\
// For dynamic removal of an element, e.g. table
// Taken from <https://stackoverflow.com/questions/3387427/remove-element-by-id>

Element.prototype.remove = function()
	{ this.parentElement.removeChild(this); }

NodeList.prototype.remove = HTMLCollection.prototype.remove = function()
	{
	for(var i = this.length - 1; i >= 0; i--)
		{
		if(this[i] && this[i].parentElement)
			{
			this[i].parentElement.removeChild(this[i]);
			}
		}
	}

// ***************************************************************** \\
// For dynamic construction of a table
function genCoins(flips,firstRun)
	{
	// you can't remove something that doesn't exist
	if (!firstRun) document.getElementsByClassName("manyCoins").remove();
	// get the reference for the body
	var mybody = document.getElementById(wD);
	// creates <table> and <tbody> elements
	mytable = document.createElement("table");
	mytable.setAttribute("class", "manyCoins");
	mytablebody = document.createElement("tbody");
	
	let rows = cols;
	// the numbers 1.4, 300 & 464 are graphic, cosmetic, fudge factors
	var totalWidth = Math.floor(0.55*graphWidth[twoImages]); // special case
	var deltaX = Math.floor(totalWidth/cols);
	var deltaY = deltaX;
	// creating all cells
	for(var j = 0; j < rows; j++)
		{
		// creates a <tr> element
		mycurrent_row = document.createElement("tr");
		for(var i = 0; i < cols; i++)
			{
			// creates a <td> element
			mycurrent_cell = document.createElement("td");
			// creates an image element
			coins = document.createElement("IMG");
			if ((j*cols + i) < flips.length)
				{
				if (flips[j*cols + i] == 1)
					coins.setAttribute("src", "../images/Euro_Heads.png")
				else
					coins.setAttribute("src", "../images/Euro_Tails.png");
				}
			else
				{
					coins.setAttribute("src", "../images/blankCoin.png");
				};
			coins.setAttribute("width", deltaX);
			coins.setAttribute("height", deltaY);
			coins.setAttribute("alt", "Coin images");
			// appends the image we created into the cell <td>
			mycurrent_cell.appendChild(coins);
			// appends the cell <td> into the row <tr>
			mycurrent_row.appendChild(mycurrent_cell);
			};
		// appends the row <tr> into <tbody>
		mytablebody.appendChild(mycurrent_row);
		};
	// appends <tbody> into <table>
	mytable.appendChild(mytablebody);
	// appends <table> into <body class="bodyDisplayLabs">
	mybody.appendChild(mytable);
	};


