"use strict"

// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// ****************************************************************
// These procedures / subroutines / functions are used by the iSSP textbook
// They will presumably be loaded with every html file
// 

// ********************************************************** \\
// The uses resizes the window. If change is in either direction
// greater than "thresh", the window is redrawn.
// ity Friday, 9 October 2020

var oldWinW = window.innerWidth;
var oldWinH = window.innerHeight;
var winW = oldWinW;
var winH = oldWinH;
var thresh = 0.2 // 20% change in height or width

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
			thresh = 0.2 // 20% change in height or width
			if ( deltaW > thresh || deltaH > thresh )
				location.reload(); 
			}, 1000);
		};

// ********************************************************** \\
// The following rewinds (or preloads) a video clip
// ity Wednesday, 19 December 2018

function rewind()
	{
	var mediaElement = document.getElementById("theVideo"); 
	mediaElement.pause(); 
	mediaElement.currentTime = 0;
	mediaElement.load();
	};
	
function preload()
	{
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
	// previous = false = 0, button no radio button -> nothing to uncheck
	if (previous != 0) document.getElementById(previous).checked = false;
	window.open(next, "_self");
	};

// ********************************************************** \\
// The following makes it possible to react to an invisible button and clean house
function jumpToButton(location)
	{
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

// ********************************************************** \\
// The following makes it possible to implement
// special requirements for certain characters that vary 
// between iPhone and other platforms

// correct size & place for phase (angle) symbol
function fixAngleDisplay()
	{
	var listPhases = [];
	elementList = document.querySelectorAll('*[id^="phase-"]');
	for (const el of elementList) {
		var pieces = el.id.split('-');
		listPhases.push(pieces[pieces.length-1]);
		}
	for (const num of listPhases) {
	document.getElementById('phase-'+num).style = 'font-style:normal; font-size:3.84vw;';
	
// 	just in case in the future...
// 	alert('navigator.platform = '+navigator.platform);
// 	if (navigator.platform === 'iPhone' || navigator.platform === 'MacIntel')
// 		document.getElementById('phase-'+num).style = 
// 			'font-style:normal; font-size:3.84vw;';
// 	else 
// 		document.getElementById('phase-'+num).style = 
// 			'font-style:normal; font-size:3.84vw; vertical-align:-0.87vw;';

		};
	};

// ********************************************************** \\
