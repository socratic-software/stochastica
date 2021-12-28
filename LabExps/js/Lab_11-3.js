// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2022
// Licensed under the MIT license.
// Laboratory experiment 11.3
// i.t. young
// Sunday, 4 March 2018
// 
// ****************************************************************
// checked Thursday, 5 April 2018

// globals defined here (for now)
var canvasWidthOrig = 900;
var canvasHeightOrig = 655;

var canvasWidth = 680; // scaled to fit Pad screen through Cordova
var canvasHeight = 495; // scaled to fit Pad screen through Cordova

var reScale = canvasWidth/canvasWidthOrig;

var spriteWidth = 46;
var spriteHeight = 34;
var nudge = 2;
var width = Math.floor(reScale*spriteWidth);
var height = Math.floor(reScale*spriteHeight);
var scale = 1.5;

var currentLoc = "to Home";
var destination = "to Home";
var nextDestination = "to MIT";
var target = "fixed";

// Return screen to Mass ave turn angle: 
var beetle000deg = new Image();
beetle000deg.src = "../images/Beetle-00deg.png";

// MIT water  to Boston water angle: (alt)
var beetle020deg = new Image();
beetle020deg.src = "../images/Beetle-20deg.png";

// Mem dr to Mem turn 1 angle: 
var beetle033deg = new Image();
beetle033deg.src = "../images/Beetle-33deg.png";

// Mem turn 1 to Mem turn 2 angle:  
var beetle052deg = new Image();
beetle052deg.src = "../images/Beetle-52deg.png";

// Mem turn 2 to MIT water angle: 
var beetle061deg = new Image();
beetle061deg.src = "../images/Beetle-61deg.png";

// Beacon to AEPi angle: 
var beetle110deg = new Image();
beetle110deg.src = "../images/Beetle-110deg.png";

// BU to Mem dr angle: 
var beetle113deg = new Image();
beetle113deg.src = "../images/Beetle-113deg.png";

// Mem dr to Leave screen angle: 
var beetle180deg = new Image();
beetle180deg.src = "../images/Beetle-180deg.png";

// coordinates below are old (image width = 900) and new (image width = 680)

// coordinates of 155 Bay State Road
// var bayX = Math.floor(reScale*355);
// var bayY = Math.floor(reScale*483);
var bayX = Math.floor(reScale*345);
var bayY = Math.floor(reScale*467);

// coordinates end of ≈Bay State Road
// var bayX1 = Math.floor(reScale*100);
// var bayY1 = Math.floor(reScale*641);
var bayX1 = Math.floor(reScale*95);
var bayY1 = Math.floor(reScale*632);

// coordinates of start BU Bridge
// var buX = Math.floor(reScale*70);
// var buY = Math.floor(reScale*641);
var buX = Math.floor(reScale*65);
var buY = Math.floor(reScale*636);

// coordinates of end BU Bridge
// var memX0 = Math.floor(reScale*34);
// var memY0 = Math.floor(reScale*567);
var memX0 = Math.floor(reScale*30);
var memY0 = Math.floor(reScale*562);

// turns on Memorial Drive
// var memX1 = Math.floor(reScale*62);
// var memY1 = Math.floor(reScale*554);
var memX1 = Math.floor(reScale*57);
var memY1 = Math.floor(reScale*545);

// var memX2 = Math.floor(reScale*129);
// var memY2 = Math.floor(reScale*510);
var memX2 = Math.floor(reScale*124);
var memY2 = Math.floor(reScale*501);

// var memX3 = Math.floor(reScale*171);
// var memY3 = Math.floor(reScale*460);
var memX3 = Math.floor(reScale*166);
var memY3 = Math.floor(reScale*451);

// var memX4 = Math.floor(reScale*213);
// var memY4 = Math.floor(reScale*396);
var memX4 = Math.floor(reScale*208);
var memY4 = Math.floor(reScale*387);

// coordinates of Memorial Drive to leave screen
// var memLvX = -Math.floor(scale*width);
// var memLvY = Math.floor(reScale*559);
var memLvX = -Math.floor(scale*width);
var memLvY = Math.floor(reScale*550);

// coordinates of Mass Ave to reappear on screen
// var massReX = -Math.floor(scale*width);
// var massReY = Math.floor(reScale*108);
var massReX = -Math.floor(scale*width);
var massReY = Math.floor(reScale*85);

// coordinates of turn on Mass Ave
// var massTurnX = Math.floor(reScale*264);
// var massTurnY = Math.floor(reScale*106);
var massTurnX = Math.floor(reScale*259);
var massTurnY = Math.floor(reScale*96);

// coordinates of water's edge at MIT starting point
// var waterMitX = Math.floor(reScale*352);
// var waterMitY = Math.floor(reScale*150);
var waterMitX = Math.floor(reScale*321);
var waterMitY = Math.floor(reScale*125);

// coordinates of water's edge at Boston termination point
// var waterBosX = Math.floor(reScale*535);
// var waterBosY = Math.floor(reScale*255);
var waterBosX = Math.floor(reScale*525);
var waterBosY = Math.floor(reScale*240);

// coordinates of Beacon St & Mass Ave.
// var BeaconX = Math.floor(reScale*602);
// var BeaconY = Math.floor(reScale*292);
var BeaconX = Math.floor(reScale*574);
var BeaconY = Math.floor(reScale*277);

// console.log('MIT water to Boston water angle: ',
// 	Math.round(Math.atan2(waterBosY-waterMitY, waterBosX-waterMitX) * 180 / Math.PI), ' degrees');

// speed considerations
var speedGlacial = 1;
var speedSlow = 4;
var speedMed = 7;
var speedFast = 8;
var speedLight = 32;

var homeToMITfixed = 5.2; // seconds
var homeToMITrandom = 5.7;
var mitToBos = 2.3;
var bosToHome = 2.8;
var odometerDelay = homeToMITfixed;

// frames needed for animation
function frames(start,end,speed)
	{
	let x0 = start[0];
	let y0 = start[1];
	let x1 = end[0];
	let y1 = end[1];
	let d = Math.hypot((x1-x0),(y1-y0));
	return Math.ceil(d/speed);
	};

var routeHome =
	[[waterBosX,waterBosY],[BeaconX,BeaconY],[bayX,bayY]];
var framesHome =
	[frames(routeHome[0],routeHome[1],speedMed),
	 frames(routeHome[1],routeHome[2],speedMed)];
var avatarHome =
	[beetle020deg,beetle110deg];

var routeBos =
	[[waterMitX,waterMitY],[waterBosX,waterBosY]];
var framesBos =
	[frames(routeBos[0],routeBos[1],speedSlow)];
var avatarBos =
	[beetle020deg];

var routeFixedMIT =
	[[bayX,bayY],
	 [bayX1,bayY1],
	 [buX,buY],
	 [memX0,memY0],
	 [memX1,memY1],
	 [memX2,memY2],
	 [memX3,memY3],
	 [memX4,memY4],
	 [waterMitX-nudge,waterMitY-nudge],
	 [waterMitX,waterMitY]];
var framesFixedMIT =
	[frames(routeFixedMIT[0],routeFixedMIT[1],speedFast),
	 frames(routeFixedMIT[1],routeFixedMIT[2],speedFast),
	 frames(routeFixedMIT[2],routeFixedMIT[3],speedFast),
	 frames(routeFixedMIT[3],routeFixedMIT[4],speedFast),
	 frames(routeFixedMIT[4],routeFixedMIT[5],speedFast),
	 frames(routeFixedMIT[5],routeFixedMIT[6],speedFast),
	 frames(routeFixedMIT[6],routeFixedMIT[7],speedFast),
	 frames(routeFixedMIT[7],routeFixedMIT[8],speedFast),
	 frames(routeFixedMIT[8],routeFixedMIT[9],speedFast)];
var avatarFixedMIT =
	[beetle110deg,beetle180deg,beetle113deg,
	beetle033deg,beetle033deg,
	beetle052deg,beetle061deg,
	beetle061deg,beetle020deg];

var routeRandMIT =
	[[bayX,bayY],
	 [bayX1,bayY1],
	 [buX,buY],
	 [memX0,memY0],
	 [memLvX,memLvY],
	 [massReX,massReY],
	 [massTurnX,massTurnY],
	 [waterMitX,waterMitY]];
var framesRandMIT =
	[frames(routeRandMIT[0],routeRandMIT[1],speedFast),
	 frames(routeRandMIT[1],routeRandMIT[2],speedFast),
	 frames(routeRandMIT[2],routeRandMIT[3],speedFast),
	 frames(routeRandMIT[3],routeRandMIT[4],speedFast),
	 frames(routeRandMIT[4],routeRandMIT[5],speedLight),
	 frames(routeRandMIT[5],routeRandMIT[6],speedFast),
	 frames(routeRandMIT[6],routeRandMIT[7],speedFast)];
var avatarRandMIT =
	[beetle110deg,beetle180deg,beetle113deg,
	beetle180deg,beetle000deg,beetle000deg,beetle020deg];

var repeat;

var currentX = bayX;
var x = currentX;
var currentY = bayY;
var y = currentY;
var position = [x,y];
var nextX,nextY;

var framesNeeded = 1;
var odometerInit = randomInteger(67203,81002); // miles
var odometerFinish = odometerInit;

// The roundtrip, fixed route is chosen to be exactly 3 miles. In fact,
// it is slightly less (2.79 miles) but that leads to other, confusing issues
// that are not relevant. So I keep it simple by using this integer value
// of 3 miles.
var dAEPiToRandMIT = randomReal(1.7,12.2); // shortest route ≠ fastest route
var dAEPiToFixedMIT = 1.89; // miles & fastest route (truth = 1.74 miles)
var dMitToBos = 0.39; // miles
var dBosToAEPi = 0.72; // miles (truth = 0.66 miles)
var dRoundTrip = dAEPiToFixedMIT + dMitToBos + dBosToAEPi; // miles

var t0 = 0;
var t = t0;
var index = t0;

var srcX = 0;
var srcY = 0;

var avatar = beetle110deg;
var step = 0;
var route = [];
var frames = [];
var theAvatar = [];

// *****************************************************************
// Functions defined here

function travel()
	{
	destination = nextDestination;
	step = 0;
	if (destination != currentLoc)
		{
		ctx.clearRect(currentX,currentY,Math.floor(scale*width),Math.floor(scale*height));
		if (destination == "to MIT")
			{
			// from AEPi to start of MIT (Harvard) bridge
			route = (target == "fixed") ? routeFixedMIT : routeRandMIT;
			frames = (target == "fixed") ? framesFixedMIT : framesRandMIT;
			theAvatar = (target == "fixed") ? avatarFixedMIT : avatarRandMIT;
			odometerFinish = 
				(target == "fixed") ? dAEPiToFixedMIT : randomReal(1.7,12.2)
			odometerFinish += odometerInit;
			nextDestination = "to Boston";
			odometerDelay = (target == "fixed") ? homeToMITfixed : 
				homeToMITrandom;
			}
		else if (destination == "to Boston")
			{
			route = routeBos;
			frames = framesBos;
			theAvatar = avatarBos;
			odometerFinish = odometerInit + dMitToBos;
			nextDestination = "to Home";
			odometerDelay = mitToBos;
			}
		else if (destination == "to Home")
			{
			route = routeHome;
			frames = framesHome;
			theAvatar = avatarHome;
			odometerFinish = odometerInit + dBosToAEPi;
			nextDestination = "to MIT";
			odometerDelay = bosToHome;
			};
		currentX = route[step][0];
		currentY = route[step][1];
		nextX = route[step+1][0];
		nextY = route[step+1][1];
		x = currentX;
		y = currentY;
		framesNeeded = frames[step];
		avatar = theAvatar[step];
		index = t0;
		repeat = setInterval(draw,40);
		currentLoc = destination;
		setTimeout(updateOdometer, 1000*odometerDelay); // delay in [ms]
		};
	};

function updateOdometer()
	{
	document.querySelector('#odometerStart').value =
		d0round(Math.floor(odometerInit));
	document.querySelector('#odometerStop').value =
		d0round(Math.floor(odometerFinish));
	odometerInit = odometerFinish;
	document.querySelector('#destinationLabel').value = nextDestination;
	destination = nextDestination;
	};

function draw()
	{
	if (index <= framesNeeded && step < frames.length)
		{
		ctx.clearRect(x,y,Math.floor(scale*width),Math.floor(scale*height));
		avatar = theAvatar[step];
		updateFrame(index/framesNeeded);
		ctx.drawImage(avatar,srcX,srcY,width,height,x,y,Math.floor(scale*width),Math.floor(scale*height));
		index++;
		}
	else clearInterval(repeat);
	};

function updateFrame(t)
	{
	position = trajectory(currentX,currentY,nextX,nextY,t)
	x = position[0];
	y = position[1];
	if (x == nextX && y == nextY)
		{
		index = t0;
		step++;
		currentX = nextX;
		currentY = nextY;
		if (step < frames.length)
			{
			nextX = route[step+1][0];
			nextY = route[step+1][1];
			framesNeeded = frames[step];
			};
		};
	};
	
function trajectory(x0,y0,x1,y1,t)
	{ // linear trajectories, no splines, no Beziers
	let x = (x1-x0)*t + x0;
	let y = (y1-y0)*t + y0;
	return [x,y];
	};

function chooseRoute(val)
	{
	target = val;
	};

// ***************************************************************** \\
// start here

function goHome()
	{
	ctx.clearRect(currentX,currentY,Math.floor(scale*width),Math.floor(scale*height));
	index = t0;
	if (destination == "to Home")
		{
		x = bayX;
		y = bayY;
		ctx.drawImage(avatar,srcX,srcY,width,height,x,y,Math.floor(scale*width),Math.floor(scale*height));
		}
	// now wait for interaction
	};
	

// ***************************************************************** \\
