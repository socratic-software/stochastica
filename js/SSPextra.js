"use strict"

// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// ****************************************************************
// These procedures / subroutines / functions are used by the iSSP textbook
// They will presumably be loaded with every html file
// 

// ********************************************************** \\
// The following are used to support localStorage
// ity Thursday, 14 January 2021

	const byteSize = str => new Blob([str]).size;
	const quote = "'"; // quote+6+quote = '6'

// ********************************************************** \\
// The uses resizes the window. If change is in either direction
// greater than "thresh", the window is redrawn.
// ity Friday, 9 October 2020

var oldWinW = window.innerWidth;
var oldWinH = window.innerHeight;
var winW = oldWinW;
var winH = oldWinH;
var resizeThresh = 0.2 // 20% change in height or width

function resizeWindow() 
	{
	setTimeout(function()
		{ 
		winW = window.innerWidth;
		winH = window.innerHeight;
		let deltaW = Math.abs((winW-oldWinW)/oldWinW); // percentage change
		let deltaH = Math.abs((winH-oldWinH)/oldWinH); // percentage change
		oldWinW = winW;
		oldWinH = winH;
		// completely restart this page after resize
		if ( deltaW > resizeThresh || deltaH > resizeThresh )
			location.replace(window.location.href); 
		}, 1000);
	};

// ********************************************************** \\
// The following rewinds (or preloads) a video clip
// ity Wednesday, 19 December 2018

function rewind()
	{
	'use strict';

	var mediaElement = document.getElementById("theVideo"); 
	mediaElement.pause(); 
	mediaElement.currentTime = 0;
	mediaElement.load();
	};
	
function preload()
	{
	'use strict';

	var mediaElement = document.getElementById("theVideo"); 
	mediaElement.pause(); 
	mediaElement.load();
	};

// ********************************************************** \\
// The following is to determine the mobile operating system.
// This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
// and @returns {String}
// Example:
// 		let answer = getMobileOperatingSystem();
// 		alert('OS = '+answer);

function getMobileOperatingSystem() {
	'use strict';

	var userAgent = navigator.userAgent || navigator.vendor || window.opera;

	// Windows Phone must come first because its UA also contains "Android"
	if (/windows phone/i.test(userAgent)) {
		return "Windows Phone";
	}
	else if (/android/i.test(userAgent)) {
		return "Android";
	}
	// iOS detection from: http://stackoverflow.com/a/9039885/177710
	else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
		return "iOS";
	}
	else return "unknown";
	};
	
// function getPlatform() {
function getPlatform() {
	'use strict';

	var platform = ["Win32", "Android", "iOS", "MacIntel"];

	for (var i = 0; i < platform.length; i++)
		{
		if (navigator.platform.indexOf(platform[i]) > -1)
			{
			return platform[i];
			}
		}
	return "other";
	};
	

// ********************************************************** \\
// The following makes it possible for one lab script to call another through radio buttons
// Here is an example (as part of a table):

	// 		<td><label class="container">a
	// 			<input type="radio" checked="checked" name="unique" id="A" 
	// 				onclick="nextPage('A','Lab_6.8a.html')">
	// 			<span class="checkmark"></span>
	// 			</label></td>
	// 		<td><label class="container">b
	// 			<input type="radio" name="unique" id="B" 
	// 				onclick="nextPage('A','Lab_6.8b.html')">
	// 			<span class="checkmark"></span>
	// 			</label></td>

// previous = current page (e.g. 'A') & next = URL of next page (e.g. 'Lab_6.8b.html')

function nextPage(previous, next )
	{
	'use strict';

	// previous = false = 0, button no radio button -> nothing to uncheck
	if (previous != 0) document.getElementById(previous).checked = false;
	window.open(next, "_self");
	};

// ********************************************************** \\
// The following makes it possible to react to an invisible button and clean house
function jumpToButton(location)
	{
	'use strict';

	// Elvis is leaving the building (DOM)
	if (typeof nPlays !== 'undefined')
		for (var i = 0; i < nPlays; i++)
			{
			if (myAudio[i] !== null) myAudio[i].remove();
			if (objectURL[i] !== null) url.revokeObjectURL(objectURL[i]);
			};
			
	if (theNames.length > 0)
		for (var i = 0; i < theNames.length; i++) theNames[i].data = [];
	
	encoder = null;
	sessionStorage.clear();
	
	// local = false = 0, jump outside the page (DOM) but nothing to uncheck
	nextPage(0,location)
	};

// ********************************************************** \\
// The following makes it possible to determine the orientation of the device
function windowOrientation()
	{
	'use strict';

	// see http://www.williammalone.com/articles/html5-javascript-ios-orientation/
	if (Math.abs(window.orientation) === 90)
		{
		// Landscape
		return 'Landscape';
		}
	else
		{
		// Portrait
		return 'Portrait';
		};
	};

// **************************************************************
function readDeviceOrientation()
	{
	'use strict';

	let temp = null;
	if (Math.abs(window.orientation) === 90)
		temp = 'Landscape'
	else
		temp = 'Portrait';
	return temp;
	};

// **************************************************************
// Different systems (e.g. iPadOs and Android give differing answers about 
// window.width, window.height, screen.width, and screen.height at different 
// orientations. These give the reality.

function realWinHeightWidth()
	{
	'use strict';

	let wWidth = window.innerWidth;
	let wHeight = window.innerHeight;
	let result = {height: 0, width: 0};
	let orientation = readDeviceOrientation();
	result.height = wHeight;
	result.width = wWidth;
	if (orientation === 'Landscape') 
		{
		if (wHeight > wWidth)
			{
			result.height = wWidth;
			result.width = wHeight;
			}
		}
	else if (orientation === 'Portrait')
		{
		if (wWidth > wHeight)
			{
			result.height = wWidth;
			result.width = wHeight;
			}
		}
	else throw('realWinHeightWidth: Huh?');

	return result; // format (rows=height, columns=width)
	};

function realScreenHeightWidth()
	{
	'use strict';

	let sWidth = screen.width;
	let sHeight = screen.height;
	let result = {height: 0, width: 0};
	let orientation = readDeviceOrientation();
	result.height = sHeight;
	result.width = sWidth;
	if (orientation === 'Landscape') 
		{
		if (sHeight > sWidth)
			{
			result.height = sWidth;
			result.width = sHeight;
			}
		}
	else if (orientation === 'Portrait')
		{
		if (sWidth > sHeight)
			{
			result.height = sWidth;
			result.width = sHeight;
			}
		}
	else throw('realScreenHeightWidth: Huh?');

	return result; // format (rows=height, columns=width)
	};

// ********************************************************** \\
// The following makes it possible to implement
// special requirements for certain characters  and figures that vary 
// between iPhone and other platforms

// correct size & place for phase (angle) symbol
function fixAngleDisplay()
	{
	'use strict';

	var listPhases = [];
	var elementList = document.querySelectorAll('*[id^="phase-"]');
	for (const el of elementList) {
		var pieces = el.id.split('-');
		listPhases.push(pieces[pieces.length-1]);
		}
	for (const num of listPhases) {
	document.getElementById('phase-'+num).style = 
		'display: inline; font-style:normal; font-size:1.8rem;';
		};
	};

// correct display of equations within Lab Experiments
function fixEqn()
	{
	'use strict';

	var listEqns = [];
	var elementList = document.querySelectorAll('*[id^="fixEqn-"]');
	for (const el of elementList) {
		var pieces = el.id.split('-');
		listEqns.push(pieces[pieces.length-1]);
		}
	for (const num of listEqns)
		{
		let myImg = document.getElementById('fixEqn-'+num);
		let naturalWidth = myImg.naturalWidth;
		let naturalHeight = myImg.naturalHeight;
		let tableWidth = 1.0; // %
		let tdWidth = 0.9; // %
		let maxAvailWidth = 0.95*tdWidth*tableWidth; // %
		let availableWidth = maxAvailWidth*realWinHeightWidth().width; // px
		if (naturalWidth >= availableWidth)
			{
			myImg.style.width = 90+'%';
			myImg.style.height = '';
			}
		else
			{
			myImg.style.width = '';
			myImg.style.height = (2*naturalHeight/3)+'px';
			};
// 		console.log('results: ',
// 			naturalWidth,availableWidth,myImg.style.width,
// 			naturalHeight,myImg.style.height)
		};
	};

// *****************************************************************
// Functions for encoding, decoding, and managing localStorage

// Choose SNR factor with slider

// from an array of numbers to a long string to 
function encodeStorage(key, numericalArray)
	{
	'use strict'; 

	let arrayString = numericalArray.map(String);
	console.log('Size of encoded data: ',byteSize(arrayString)+' bytes');
	localStorage.setItem(key, arrayString);
	};

// from a long string to an array of numbers
function decodeStorage(key)
	{
	'use strict';

	let arrayString = localStorage.getItem(key);
	console.log('Size of retrieved data: ',byteSize(arrayString)+' bytes');
	let parsedArray = arrayString.split(',');
	let numericalArray = parsedArray.map(Number);
	return numericalArray;
	};

function clearStorage(key)
	{
	'use strict';

	localStorage.removeItem(key);
	};

function clearAllStorage()
	{
	'use strict';

	localStorage.clear(); // caveat emptor
	};

// ********************************************************** \\
