// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2022
// Licensed under the MIT license.
// ****************************************************************
// Math, array, and signal processing procedures to be used in the SSP package
// i.t. young
// Tuesday, 5 July 2016
// Wednesday, 21 September 2016: separated fourier code into another file


// ****************************************************************
// checked Wednesday, 18 March 2020

function regressionLine(x,slope,intercept)
	{
	return (slope*x + intercept);
	};


// ****************************************************************
// checked Sunday, 18 December 2016

function oddQ(number)
	{
	return (number % 2 === 1);
	};

function evenQ(number)
	{
	return (number % 2 === 0);
	};


// ****************************************************************
// The following utility rotates a UNIVERSAL data set 1D or 2D, by
// shiftR rows down and shiftC columns to the right.
//
// If you want the result in the middle of an array and the data are
// 1D and of odd length N, then choose the rotation shiftR = floor(N/2) which
// is exactly in the middle. If the data are 1D and of even length then
// choose shiftR = N/2 = floor(N/2). If the data are 2D then both dimensions
// must be a power of two so shiftR = rows/2 and shiftC = cols/2.
//
// checked Sunday, 14 May 2017
//
// Monday, 13 November 2017

function dataRotate(signal,shiftR,shiftC)
	{
	var ndim = signal[0].length; // number of dimensions, 1 or 2
	var result = [];
	var ushiftR = Math.floor(2*shiftR);
	if (ndim === 1)
		{
		// for 1D complex signal use this to get to middle
		result = rotateRight(signal[1],ushiftR);
		}
	else if (ndim === 2)
		{
		var tempData = split(signal[1],signal[0]); // for 2D signal use this
		var rows = signal[0][0];
		var urows = 2*rows;
		var tempR;
	
		// first, rotate rows down 
		for (var i = 0; i < ushiftR; i++)
			{
			tempR = tempData.pop(); //remove the bottom row
			tempData.unshift(tempR); // put on top
			};
		 
		// then, rotate columns right 
		for (var i = 0; i < urows; i++)
			{
			tempR = tempData[i];
			tempData[i] = rotateRight(tempR,shiftC);
			};
		result = merge(tempData,signal[0]);
		}
	else
		throw "dataRotate: Wrong number of dimensions!";
		
	return [signal[0],result];
	};


// ****************************************************************
// Following are utility routines to convert between formats for 
// complex signals that are either 1D or 2D. This routine was not written
// to handle a general number of dimensions, N.
//
// the "toPlotlyFormat" routine converts 1D and 2D signals to the
// special format required by the Plotly.js graphic display procedures
//
// The "split" routine takes data in the form of [r1,i1,r2,i2, ...,rn,in] 
// and converts it to [[r1,r2, ...,rn],[i1,i2, ...,in]] where r1 is 
// the real part of a complex sample and i1 is the imaginary part.Note 
// that this is a 1D example.
//
// The "merge" routine takes data in the form of 
// [[r1,r2, ...,rn],[i1,i2, ...,in]] and converts it to 
// [r1,i1,r2,i2, ...,rn,in] where r1 is the real part of a complex sample 
// and i1 is the imaginary part. Note that this is a 1D example.
//
// checked Wednesday, 17 May 2017

// **************************************************************
function getDynRange(data)
	{
	let minVal = +Infinity;
	let maxVal = -Infinity;
	let tempVal = 0;
	for (let j = 0; j < data.length; j++)
		{
		tempVal = data[j];
		if (tempVal < minVal) minVal = tempVal;
		if (tempVal > maxVal) maxVal = tempVal;
		};
	let theDynamicRange = maxVal - minVal;
	return [theDynamicRange,minVal,maxVal];
	};

// ****************************************************************

function toPlotlyFormat(data)
	{
	// data[1] = vector of even length with alternating real & imaginary values
	// if ndim = 2, nn[rows, columns] is an integer array containing the
	// number of rows and the number of columns 
	
	var standardForm = uRs(data[1].slice()); // only real part used
	var ndim = data[0].length; // number of dimensions, 1 or 2
		
	var rows = 1; // default is 1D signal
	var cols = 0;
	if (ndim === 1)
		{
		cols = data[0][0];
		var result = standardForm;
		}
	else if (ndim === 2)
		{
		rows = data[0][0]; // but for 2D signal use this
		cols = data[0][1];
		var result = createArray(rows,cols);
		for (var i = 0; i < rows; i++)
			for (var j = 0; j < cols; j++)
				result[i][j] = standardForm[i*cols + j];
		}
	else
		throw "toPlotlyFormat: Wrong number of dimensions!";
	
	return result;
	};
	
	
// ****************************************************************

function split(data,nn)
	{
	// data = vector of even length with alternating real and imaginary values
	// if ndim = 2, nn[rows, columns] is an integer array containing the number of rows
	// and the number of columns 
	
	var ndim = nn.length; // number of dimensions, 1 or 2
	var rows = 1; // default is 1D signal
	var cols = 0;
	if (ndim === 1)
		cols = nn[0];
	else if (ndim === 2)
		{
		rows = nn[0]; // but for 2D signal use this
		cols = nn[1];
		}
	else
		throw "split: Wrong number of dimensions!";

	var result = createArray(2*rows,cols);
	var m = 0;
	for (var i = 0; i < rows; i++)
		{
		m = 2*i; // for speed
		var k = 0;
		for (var j = 0; j < cols; j++)
			{
			// It's just a matter of getting the right indices
			k = m*cols + 2*j; // for speed
			result[m][j] = data[k];
			result[m+1][j] = data[k+1];
			};
		};
	return result;
	};
	
	
// ****************************************************************

function merge(data,nn)
	{
	var ndim = nn.length;
	var rows = 1; // default is 1D signal
	var cols = 0;
	if (ndim === 1)
		cols = nn[0];
	else if (ndim === 2)
		{
		rows = nn[0]; // but for 2D signal use this
		cols = nn[1];
		}
	else
		throw "merge: Wrong number of dimensions!";
	var result = createArray(2*rows*cols);
		var m = 0;
	for (var i = 0; i < rows; i++)
		{
		m = 2*i; // for speed
		var k = 0;
		for (var j = 0; j < cols; j++)
			{
			// It's just a matter of getting the right indices
			k = m*cols + 2*j; // for speed
			result[k] = data[m][j];
			result[k+1] = data[m+1][j];
			};
		};
	return result;
	};


// ****************************************************************
// This routine is intended for 1D signals where we want to be able to do
// either convolution or correlation of complex data structures
// checked Sunday, 18 December 2016

function reverse(list)
	{
	var nn = [list.length >> 1];
	var splitData = split(list,nn);
	return merge([splitData[0].reverse(), splitData[1].reverse()],nn)
	};


// ****************************************************************
// Don't forgot that one might want to use getMaxOfArray(abs(cmplxArray)),
// etc.
// checked Tuesday, 10 January 2017

function getMaxOfArray(numArray)
	{
	let tempArray = flatten(numArray);
	let result = -Infinity;
	for (var i = 0; i < tempArray.length; i++)
		if (result < tempArray[i]) result = tempArray[i];
	return result;
	};

function getMinOfArray(numArray)
	{
	let tempArray = flatten(numArray);
	let result = Infinity;
	for (var i = 0; i < tempArray.length; i++)
		if (result > tempArray[i]) result = tempArray[i];
	return result;
	};

function getMaxOfAbsArray(numArray)
	{
	let tempArray = flatten(numArray);
	let result = -Infinity;
	for (var i = 0; i < tempArray.length; i++)
		{
		tempVal = Math.abs(tempArray[i]);
		if (result < tempVal) result = tempVal;
		}
	return result;
	};

// ****************************************************************
// checked Sunday, 18 December 2016

function total(data)
	{
	var rTotal = 0;
	var iTotal = 0;
	var n = data.length;
	for (var i = 0; i < n; i += 2)
		{
		rTotal += data[i]; // real part
		iTotal += data[i+1]; // imaginary part
		};
		return [rTotal, iTotal];
	};


/// ****************************************************************
// Inner product of two arrays (vectors)
// Both 1D and 2D data have the same complex format.
// result for z1 and z2 is z1•conjugate(z2)
// checked Sunday, 18 December 2016

function dot(z1,z2)
	{
	var d1 = dimensions(z1);
	var d2 = dimensions(z2);
	
	if(d1 !== d2)
		throw "Two arrays must have the same length!";

	var rsum = 0;
	var isum = 0;
	var result = [0,0];

	if(d1 === 0)
		rsum = (z1*z2) // these are real scalars
	else
		{
		var nn = [(z1.length)/2];
		var splitz1 = split(z1,nn);
		var real1 = splitz1[0];
		var imag1 = splitz1[1];
		var splitz2 = split(z2,nn);
		var real2 = splitz2[0];
		var imag2 = splitz2[1];
		var a=0, b=0, c=0, d=0;
		
		for (var i = 0; i < real1.length; i++)
			{
			a = real1[i];
			b = imag1[i];
			c = real2[i];
			d = imag2[i];

			rsum += (a*c + b*d); // conjugate occurs here
			isum += (b*c - a*d); // conjugate occurs here
			};
		};
	return [rsum,isum]; 
	};


// ****************************************************************
// Real numeric data only
// Note you cannot sort complex data. Application to complex data will
// be meaningless.You can sort abs(complex data) or the real part of a complex array
// Checked Monday, 9 January 2017

function sort(data)
	{
	var nn = [data.length >> 1];
	var splitData = split(data,nn);
	var realData = splitData[0].slice();
	var sortData = realData.sort(function(a, b){return a-b});
	var result = [sortData, splitData[1]];
	return merge(result,nn);
	};


// ****************************************************************
// Checked Monday, 9 January 2017

function flatten(array)
	{
	var result = [];
	for (var i = 0; i < array.length; i++)
		{
		if(Array.isArray(array[i]))
			{
			result = result.concat(flatten(array[i]));
			}
		else
			{
			result.push(array[i]);
			};
		};
	return result;
	};


// ****************************************************************
// WARNING: Do not use var tarray2 = Array(tdimsi).fill(Array(tdimsj).fill(0));
// as pointers in the "tdimsi" positions point to the last place in the
// "tdimsj" section.

// checked Sunday, 18 December 2016
// checked Saturday, 11 November 2017

function createArray(length)
// Taken from <http://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript/966938#966938>
// Use a createArray(rows,cols,...)
	{
	var arr = Array(length || 0),
	i = length;
	if (arguments.length > 1)
		{
		var args = Array.prototype.slice.call(arguments, 1);
		while(i--) arr[length-1 - i] = createArray.apply(this, args);
		};
	return arr;
	};

// ****************************************************************
// Following Mathematica's protocol replace every element smallter than
// 10^(-10) with 0

// This chop() routine is overkill. All arrays that will be used are 1D
// so the multi-dimensional stuff is unnecessary. But it is working so
// I won't fix it.

function chop(array)
	{
	var dims = arrayDimension(array);
	var i = 0;
	var j = 0;
	var k = 0;
	var tempVal = 0;
	
	if(dims.length === 1) // simple list
		{
		var tdimsi = dims[0];
		var tarray1 = createArray(tdimsi);
		};
	if(dims.length === 2) // planar array
		{
		var tdimsi = dims[0];
		var tdimsj = dims[1];
		var tarray2 = createArray(tdimsi,tdimsj);
		};
	if(dims.length === 3) // volume array
		{
		var tdimsi = dims[0];
		var tdimsj = dims[1];
		var tdimsk = dims[2];
		var tarray3 = createArray(tdimsi,tdimsj,tdimsk);
		};
	
	if(dims.length === 0) // scalar
		{
		if(Math.abs(array) < tooSmall) array = 0;
		return array;
		}
	else if(dims.length === 1) // simple list
		{
		for (var i = 0; i < tdimsi; i++)
			{
			tempVal = array[i];
			if(Math.abs(tempVal) < tooSmall) tarray1[i] = 0
			else tarray1[i] = tempVal;
			};
		return tarray1;
		}
	else if(dims.length === 2) // planar array
		{
		for (var i = 0; i < tdimsi; i++)
			{
			for (var j = 0; j < tdimsj; j++)
				{
				tempVal = array[i][j];
				if(Math.abs(tempVal) < tooSmall) tarray2[i][j] = 0
				else tarray2[i][j] = tempVal;
				};
			};
		return tarray2;
		}
	else // volume array
		{
		for (var i = 0; i < tdimsi; i++)
			{
			for (var j = 0; j < tdimsj; j++)
				{
				for (var k = 0; k < tdimsk; k++)
					{
					tempVal = array[i][j][k];
					if(Math.abs(tempVal) < tooSmall) tarray3[i][j][k] = 0
					else tarray3[i][j][k] = tempVal;
					};
				};
			};
		return tarray3;
		};
	};


// ****************************************************************
// Again the assumption is that we dealing with the "universal"
// signal format as described in "SSPconstants.js". This means that if
// we ask for "n" complex samples that means 2n number will be taken 
//
// The array represents 1D data then "n" can be positive or negative.
// Positive means that we take the first n value of the input array;
// negative means that we take the last n values of the input array.
//
// checked Sunday, 18 December 2016

function take(array,n)
	{
	if(n === 0)
		{
		// In this (special) case, we just copy the array. 
		var tarray = array.slice();
		}
	else
		{
		// indices matter, especially for speed
		var k = 2*n;
		var tarray = createArray(Math.abs(k));
		var m = array.length + k;
		if (n > 0)
			{
			for (var i = 0; i < k; i += 2)
				{
				tarray[i] = array[i];
				tarray[i+1] = array[i+1];
				};
			}
		else
			{
			for (var i = 0; i < Math.abs(k); i += 2)
				{
				tarray[i] = array[i+m];
				tarray[i+1] = array[i+m+1];
				};
			};
		};
	return tarray;
	};


// ****************************************************************
// Now the assumption is that we dealing with the 1D graphical "plotly"
// data format as described in "toPlotlyFormat". This means that if we
// ask for "n" samples that means n numbers will be taken as follows: 
//      Take the values of x[n] where a <= n < b 
//
// checked Sunday, 8 April 2018

function takeAtoB(array,a,b)
	{
	if (b <= a) throw("takeAtoB, not B to A");
	let tarray = createArray(b-a);
	for (var i = 0; i < b - a; i++)
		tarray[i] = array[i+a];
	return tarray;
	};


// ****************************************************************
// Again the assumption is that we dealing with the "universal"
// signal format as described in "SSPconstants.js". This means that if
// we ask for "n" complex samples that means 2n number will be taken 
//
// The array represents 2D (image) data with dimensions ddims = [rows, cols]
// the array window contains the portion of the image data that is to be
// taken with coordinates [rtop, rbot, cleft, cright]. Note rbot ≥ rtop and
// cright ≥ cleft.
//
// checked Saturday, 25 February 2017

function imageTake(image,window)
	{
	var rows = image[0][0];
	var urows = 2*rows;
	var cols = image[0][1];
	
	// Note rbot ≥ rtop
	var rtop = window[0];
	var rbot = window[1];
	var trows = rbot - rtop; // rows to be copied
	
	// Note cright ≥ cleft
	var cleft = window[2];
	var cright = window[3];
	var tcols = cright - cleft; // cols to be copied
	var tarray1 = [];
	
	if( (trows == rows) && (tcols == cols) ) return image ;
	else
		{
		// gymnastics, the splits
		var tdata = split(image[1], [rows,cols]);
		tarray1 = createArray(2*trows,tcols);
		var utrows = 2*trows; // save a millisecond
		var urtop = 2*rtop; // save a millisecond
		// split reformats to make the next part easy
		for (var i = 0; i < utrows; i++)
			for (var j = 0; j < tcols; j++)
				tarray1[i][j] = tdata[(urtop+i)%urows][(cleft+j)%cols];
				
		return [[trows,tcols], merge(tarray1,[trows,tcols])] ;
		};
	};


// ****************************************************************

function scale1DSignal(signal, scaleFactor)
	{
	if (scaleFactor == 0)
		{
		return signal;
		}
	else
		{
		var temp = signal.slice();
		for (var i = 0; i < temp.length; i++)
			temp[i] *= scaleFactor;
		return temp;
		};
	};

function scaleImage(image, scaleFactor)
	{
	if (scaleFactor == 0)
		return image;
	else
		{
		var temp = image[1].slice();
		for (var i = 0; i < temp.length; i++)
			temp[i] /= scaleFactor;
		return [image[0],temp];
		};
	};


// ****************************************************************
// Make two real arrays have the same length. That length will be the shorter
// of the two.
// checked Sunday, 18 December 2016

function normalizeLength(arrays)
	{
	var array0 = arrays[0].slice();
	var array1 = arrays[1].slice();
	var m0 = arrays[0].length;
	var m1 = arrays[1].length;
	var diff = Math.abs(m0 - m1);
	var tarrays = Array(2);
	if(diff == 0)
		tarrays =[array0,array1];
	else
		{
		if (m0 > m1)
			tarrays = [takeAtoB(array0,0,m1),array1.slice()];
		else
			tarrays = [array0.slice(),takeAtoB(array1,0,m0)];
		};
	return tarrays;
	};


// ****************************************************************
// starting from a real, positive array A, return B whose area is one
// checked Saturday, 11 August 2018

function areaNormalizeReal(array)
	{
	var n = array.length;

	let result = Array(n).fill(0);
	let area = 0;

	// get area
	for (var i = 0; i < n; i++) area += array[i];

	// now normalize
	for (var i = 0; i < n; i++) result[i] = array[i]/area;
	return result;
	};


// ****************************************************************
// starting from a real array A, return B = A/(max(|A|)
// checked Saturday, 11 August 2018

function ampNormalizeReal(array)
	{
	var n = array.length;

	// first find the absolute maximum
	var result = Array(n).fill(0);
	var maxval = 0;
	var temp = 0;
	for (var i = 0; i < n; i++)
		{
		temp = Math.abs(array[i]);
		if (temp > maxval)
			maxval = temp;
		};
		
	// now normalize except if maxval === 0
	if(maxval != 0)
		{
		for (var i = 0; i < n; i++)
			result[i] = array[i]/maxval;
		};
	return result;
	};


// ****************************************************************
// starting from a complex array A, return B = A/(max(|A|)
// checked Sunday, 18 December 2016
// corrected Saturday, 11 August 2018

function ampNormalize(array)
	{
	var n = array.length;
	if (oddQ(n))
		throw("Complex signals must have even length, e.g. 2*17");

	// first find the absolute maximum
	var result = Array(n).fill(0);
	var maxval = 0;
	var temp = 0;
	for (var i = 0; i < n; i +=2)
		{
		temp = Math.hypot(array[i],array[i+1]);
		if (temp > maxval)
			maxval = temp;
		};
		
	// now normalize except if maxval === 0
	if(maxval !== 0)
		{
			for (var i = 0; i < n; i += 2)
				{
					result[i] = array[i]/maxval;
					result[i+1] = array[i+1]/maxval;
				};
		};
	return result;
	};


// ****************************************************************
// complex 1D array padded to a length that is closest poewer of two and normalized
// such that if A is input then B = A/max(|A|)
// checked Sunday, 18 December 2016

function padAndNormalize(array)
	{
	var n = array.length;
	if (oddQ(n))
		throw("Complex signals must have even length, e.g. 2*17");
	var magic = Math.ceil(Math.log2(n));
	// this number is even
	var samples = Math.pow(2,magic);
	var iter = samples - n;
		
	var tarray = [];
	for (var i = 0; i < iter; i++) tarray[i] = 0;
		
	// This is javascript version of Mathemtica's Join
	var padded = array.concat(tarray);
	
	return ampNormalize(padded);
	};


// ****************************************************************
// simple functions for complex arrays
// complex array is z = [real[],imag[]]
// checked Sunday, 18 December 2016

// this functions converts a 'universal' function to a standard format
// example complex 'universal' = [r1, i1, r2, i2, ..., rN, iN]
// example real 'universal' = [r1, 0, r2, 0, ..., rN, 0]
// example imaginary 'universal' = [0, i1, 0, i2, ..., 0, iN]
// example real standard = [r1, r2, ..., rN]
// example imaginary standard = [i1, i2, ..., iN]
//
// the standard format is required by plotting routines so conversion
// is necessary. It's a dirty job but someone ...

// universal real to standard real

function uRs(data)
	{
	var n = data.length;
	var real = createArray(n >> 1);
	for (var i = 0; i < n; i += 2) real[i >> 1] = data[i];
	return real;
	};


// universal imaginary to standard imaginary
function uIs(data)
	{
	var n = data.length;
	var imag = createArray(n >> 1);
	for (var i = 0; i < n; i += 2) imag[i >> 1] = data[i+1];
	return imag;
	};


// standard real to universal real
function suR(data)
	{
	var n = 2*data.length;
	var real = createArray(n);
	for (var i = 0; i < n; i += 2)
		{
		real[i] = data[i >> 1];
		real[i+1] = 0;
		};
	return real;
	};


// standard imaginary to universal imaginary
function suI(data)
	{
	var n = 2*data.length;
	var imag = createArray(n);
	for (var i = 0; i < n; i += 2)
		{
		imag[i] = 0;
		imag[i+1] = data[i >> 1];
		};
	return imag;
	};


// ****************************************************************
// these functions work with the 'universal' format

function re(data)
	{
	var n = data.length;
	var real = createArray(n);
	for (var i = 0; i < n; i += 2)
		{
		real[i] = data[i];
		real[i+1] = 0;
		};
	return real;
	};


function im(data)
	{
	var n = data.length;
	var imag = createArray(n);
	for (var i = 0; i < n; i += 2)
		{
		imag[i] = 0;
		imag[i+1] = data[i+1];
		};
	return imag;
	};


function arg(data)
	{
	var n = data.length;
	var phase = createArray(n);
	for (var i = 0; i < n; i += 2)
		{
		phase[i] = Math.atan2(data[i+1],data[i]);
		phase[i+1] = 0;
		};
	return phase;
	};


function abs(data)
	{
	var n = data.length;
	var mag = createArray(n);
	for (var i = 0; i < n; i += 2)
		{
		mag[i] = Math.hypot(data[i],data[i+1]);
		mag[i+1] = 0;
		};
	return mag;
	};


function abssq(data)
	{ // absolute value SQUARED
	var n = data.length;
	var mag2 = createArray(n);
	for (var i = 0; i < n; i += 2)
		{
		mag2[i] = (data[i]**2) + (data[i+1]**2);
		mag2[i+1] = 0;
		};
	return mag2;
	};


function inverseArray(z)
	{
	let n = z.length;
	let zinv = Array(n);
	let rz = 0;
	let iz = 0;
	let zmagSq = 0;
	for (var i = 0; i < n; i += 2)
		{
		rz = z[i]; // real part
		iz = z[i+1]; // imaginary part
		zmagSq = (rz*rz) + (iz*iz);
		
		// if zmagSq == 0 then both rz & iz = 0 --> force inverse to 0 not ∞ 
		if (zmagSq == 0) zmagSq = 1;
		
		zinv[i] = rz/zmagSq;
		zinv[i+1] = -iz/zmagSq;
		};
	return zinv;
	};


function conjugate(z)
	{
	var n = z.length;
	var zstar = createArray(n);
	for (var i = 0; i < n; i += 2)
		{
		zstar[i] = z[i];
		zstar[i+1] = -z[i+1];
		};
	return zstar;
	};


function L2norm(data)
	{ // L2-norm = Euclidean norm
	var rTotal = 0;
	var n = data.length;
	for (var i = 0; i < n; i += 2)
		rTotal += ((data[i]**2) + (data[i+1]**2));
	return Math.sqrt(rTotal);
	};


// ****************************************************************
// Converts list of points in the (r, theta) coordinates to (x,y) coordinates
// Note in 2D, r ≥ 0 and -π ≤ theta ≤ +π
// Input data structure polarArray is [r1,theta1,r2,theta2,r3,theta3...,rN,thetaN]
// Output data structure xyArray is [x1,y1,x2,y2,x3,y3...,xN,yN]

function fromPolarCoordinates(polarArray)
	{
	var n = polarArray.length;
	var xyArray = createArray(n);

	for (var i = 0; i < n; i += 2)
		{
		xyArray[i] = polarArray[i]*Math.cos(polarArray[i+1]);
		xyArray[i+1] = polarArray[i]*Math.sin(polarArray[i+1]);
		};
	return xyArray;
	};


// ****************************************************************
// Converts list of points in (x,y) coordinates to (r, theta) coordinates
// Note in 2D, r ≥ 0 and -π ≤ theta ≤ +π
// Input data structure xyArray is [x1,y1,x2,y2,x3,y3...,xN,yN]
// Output data structure polarArray is [r1,theta1,r2,theta2,r3,theta3...,rN,thetaN]

function toPolarCoordinates(xyArray)
	{
	var n = xyArray.length;
	var polarArray = createArray(n);

	for (var i = 0; i < n; i += 2)
		{
		polarArray[i] = Math.hypot(xyArray[i],xyArray[i+1]);
		polarArray[i+1] = Math.atan2(xyArray[i+1],xyArray[i]);
		};
	return polarArray;
	};


// ****************************************************************
// log function for complex signal arrays
// note that this returns an array with the log in the real positions
// and the angle in the imaginary positions
// 
// checked Monday, 9 January 2017

function log10(array)
	{
	var temp = toPolarCoordinates(array);
	var n = temp.length;
	var x = 0;

	for (var i = 0; i < n; i += 2)
		{
		x = temp[i];
		if(x > 0)
			temp[i] = Math.log10(x);
		else if (x === 0)
			temp[i] = -Infinity;
		else
			temp[i] = NaN;
		};
	return temp;
	};


// ****************************************************************
// simple functions for real signal arrays
// checked Sunday, 18 December 2016

function clip(array,xmin,xmax,ymin,ymax)
//clip elements of input array to limits of ymin and ymax
	{
	var temp = [];
	var n = array.length;
	var slope = (ymax - ymin) / (xmax - xmin);
	var intercept = (ymin*xmax - ymax*xmin) / (xmax - xmin);

	for (var i = 0; i < n; i += 2)
		{
		if(array[i] <= xmin)
			temp[i] = ymin;
		else
			{
			if(array[i] > xmax)
				temp[i] = ymax;
			else
				temp[i] = slope*array[i]+intercept;
			}
		temp[i+1] = 0;
		};
	return temp;
	};


// ****************************************************************

function round(data,rounding)
// Round a floating point array of numbers to n digits after the decimal point
// n is defined as 10^(-n), e.g. 0.001 for n = 3 as in round(temp,0.001)
	{
	if (dimensions(data) === 0)
		return rounding*Math.round(data/rounding);
	
	var temp = [];
	var n = data.length;
	for (var i = 0; i < n; i++) temp[i] = rounding*Math.round(data[i]/rounding);
	return temp;
	};


// ****************************************************************
// Array dimension checker
// arrayDimension Returns:
//		false when array dimensions are different
//		an Array when is rectangular 0d (i.e. an object) or >=1d
// dimensions returns the number of dimensions in the array
// arrayDimension source: 
// <http://stackoverflow.com/questions/13814621/how-can-i-get-the-dimensions-of-a-multidimensional-javascript-array>
// checked Sunday, 18 December 2016

function arrayDimension(a)
	{
	// Make sure it is an array
	if (a instanceof Array)
		{
		// First element is an array
		var sublength = arrayDimension(a[0]);
		if (sublength === false)
			{
			// Dimension is different
			return false;
			}
		else
			{
			// Compare every element to make sure they are of the same dimensions
			for (var i = 1; i < a.length; i++)
				{
				var _sublength = arrayDimension(a[i]);
				// HACK: compare arrays...
				if (_sublength === false || sublength.join(",") != _sublength.join(","))
					{
					// If the dimension is different (i.e. not rectangular)
					return false;
					}
				};
			// OK now it is "rectangular" (could you call 3d "rectangular"?)
			return [a.length].concat(sublength);
			}
		}
	else
		{
		// Not an array
		return [];
		};
	};

function dimensions(array)
	{
	return arrayDimension(array).length;
	};


// ****************************************************************
// Remember that due to the data format of complex number arrays, the amount
// of places to be rotated or shifted might need to be EVEN.
// But this subroutine will work, as well, if the data are 1D and in the real format
// arrays can be either 1D or 2D signals
// checked Sunday, 18 December 2016
// changed Monday, 20 January 2020

function rotateLeft(array,rotate)
	{
	if (rotate == 0)
		return array
	else if (rotate < 0)
		{
		rotateRight(array,Math.abs(rotate));
		return
		}
	else
		{
		var atemp = array.slice();
		while( rotate-- )
			{
			var temp = atemp.shift();
			atemp.push(temp)
			}
		return atemp;
		};
	};

function rotateRight(array,rotate)
	{
	if (rotate == 0)
		return array
	else if (rotate < 0)
		{
		rotateLeft(array,Math.abs(rotate));
		return;
		}
	else
		{
		if (rotate == 0) return array;
			var atemp = array.slice();
			while( rotate-- )
				{
				var temp = atemp.pop();
				atemp.unshift(temp)
				}
			return atemp;
		};
	};


// ****************************************************************
// Filter and signal definitions:
//	  1D - the complex coefficients
//	  2D - the filter size and its complex coefficients, that is,
//		   filter[0] = [rows,cols]
//		   filter[1] = [complex coefficients]
//
// checked Sunday, 18 December 2016

const identityFilter = 
	[ // Notice slightly MODIFIED complex data format
		[3,3],
		[0, 0, 0, 0, 0, 0,
		 0, 0, 1, 0, 0, 0, 
		 0, 0, 0, 0, 0, 0]
	];

const crossFilter = 
	[ // Notice slightly MODIFIED complex data format
		[3,3],
		[1, 0, 0, 0, -1, 0,
		 0, 0, 0, 0, 0, 0,
		-1, 0, 0, 0, 1, 0]
	];

const derivFilter = 
	[ // Notice slightly MODIFIED complex data format
		[3,3],
		[0, 0, 1, 0, 0, 0,
		 1, 0, 0, 0, -1, 0,
		 0, 0, -1, 0, 0, 0]
	];

const sobelFilter = 
	[ // Notice slightly MODIFIED complex data format
		[3,3],
		[-1, 0, 0, 0, 1, 0,
		 -2, 0, 0, 0, 2, 0,
		-1, 0, 0, 0, 1, 0]
	];

const xySobelFilter = 
	[ // Notice slightly MODIFIED complex data format
		[3,3],
		[-1, 0, -1, 0, 0, 0,
		 -1, 0, 0, 0, 1, 0,
		0, 0, 1, 0, 1, 0]
	];

// The following coefficients determined by "EquirippleFilterKernel[]" in
// Mathematica. See either notebook "Laboratory Experiment #10.7.nb"
// or "MyStuff.nb"

// EquirippleFilterKernel[{{{0, 0.3*π}, {.35*π, π}}, {PASSband, STOPband}}, 43] 
// with π = sampFreq/2 & 43 coefficients
const youngLPFFilter = 
suR([0.00115333,0.0335179,0.0051661,-0.00569677,-0.0137668,-0.00892154,0.00641936,0.0182781,0.0133235,-0.00705987,-0.0248268,-0.0203065,0.00759625,0.0354256,0.0328779,-0.00799214,-0.0573142,-0.0633473,0.00825774,0.141242,0.271113,0.324989,0.271113,0.141242,0.00825774,-0.0633473,-0.0573142,-0.00799214,0.0328779,0.0354256,0.00759625,-0.0203065,-0.0248268,-0.00705987,0.0133235,0.0182781,0.00641936,-0.00892154,-0.0137668,-0.00569677,0.0051661,0.0335179,0.00115333]);

// EquirippleFilterKernel[{0, 0.05*π}, { 0.1*π, 0.2*π}, { 0.3*π, π}}, 
//      {STOPband, PASSband, STOPband}}, 43] with π = sampFreq/2 & 43 coefficients
const youngBPFilter = 
suR([0.0152455,0.0372391,0.0167843,0.0188983,0.00176545,-0.0079223,-0.0135453,-0.00775344,0.00419412,0.0156094,0.0165927,0.00195226,-0.0274134,-0.0623665,-0.0899674,-0.0974055,-0.0781374,-0.0336456,0.0257054,0.0850691,0.128413,0.144367,0.128413,0.0850691,0.0257054,-0.0336456,-0.0781374,-0.0974055,-0.0899674,-0.0623665,-0.0274134,0.00195226,0.0165927,0.0156094,0.00419412,-0.00775344,-0.0135453,-0.0079223,0.00176545,0.0188983,0.0167843,0.0372391,0.0152455]);

// EquirippleFilterKernel[{0, 0.04*π}, { 0.055*π, 0.1*π}, { 0.2*π, π}}, 
// {STOPband, PASSband, STOPband}}, 61] with π = sampFreq/2 & 61 coefficients
const youngBPFilterAlt = 
suR([0.0348525,0.113675,0.0482311,0.0695378,0.0437489,0.0161336,-0.0233674,-0.0623047,-0.0934313,-0.107907,-0.100381,-0.0697888,-0.0205995,0.0376252,0.0923457,0.130074,0.139871,0.116267,0.0608118,-0.017554,-0.103855,-0.180116,-0.22872,-0.236978,-0.199589,-0.120608,-0.0128361,0.10444,0.20924,0.281599,0.307356,0.281599,0.20924,0.10444,-0.0128361,-0.120608,-0.199589,-0.236978,-0.22872,-0.180116,-0.103855,-0.017554,0.0608118,0.116267,0.139871,0.130074,0.0923457,0.0376252,-0.0205995,-0.0697888,-0.100381,-0.107907,-0.0934313,-0.0623047,-0.0233674,0.0161336,0.0437489,0.0695378,0.0482311,0.113675,0.0348525]);

// EquirippleFilterKernel[{{{0,0.2*π}, {.25*π, π}}, 
// {STOPband, PASSband}}, 43] with π = sampFreq/2 & 43 coefficients
const youngHPFilter = 
suR([-0.00301318,-0.0334262,-0.00655957,-0.00213755,0.00724907,0.0144713,0.0155009,0.00841314,-0.00480427,-0.0184909,-0.0254566,-0.0202915,-0.00254728,0.0219084,0.0420527,0.0455796,0.023733,-0.0241999,-0.0896421,-0.156564,-0.206513,0.775007,-0.206513,-0.156564,-0.0896421,-0.0241999,0.023733,0.0455796,0.0420527,0.0219084,-0.00254728,-0.0202915,-0.0254566,-0.0184909,-0.00480427,0.00841314,0.0155009,0.0144713,0.00724907,-0.00213755,-0.00655957,-0.0334262,-0.00301318]);

// EquirippleFilterKernel[{{{0, π/16}, {π/12, π}}, {STOPband,PASSband}}, 61] 
// with π = sampFreq/2 & 61 coefficients
const youngHPFilterAlt = 
suR([-0.0644893, 0.00974873, 0.0100225, 0.0108104, 0.0119904, 0.0133976, 0.0148831, 0.0162603, 0.0174395, 0.0181487, 0.0183567, 0.0178745, 0.0166479, 0.0145391, 0.011564, 0.00767171, 0.00294418, -0.00259433, -0.00879977, -0.0155832, -0.0227098, -0.0300814, -0.0374087, -0.0445778, -0.0512997, -0.0574646, -0.0626681, -0.0668771, -0.0701276, -0.0720023, 0.92731, -0.0720023, -0.0701276, -0.0668771, -0.0626681, -0.0574646, -0.0512997, -0.0445778, -0.0374087, -0.0300814, -0.0227098, -0.0155832, -0.00879977, -0.00259433, 0.00294418, 0.00767171, 0.011564, 0.0145391, 0.0166479, 0.0178745, 0.0183567, 0.0181487, 0.0174395, 0.0162603, 0.0148831, 0.0133976, 0.0119904, 0.0108104, 0.0100225, 0.00974873, -0.0644893]);

// EquirippleFilterKernel[{{{0, 0.1*π}, {0.25*π, 0.35*π}, {.55*π, π}}, 
// {PASSband, STOPband, PASSband}}, 43] with π = sampFreq/2 & 43 coefficients
const youngNotchFilter = 
suR([0.0267278,0.034335,0.0147894,0.0149026,-0.00898222,-0.0115688,-0.0168797,-0.00661083,-0.0056736,-0.0103129,-0.0302324,-0.0482357,-0.052938,-0.0278547,0.0220606,0.0798602,0.11501,0.105619,0.0475196,-0.0369837,-0.111408,0.859346,-0.111408,-0.0369837,0.0475196,0.105619,0.11501,0.0798602,0.0220606,-0.0278547,-0.052938,-0.0482357,-0.0302324,-0.0103129,-0.0056736,-0.00661083,-0.0168797,-0.0115688,-0.00898222,0.0149026,0.0147894,0.034335,0.0267278]);

// EquirippleFilterKernel[{{{0, π/16}, {π/12, π/8}, {π/6, π}}, 
// {PASSband, STOPband, PASSband}}, 61] with π = sampFreq/2 & 61 coefficients
const youngNotchFilterAlt = 
suR([0.0604235, -0.0246467, -0.017583, -0.0111661, -0.00626241, -0.00348763, -0.00325337, -0.00554827, -0.0100825, -0.0160663, -0.0224736, -0.0279485, -0.0312526, -0.031114, -0.0267906, -0.0180248, -0.0052533, 0.0102791, 0.0266491, 0.0416072, 0.0528939, 0.0584756, 0.0568989, 0.0476166, 0.0316257, 0.0104345, -0.0133281, -0.0363746, -0.0557166, -0.0684755, 0.92701, -0.0684755, -0.0557166, -0.0363746, -0.0133281, 0.0104345, 0.0316257, 0.0476166, 0.0568989, 0.0584756, 0.0528939, 0.0416072, 0.0266491, 0.0102791, -0.0052533, -0.0180248, -0.0267906, -0.031114, -0.0312526, -0.0279485, -0.0224736, -0.0160663, -0.0100825, -0.00554827, -0.00325337, -0.00348763, -0.00626241, -0.0111661, -0.017583, -0.0246467, 0.0604235]);

// EquirippleFilterKernel[{"Differentiator", {{0, π}}, {PASSband}}, 43] with π = sampFreq/2 & 43 coefficients
const youngDerivFilter = 
suR([0.0701528,-0.0862785,0.0251206,-0.0159789,0.0134707,-0.012734,0.0126871,-0.0130001,0.0135774,-0.0143798,0.0154115,-0.0167443,0.018335,-0.0204765,0.0233466,-0.0270312,0.0322177,-0.0400577,0.0532393,-0.0797112,0.159218,0,-0.159218,0.0797112,-0.0532393,0.0400577,-0.0322177,0.0270312,-0.0233466,0.0204765,-0.018335,0.0167443,-0.0154115,0.0143798,-0.0135774,0.0130001,-0.0126871,0.012734,-0.0134707,0.0159789,-0.0251206,0.0862785,-0.0701528]);


// ****************************************************************
// For 1D signals
// checked Wednesday, 21 December 2016
// modified Monday, 5 August 2019

function signalChoiceList(length,type)
	{
	var myLength = oddQ(length) ? 2*(length + 1) : 2*length;
	var signal = createArray(myLength);
	var signala = createArray(myLength/2);
	var signalb = createArray(myLength/2);
	let z = 0;

	switch(type)
		{
			case 0: // constant
				for (var i = 0; i < myLength; i += 2)
					{
					signal[i] = 1;
					signal[i+1] = 0;
					};
				break;
			case 1: // linearRamp(n)
				for (var i = 0; i < myLength; i += 2)
					{
					signal[i] = i/2;
					signal[i+1] = 0;
					};
				break;
			case 2: // sqrt(n)
				for (var i = 0; i < myLength; i += 2)
					{
					signal[i] = Math.sqrt(i/2);
					signal[i+1] = 0;
					};
				break;
			case 3: // n^2
				for (var i = 0; i < myLength; i += 2)
					{
					signal[i] = i*i/4;
					signal[i+1] = 0;
					};
				break;
			case 4: // e^(-n)
				let tau = 100; // in [ms]
				let n0 = (sampFreq/1000)*tau
				for (var i = 0; i < myLength; i += 2)
					{
					signal[i] = Math.exp(-i/n0);
					signal[i+1] = 0;
					};
				break;
			case 5: // step+discontinuity+ramp(n)
				for (var i = 0; i < myLength >> 1; i += 2)
					{
					signala[i] = 1;
					signala[i+1] = 0;
					};
				for (var i = 0; i < myLength >> 1; i += 2)
					{
					signalb[i] = (3*i/myLength) + 1.25;
					signalb[i+1] = 0;
					};
				signal = signala.concat(signalb);
				break;
			case 6: // Gauss(n | myLength/2,myLength/4) 
				for (var i = 0; i < myLength; i += 2)
					{
					z = ((i - myLength/2)/(myLength/4))**2;
					signal[i] = Math.exp(-z);
					signal[i+1] = 0;
					};
				break;
			case 7: // Sin(2πf0*i/sampFreq) or ...
				let f0 = 2;
				let z0 = (2*Math.PI*f0/myLength);
				for (var i = 0; i < myLength; i += 2)
					{
					signal[i] = Math.sin(z0*i/2); // because i += 2
					signal[i+1] = 0;
					};
				break;
			default:
				throw("Non-existent signal choice");
		};
	return signal;
	};


// ****************************************************************
// Compute running sum of absolute value of a COMPLEX signal |x[n]| to identify
// where the signal begins. Even if the signal is 2D it will be treated as 1D.
// For signals in real (not universal) format) use "runningSumNormalizeReal"
// checked Monday, 9 January 2017

function runningSumNormalize(data)
	{
	var myData = abs(flatten(data));
	var rSum = createArray(myData.length);
	
	rSum[0] = myData[0];
	rSum[1] = 0;
	for (var i = 2; i < rSum.length; i += 2)
		{
		rSum[i] = rSum[i-2] + myData[i];
		rSum[i+1] = 0;
		};
	
	// the max value will be at the end of the array
	var newMax = rSum[rSum.length -2];
	for (var i = 0; i < rSum.length; i += 2) rSum[i] /= newMax;

	return rSum;
	};

// ****************************************************************
// Compute running sum of a real, non-universal format, 1D signal data[n]
// For signals in universal (not real) format) use "runningSumNormalize"

// checked Monday, 23 March 2020

function runningSumReal(data)
	{
	var myData = data.slice();
	var rSum = Array(myData.length).fill(0);
	
	rSum[0] = myData[0];
	for (var i = 1; i < rSum.length; i++) rSum[i] = rSum[i-1] + myData[i];
	return rSum;
	};

function runningSumNormalizeReal(data)
	{
	var rSum = runningSumReal(data);
	
	// the max value will be at the end of the array
	var newMax = rSum[rSum.length - 1];
	for (var i = 0; i < rSum.length; i++) rSum[i] /= newMax;
	return rSum;
	};


// ****************************************************************
// Starting at the nth position in the list find the first value that ≥ p.
// then return the position i and the value data[i]. The position
// is based upon a 1D signal. The signal will first be processed with
// runningSumNormalize(). Note 1 ≤ n ≤ list.length and 0 ≤ p ≤ 1
// checked Monday, 9 January 2017

function select(data,n,p)
	{
	var temp = runningSumNormalizeReal(data);
	var plocal = 0;
	if(p < 0 ) plocal = 0
	else if(p > 1 ) plocal = 1
	else plocal = p;
	
	for (var i = n; i < temp.length; i++)
		if(temp[i] >= plocal) return [i,data[i]];
	return false;
	};


// ****************************************************************
// Starting at the nth position in the list find the FIRST value in
// the 1D (universal) signal that matches the "element" provided.
// Note 1 ≤ n < list.length
// checked Monday, 9 January 2017
// modified Sunday, 28 June 2020

function position(data,n,element)
	{
	var temp = data.slice();
	
	for (var i = 2*(n - 1); i < 2*temp.length; i += 2)
		if(temp[i] === element) return i >> 1;
	return false;
	};


// ****************************************************************
// Starting at the 1st pixel in the 2D REAL image, find all the values
// in the image that match the "element" provided.
// Return the list of positions
// checked Tuesday, 10 January 2017
// checked Wednesday, 29 November 2017

function pixelValuePositions(data,element)
	{
	let cols = data[0][1];
	let dataT = data[1];
	let coords = [];
	let rtemp = 0;
	let ctemp = 0;
	for (let i = 0; i < dataT.length; i += 2)
		if(dataT[i] == element) 
			{ // how to turn linear index into 2D index
			ctemp = (i/2) % cols;
			rtemp = Math.floor((i/2) / cols);
			coords.push([rtemp,ctemp]);
			};
	return coords;
	};


// ****************************************************************
// get a list of prime factors of a number
// based upon <http://www.javascripter.net/math/primes/factorization.htm>
// checked Tuesday, 10 January 2017

function factor(n,result)
	{
	if (isNaN(n) || !isFinite(n) || n%1!=0 || n==0)
		return [0];
	if (n < 0)
		return factor(-n,result);
	var minFactor = leastFactor(n);
	var myLength = result.push(minFactor);
	if (n == minFactor)
		{
		return result;
		}
	else
		{
		return factor(n/minFactor,result);
		};
	};

// find the least factor in n by trial division
function leastFactor(n)
	{
	if (isNaN(n) || !isFinite(n)) return NaN; 
	if (n==0) return 0;
	if (n%1 || n*n<2) return 1;
	if (n%2==0) return 2;
	if (n%3==0) return 3;
	if (n%5==0) return 5;
	var m = Math.sqrt(n);
	for (var i=7;i<=m;i+=30)
		{
		if (n%i==0) return i;
		if (n%(i+4)==0) return i+4;
		if (n%(i+6)==0) return i+6;
		if (n%(i+10)==0) return i+10;
		if (n%(i+12)==0) return i+12;
		if (n%(i+16)==0) return i+16;
		if (n%(i+22)==0) return i+22;
		if (n%(i+24)==0) return i+24;
		}
	return n;
	}

// Based upon Mathematica's FactorInteger function. Given a number n itemp
// returns the prime factors and the number of times each factor is involved
// For example, if n = 90 then calling factorInteger(factor(n,result)) returns
// the array is primes = [[2,1],[3,2],[5,1]]

function factorInteger(factors)
	{
	var uniqPrimes = [];
	var powerPrimes = [];
	var uniq = factors[0];
	var primes = [];
	var i = 0;
	var count = 1;
	
	for(i = 1; i < factors.length; i++)
		{
		if(factors[i] == uniq)
			{
			count++;
			}
		else
			{
			uniqPrimes.push(uniq);
			powerPrimes.push(count);
			uniq = factors[i];
			count = 1;
			};
		};
		
	// close down gracefully
	i--;
	uniqPrimes.push(factors[i]);
	if(factors[i] == factors[i-1])
		{
		powerPrimes.push(count);
		}
	else
		{
		powerPrimes.push(1);
		};

	// reproduce Mathematica format
	for (var i = 0; i < uniqPrimes.length; i++)
		{
		primes.push([uniqPrimes[i],powerPrimes[i]]);
		};
	return primes;
	};


// ****************************************************************
// Window functions for spectral estimation
// window functions are even and non-zero over the interval |t| <= 1
// For windows where it is relevant a typical value of sigma is 1/4.
// checked Tuesday, 10 January 2017

// Block (rectangular) window

function block(t,sigma)
	{
	if ( t < -1 || t > 1)
		return 0;
	else
		return 1;
	};
	
// Bartlett (triangular) window
function bartlett(t,sigma)
	{
	if ( t < -1 || t > 1)
		return 0;
	else
		return 1 - Math.abs(t);
	};
	
// Parzen (parabolic) window
function parzen(t,sigma)
	{
	if ( t < -1 || t > 1)
		return 0;
	else
		return 1 - (t*t);
	};
	
// Truncated Gaussian window
function truncGauss(t,sigma)
	{
	if ( t < -1 || t > 1)
		return 0;
	else
		return Math.exp(-(t*t)/(2*sigma*sigma));
	};
	
// Truncated Verbeek window
function truncVerbeek(t,sigma)
	{
	if ( t < -1 || t > 1)
		return 0;
	else
		{
		var z = (t*t)/(2*sigma*sigma);
		return (1 + z + (z*z) / 2) * Math.exp(-z);
		};
	};
	
// Tukey window
function tukey(t,sigma)
	{
	if ( t < -1 || t > 1)
		return 0;
	else
		return (1 + Math.cos(t * Math.PI)) / 2;
	};
	
// Hamming window
function hamming(t,sigma)
	{
	if ( t < -1 || t > 1)
		return 0;
	else
		return (0.54 + 0.46 * Math.cos(t * Math.PI));
	};
	
// Hann window
function hann(t,sigma)
	{
	if ( t < -1 || t > 1)
		return 0;
	else
		return Math.cos(t * Math.PI / 2);
	};
	
// Young window
function young(t,sigma)
	{
	if ( t < -1 || t > 1)
		return 0;
	else
		return Math.E * Math.exp(-1 / (1 - (t * t)));
	};
	
// Ideal Gaussian window
function idealGauss(t,sigma)
	{
	return Math.exp(-(t*t)/(2*sigma*sigma));
	};


// ****************************************************************
// Following is based upon Mathematica's procedure RecurrenceFilter.
// The data is filtered by a linear, constant coefficient difference equation.
// The left coefficients represent the recursion part on the output "y". Th
// right coefficients represent the FIR part on the input "x". Note that setiing
// leftCoeffs = [1] means that no recursion will take place and the entire
// procedure is just a FIR filter.
//
// The following assumptions are made: 1) procedure is intended for 1D data;
// 2) x is causal; 3) leftCoeffs[0] ≠ 0; 4) y[n] = 0 for n < 0,
// 5) the coefficients and the data are real.
// checked Thursday, 22 December 2016

function recurrenceFilter(coefficients, data)
	{
	var leftCoeffs = coefficients[0].slice();
	var rightCoeffs = coefficients[1].slice();
	var x = data.slice();
	var leftLength = leftCoeffs.length;
	var rightLength = rightCoeffs.length;
	var xLength = x.length;
	
	// make coefficient of y[n] = 1
	var normCoeff = leftCoeffs[0];
	for (var i = 0; i < leftLength; i += 2) leftCoeffs[i] /= normCoeff;
	for (var i = 0; i < rightLength; i += 2) rightCoeffs[i] /= normCoeff;
	
	// this is the output data array
	var y = createArray(xLength);
	for (var i = 0; i < xLength; i++) y[i] = 0;
		
	var causal = 0;
	var temp = 0;
	if(leftLength == 2) // This is a simple FIR filter, no recursion
		{
		for (var n = 0; n < xLength; n += 2)
			{
			for (var i = 0; i < rightLength; i += 2)
				{
				causal = n-i;
				if (causal < 0) temp = 0
				else temp = x[causal];
				y[n] += (rightCoeffs[i] * temp);
				};
			};
		}
	else // This is the whole nine yards, i.e. recursion
		{
		for (var n = 0; n < xLength; n += 2)
			{
			for (var i = 0; i < rightLength; i += 2)
				{
				causal = n-i;
				if (causal < 0) temp = 0
				else temp = x[causal];
				y[n] += (rightCoeffs[i] * temp);
				};
			for (var i = 2; i < leftLength; i += 2)
				{
				causal = n-i;
				if (causal < 0) temp = 0
				else temp = y[causal];
				y[n] -= (leftCoeffs[i] * temp);
				};
			};
		};
	return y;
	};


// ****************************************************************
// Following are probability density functions used in a number of places.

function normSkellam(k,m1,m2)
	{
	let b = bessI(Math.abs(k),2*Math.sqrt(m1*m2));
	return Math.exp(-(m1+m2))*((m1/m2)**(k/2))*b;
	};
	
function normLaplace(t,sigma)
	{
	return Math.exp(-Math.abs(t)/(sigma/Math.SQRT2))/(sigma*Math.SQRT2);
	};
	
function normGauss(t,sigma)
	{
	return Math.exp(-(t*t)/(2*sigma*sigma))/(Math.sqrt(2*Math.PI)*sigma);
	};
	
function bivariateGauss(x,sigmaX, y,sigmaY)
	{
	return normGauss(x,sigmaX)*normGauss(y,sigmaY);
	};
	
function dXGauss(x,sigmaX, y,sigmaY) // derivative in x direction
	{
	return -x*bivariateGauss(x,sigmaX, y,sigmaY)/(sigmaX*sigmaX);
	};
	
function dYGauss(x,sigmaX, y,sigmaY) // derivative in y direction
	{
	return -y*bivariateGauss(x,sigmaX, y,sigmaY)/(sigmaY*sigmaY);
	};
	
function dXYGauss(x,sigmaX, y,sigmaY) // derivative in x and y directions
	{
	return x*y*bivariateGauss(x,sigmaX, y,sigmaY)/(sigmaX*sigmaX*sigmaY*sigmaY);
	};
	
// ****************************************************************
// Following is based upon Mathematica's procedure GaussianMatrix.
// a matrix is produced of dimensions (2n+1) x (2n+1) with the center
// at (n+1, n+1). values are the bivariate Gaussian with a standard
// deviation of s. Normally, s = n. The values are chosen so that the
// area under the bivariate Gaussian is 1.

// Normalized Gaussians and derivatives
// checked Thursday, 22 December 2016
// fixed Tuesday, 23 January 2018
// added normLaplace to be used in statistical modeling Friday, 31 May 2019

function gaussianMatrix(rows , cols, s, derivatives)
	{
	if (evenQ(rows) || evenQ(cols)) throw("gaussianMatrix: ROWS and COLS must both be odd.");
	var mx = (cols-1)/2;
	var my = (rows-1)/2;
	// Note column-to-column is the x direction,
	// row-to-row is the y direction
	var gaussImage = createArray(cols,rows);
	// the Gauss image is real but we must create an imaginary part
	var zeroes = createArray(cols*rows);
	zeroes.fill(0);
	
	switch(derivatives)
		{
		case "None": // no derivative
			var ttotal = 0;
			var temp = 0;
			for (var i = 0; i < rows; i++)
				for (var j = 0; j < cols; j++)
					{
					temp = bivariateGauss((i-mx),s,(j-my),s);
					gaussImage[j][i] = temp;
					ttotal += temp;
					};
			// normalize area under Gauss to one (following Mathematica)
			for (var i = 0; i < rows; i++)
				for (var j = 0; j < cols; j++)
					gaussImage[j][i] /= ttotal;
			break;
		case "x": // derivative in x direction
			for (var i = 0; i < rows; i++)
				for (var j = 0; j < cols; j++)
					gaussImage[j][i] = dXGauss((i-mx),s,(j-my),s);
			break;
		case "y": // derivative in y direction
			for (var i = 0; i < rows; i++)
				for (var j = 0; j < cols; j++)
					gaussImage[j][i] = dYGauss((i-mx),s,(j-my),s);
			break;
		case "xy": // derivative in x & y directions
			for (var i = 0; i < rows; i++)
				for (var j = 0; j < cols; j++)
					gaussImage[j][i] = dXYGauss((i-mx),s,(j-my),s);
			break;
		default:
			throw("Non-existent derivative choice");
		};
	var dims = [rows,cols];
	var vFormat = merge([flatten(gaussImage),zeroes],[zeroes.length]);
	var kernFormat = [dims, vFormat];
	return kernFormat;
	};


/// ****************************************************************
// Transpose of a row vector (1D array of nn = [1,n]) into a column vector
// array of nn = [n,1]. Because the elements of the vector are complex,
// the length of the vector must be EVEN.
// For applicability, see test program
// checked Tuesday, 10 January 2017

function vTranspose(v)
	{
	var vLength = (v.length)/2;
	return [[vLength,1],v]; 
	};


/// ****************************************************************
// Outer product of a column vector vt (N x 1) and a row vector u (1 x M)
// to produce a matrix that is (N x M)
// type can be 1D of real or complex numbers
// checked Tuesday, 10 January 2017

function vOuter(v,u)
	{
	var vLength = v.length;
	var uLength = u.length;
	var matrix = [];
	var mNN = [vLength/2, uLength/2];
	
	for (var i = 0; i < vLength; i += 2)
		{
		for (var j = 0; j < uLength; j += 2)
			{
			var r1 = v[i];
			var i1 = v[i+1];
			var r2 = u[j];
			var i2 = u[j+1];
			rx = (r1*r2 - i1*i2);
			ix = (i1*r2 + r1*i2);
			matrix.push(rx,ix);
			};
		};
	return [mNN, matrix]; 
	};


// ****************************************************************
// Following is based upon Mathematica's procedures ListConvolve and
// ListCorrelate. The length of the output equals the length of the input signal
// but zero-padding and cyclic indexing are used to get the intuitive result.
// The following assumptions are made: 1) this procedure is intended for
// 1D data and 2) the input is causal.
//
// checked Tuesday, 10 January 2017

function listCorrelate(kernel, data)
	{
	let temp1 = listConvolve(reverse(kernel), data);
	let temp2 = reverse(temp1);
	return temp2;
	};
	
	
function listConvolve(filter, data)
	{
	var fLength = filter.length;
	var input = data.slice();
	var origLength = input.length;
	var iLength = origLength;
	// zero-pad the input array with the length of the filter array
	// the new input length = original input length + filter length
	for (var i = 0; i < fLength; i++)
		iLength = input.push(0);
	// but don't zero-pad the output array
	var output = Array(origLength).fill(0);
	var tempr = 0;
	var tempi = 0;
	var index = 0;
	var ir = 0;
	var ii = 0;
	var fr = 0;
	var fi = 0;
	// This is the convolution
	for (var j = 0; j < iLength; j += 2)
		{
		output[j] = 0;
		output[j+1] = 0;
		tempr = 0;
		tempi = 0;
		for (var i = 0; i < fLength; i += 2)
			{
			index = j-i; // cyclic index
			while ( index < 0 ) index += iLength;
			
			ir = input[index];
			ii = input[index+1];
			
			fr = filter[i];
			fi = filter[i+1];
			
			tempr += ( ir*fr - ii*fi );
			tempi += ( ii*fr + ir*fi );
			};
		output[j] = tempr;
		output[j+1] = tempi;
		};
	return output;
	};


// ****************************************************************
// Following is based upon Mathematica's procedure ArrayPad. Padding
// is added to the END of a 1D (complex) signal. For a 1D signal, the "signal"
// is just a list of complex values in the "universal" format.
// "padding" refers to the number of complex values to be appended to the
// kernel and "value" is the complex value that is to be appended.

// checked Thursday, 23 February 2017

function arrayPad(signal, padding, padvalue)
	{
	var tail = [];
	for (var i = 0; i < padding; i++)
		tail.push(padvalue[0],padvalue[1]); // build a tail of constant complex values
		
	return signal.concat(tail); // return padded array in 1D universal format
	};


// ****************************************************************
// Following is based upon Mathematica's procedures ListConvolve and
// ListCorrelate. The length of the output equals the length of the input
// signal but padding and cyclic indexing are used to get the intuitive
// result. The following assumptions are made:
// 1) This procedure is intended for 2D data in the "universal" format;
// 2) The padded value is complex "padvalue", usually [0, 0].
// 3) Padding is to the right and bottom of the 2D array.
// 4) The size of the padding is derived from the kernel size which is
// (2n+1) x (2n+1) with the center at (n+1, n+1).
//
// Remember, "kernel" is a package
//		   kernel[0] = [rows,cols]
//		   kernel[1] = [complex coefficients in a 1D list]
//
// checked Friday, 24 February 2017

function listCorrelate2D(kernel, xnn, x)
	{
	var fnn = kernel[0];
	var frows = fnn[0];
	var fcols = fnn[1];
	var ufrows = 2*frows;
	var h1 = createArray(ufrows,fcols); // flipped correlation filter
	var filter = split(kernel[1],fnn); // reformat to special 2D
	// flipping from h[i,j] to h[-i,-j]
	for (var j = 0; j < fcols; j++)
		{
		for (var i = 0; i < ufrows; i += 2) // the real part
			h1[i][j] = filter[ufrows-i-2][fcols-j-1];
		for (var i = 1; i < ufrows; i += 2) // the imaginary part
			h1[i][j] = filter[ufrows-i][fcols-j-1];
		};
	var h = merge(h1,fnn); // flipped correlation filter
	var result0 = listConvolve2D([fnn,h], xnn, x);
	return dataRotate(result0,xnn,xnn[0]-fnn[0]+1,xnn[1]-fnn[1]+1);
	};
	
function listConvolve2D(kernel, xnn, x)
	{
	var fnn = kernel[0];
	var frows = fnn[0];
	var ufrows = 2*frows; // universal format
	var fcols = fnn[1];
	var filter = split(kernel[1],fnn);
	
	var xrows = xnn[0];
	var uxrows = 2*xrows;
	var xcols = xnn[1];
	var input = split(x,xnn); // reformat to special 2D
	
	// zero-pad the input array with 2D size of filter array
	var padvalue = [0, 0];
	var padded = imagePad(fnn, [xnn, x], padvalue);
	var pdims = padded[0];
	var pInput = split(padded[1],pdims); // return to special 2D format
	
	// but don't zero-pad the output array
	var out = Array(uxrows*xcols);
	out.fill(0); // initialize
	var odims = [xrows, xcols];
	var output = split(out, odims); // reformat to special 2D

	var tempr = 0;
	var tempi = 0;
	var rCyc = 2*(xrows + frows);
	var cCyc = xcols + fcols;
	var rindex = 0; // rows index
	var cindex = 0; // column index
	var pr = 0; // padded real
	var pi = 0; // padded imaginary
	var fr = 0; // filter real
	var fi = 0; // filter imaginary
	
	// This is the convolution
	for (var r = 0; r < uxrows; r += 2) // through complex image rows
		{
		for (var c = 0; c < xcols; c++) // through image columns
			{
			tempr = 0;
			tempi = 0;
			for (var i = 0; i < ufrows; i += 2) // through filter rows
				{
				for (var j = 0; j < fcols; j++) // through filter columns
					{
					rindex = (r-i); // cyclic index
					if ( rindex < 0 ) rindex += rCyc; // special 2D complex format!
					cindex = (c-j); // cyclic index
					if ( cindex < 0 ) cindex += cCyc;
					
					pr = pInput[rindex][cindex];
					pi = pInput[rindex+1][cindex];
					
					fr = filter[i][j];
					fi = filter[i+1][j];
					
					tempr += ( pr*fr - pi*fi );
					tempi += ( pi*fr + pr*fi );
					};
				};
			output[r][c] = tempr;
			output[r+1][c] = tempi;
			};
		};
	return merge(output,odims);
	};


// ****************************************************************

function imagePad(fnn, image, padvalue)
	{
	var frows = fnn[0];
	var fcols = fnn[1];
	
	var xrows = image[0][0];
	var xcols = image[0][1];
	var input = split(image[1],image[0]); // reformat to special 2D
	
	// zero-pad the input array with 2D size of filter array
	var pLength = (xrows + frows)*(xcols + fcols); // the new size
	var padded = Array(2*pLength); // create array
	
	var rePart = padvalue[0];
	var imPart = padvalue[1];
	
	for (var j = 0; j < 2*pLength; j += 2)
		{
		padded[j] = rePart; // initialize real values
		padded[j+1] = imPart; // initialize imaginary values
		};
		
	var pdims = [(xrows + frows),(xcols + fcols)]; // 2D dimensions
	var pInput = split(padded, pdims); // reformat to special 2D
	
	// the reformatting was done to make the following addressing easier
	for (var j = 0; j < 2*xrows; j++)
		for (var i = 0; i < xcols; i++)
			pInput[j][i] = input[j][i]; // copy smaller array to larger array	
	return [pdims, merge(pInput,pdims)]; // return universal format
	};

function zeroPad1D(array)
	{
	// assuming a real array that is NOT in universal format
	// simply, one real value after another
	
	var length = array.length;
	if (oddQ(length)) length--; // make it even length
	
	let tempArray = Array(2*length).fill(0);
	let start = length >> 1;
	let stop = start + length;
	for (var i = start; i < stop; i++)
		tempArray[i] = array[i-start];
	return tempArray; // return real format
	};


// ****************************************************************
// We want to multiply two Fourier spectra to achieve frequency domain
// filtering. Or we want to multiply two time (space) signals to achieve
// modulation. This procedure realizes this for complex arrays. These
// arrays must have the same length, niet waar?
//
// Checked Tuesday, 10 January 2017

function filterMult(array1, array2)
	{
	var nn1 = arrayDimension(array1);
	var nn2 = arrayDimension(array2);
	
	var ndim1 = nn1.length;
	var ndim2 = nn2.length;
	if ((ndim1 !== 1) || (ndim2 !== 1))
		throw "filterMult: Arrays must be in universal format!";

	var length1 = nn1[0];
	var length2 = nn2[0];
	if (length1 !== length2) throw "Arrays must have same length!";
	
	var output = Array(length1)
	
	var a1r = 0; // array 1 real
	var a1i = 0; // array 1 imaginary
	var a2r = 0; // array 2 real
	var a2i = 0; // array 2 imaginary

	for (var i = 0; i < length1; i += 2)
		{
		a1r = array1[i];
		a1i = array1[i+1];
		
		a2r = array2[i];
		a2i = array2[i+1];
		
		output[i] = a1r*a2r - a1i*a2i;
		output[i+1] = a1i*a2r + a1r*a2i;
		};
	return output;
	};


// ****************************************************************
// To produce of copy a multi-dimensional array we use a recursive
// routine clone found at <http://stackoverflow.com/questions/2294703/multidimensional-array-cloning-using-javascript>
// correct usage is: var output = input.clone()
//
// Checked Tuesday, 10 January 2017

function clone(inputArray)
	{
	var nn = arrayDimension(inputArray);
	var ndim = nn.length;
	var rows = 1; // default is 1D signal
	var cols = 0;
	if (ndim === 1)
		cols = nn[0];
	else if (ndim === 2)
		{
		rows = nn[0]; // but for 2D signal use this
		cols = nn[1];
		}
	else
		throw "clone: Wrong number of dimensions!";

	var outputArray = createArray(rows,cols)
	for (var i = 0; i < rows; i++)
		{
		for (var j = 0; j < cols; j++)
			{
			outputArray[i][j] = inputArray[i][j];
			};
		};
	return outputArray;
	};


// ****************************************************************
// To fit data (x) to a function with parameters (a,b), (e.g. f(x) = ax + b).
// we use the Levenberg-Marquardt algorithm. This implementation comes from:
// <https://github.com/mljs/levenberg-marquardt>.
// 
// correct usage is: var output = input.clone()
//
// Checked 


// const Matrix = require('ml-matrix');

// Difference of the matrix function over the parameters
//
// @param {{x:Array<number>, y:Array<number>}} data - Array of points to
// fit in the format [x1, x2, ... ], [y1, y2, ... ]
// @param {Array<number>} params - Array of previous parameter values
// @param {number} gradientDifference - Adjustment for decrease the damping parameter
// @param {function} paramFunction - The parameters and returns a function
// with the independent variable as a parameter
// @return {Matrix}
//

function gradientFunction(data, params, gradientDifference, paramFunction)
	{
	'use strict';
	const n = paramFunction.length;
	const m = data.x.length;

	var ans = new Array(n);
	const func = paramFunction(...params);

	for (var param = 0; param < n; param++)
		{
		ans[param] = new Array(m);
		
		var auxParams = params.concat();
		auxParams[param] += gradientDifference;
		var funcParam = paramFunction(...auxParams);
		
		for (var point = 0; point < m; point++)
			{
			ans[param][point] = func(data.x[point]) - funcParam(data.x[point]);
			};
		};
	return new Matrix(ans);
	};


// ****************************************************************
// Matrix function over the samples
// @ignore
// @param {{x:Array<number>, y:Array<number>}} data - Array of points to
// fit in the format [x1, x2, ... ], [y1, y2, ... ]
// @param {Array<number>} params - Array of previous parameter values
// @param {function} paramFunction - The parameters and returns a function
// with the independent variable as a parameter
// @return {Matrix}
//

function matrixFunction(data, params, paramFunction)
	{
	'use strict';
	const m = data.x.length;

	var ans = new Array(m);
	const func = paramFunction(...params);

	for (var point = 0; point < m; point++)
		{
		ans[point] = data.y[point] - func(data.x[point]);
		};
	return new Matrix([ans]);
	};


// ****************************************************************
// Iteration for Levenberg-Marquardt
// @ignore
// @param {{x:Array<number>, y:Array<number>}} data - Array of points to
// fit in the format [x1, x2, ... ], [y1, y2, ... ]
// @param {Array<number>} params - Array of previous parameter values
// @param {number} damping - Levenberg-Marquardt parameter
// @param {number} gradientDifference - Adjustment for decrease the damping parameter
// @param {function} parameterizedFunction - The parameters and returns a function
// with the independent variable as a parameter
// @return {Array<number>}
//

function step(data, params, damping, gradientDifference, parameterizedFunction)
	{
	'use strict';
	var identity = Matrix.eye(parameterizedFunction.length)
		.mul(damping * gradientDifference * gradientDifference);
	var gradientFunc = gradientFunction
		(data, params, gradientDifference, parameterizedFunction);
	var matrixFunc = matrixFunction(data, params, parameterizedFunction).transpose();
	params = new Matrix([params]);

	var inverse = Matrix.inv(identity.add(gradientFunc.mmul(gradientFunc.transposeView())));
	params = params.sub
		(
((inverse.mmul(gradientFunc)).mmul(matrixFunc).mul(gradientDifference)).transposeView()
		);
	return params.to1DArray();
	};


// ****************************************************************
// Calculate current error
// @ignore
// @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit
// in the format [x1, x2, ... ], [y1, y2, ... ]
// @param {Array<number>} parameters - Array of current parameter values
// @param {function} parameterizedFunction - The parameters and returns a function
// with the independent variable as a parameter
// @return {number}
//

function errorCalculation(data, parameters, parameterizedFunction)
	{
	'use strict';
	var error = 0;
	const func = parameterizedFunction(...parameters);

	for (var i = 0; i < data.x.length; i++)
		{
		error += Math.abs(data.y[i] - func(data.x[i]));
		};
	return error;
	};


const defaultOptions =
	{
	damping: undefined,
	gradientDifference: 10e-2,
	initialValues: undefined,
	maxIterations: 100,
	errorTolerance: 10e-3
	};


// ****************************************************************
// Curve fitting algorithm
// @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit
// in the format [x1, x2, ... ], [y1, y2, ... ]
// @param {function} parameterizedFunction - The parameters and returns a function
// with the independent variable as a parameter
// @param {object} [options] - Options object
// @param {number} [options.damping = undefined] - Levenberg-Marquardt parameter
// @param {number} [options.gradientDifference = 10e-2] - Adjustment for decrease
// of the damping parameter
// @param {Array<number>} [options.initialValues = undefined] - Array of initial
// parameter values
// @param {number} [options.maxIterations = 100] - Maximum of allowed iterations
// @param {number} [options.errorTolerance = 10e-3] - Minimum uncertainty allowed
// for each point
// @return {{parameterValues: Array<number>, parameterError: number, iterations: number}}
//

function levenbergMarquardt(data, parameterizedFunction, options)
	{
	'use strict';
	// verify that damping is not undefined
	if ((!options) || (!options.damping) || (options.damping <= 0))
		{
		throw new TypeError('The damping option should be a positive number');
		};
	
	// assign default values
	options = Object.assign({}, defaultOptions, options);
	
	// fill with default value for initialValues
	if (!options.initialValues)
		{
		options.initialValues = new Array(parameterizedFunction.length);
		
		for (var i = 0; i < parameterizedFunction.length; i++)
			{
			options.initialValues[i] = 1;
			};
		};

	// check that the data have the correct format
	if (!data.x || !data.y)
		{
		throw new TypeError('The data parameter should have a x and y elements');
		}
		else if ((data.x.constructor !== Array) || (data.x.length < 2) ||
			(data.y.constructor !== Array) || (data.y.length < 2))
				{
				throw new TypeError('The data parameter elements should be an array with more than 2 points');
				}

	const dataLen = data.x.length;
	if (dataLen !== data.y.length)
		{
		throw new RangeError('The data parameter elements should have the same size');
		}
	
	// initial parameters
	var parameters = options.initialValues;

	// check errorCalculation
	var error = errorCalculation(data, parameters, parameterizedFunction);
	var converged = error <= options.errorTolerance;

	for (var iteration = 0; (iteration < options.maxIterations) && !converged; iteration++)
		{
		// step function
		parameters = step(data, parameters, options.damping, 
				options.gradientDifference, parameterizedFunction);
		
		// reevaluate errorCalculation
		error = errorCalculation(data, parameters, parameterizedFunction);
		converged = error <= options.errorTolerance;
		};

	// return example
	return	{
			parameterValues: parameters,
			parameterError: error,
			iterations: iteration
			};
	};


// ****************************************************************
// Image measurements based upon the command ImageMeasurements in
// Mathematica v 11.
// This version is for 1D "images" and 2D images. Note that although all
// computed values are scalars, they are returned in the "universal"
// format meaning: [real, imaginary].
//
// Further, for 2D signals there is a restriction. The number of rows MUST
// be a power of two, e.g. rows = 2^7 and the number of columns MUST also be
// a power of two, e,g.columns =  2^8. (See the routine "fourND" in
// "SSPfourier.js" for an explanation.). This means the data.length =
// 2*rows*columns = 2*(2^7)*(2^8) = 2^16. Caveat emptor!
//
// checked: Wednesday, 12 April 2017

function imageMeasurements(image, nn, dataType, drempel)
	{
	var imageInfo =
		{
		type: undefined,				// 'real', 'imaginary', or 'complex'
		rows: undefined,				// e.g. 512
		cols: undefined,				// e.g. 128
		maxIntensity: undefined,		// only for 'real' or 'imaginary'
		minIntensity: undefined,		// only for 'real' or 'imaginary'
		meanIntensity: undefined,		// may be 'complex'
		stndDevIntensity: undefined,	// may be 'complex'
		totalIntensity: undefined,		// may be 'complex'
		energyIntensity: undefined,		// may be 'complex'
		medianIntensity: undefined,		// only for 'real' or 'imaginary'
		threshold: undefined,			// only for 'real'
		area: undefined					// only for 'real'
		};
	
	imageInfo.type = dataType;
	imageInfo.threshold = drempel;
	
	var dims = nn.length;
	imageInfo.rows = 1;
	imageInfo.cols = nn[0];
	if (dims === 2)
		{
		imageInfo.rows = nn[0]
		imageInfo.cols = nn[1];
		};
	
	var dlength = 2*imageInfo.rows*imageInfo.cols;
	var max = -Infinity;
	var min = Infinity;
	
	imageInfo.meanIntensity = mean(image);
	imageInfo.stndDevIntensity = stdev(image);
	imageInfo.totalIntensity = total(image);
	
	if (imageInfo.type === 'real')
		{
		for (let i = 0; i < dlength; i += 2)
			{
			if (image[i] > max) max = image[i];
			if (image[i] < min) min = image[i];
			}
		imageInfo.maxIntensity = [max,0];
		imageInfo.minIntensity = [min,0];
		imageInfo.meanIntensity[1] = 0;
		imageInfo.totalIntensity[1] = 0;
		imageInfo.medianIntensity = median(image);
		};
		
	if (imageInfo.type === 'imaginary')
		{
		for (let i = 1; i < dlength; i += 2)
			{
			if (image[i] > max) max = image[i];
			if (image[i] < min) min = image[i];
			}
		imageInfo.maxIntensity = [0,max];
		imageInfo.minIntensity = [0,min];
		imageInfo.meanIntensity[0] = 0;
		imageInfo.totalIntensity[0] = 0;
		
		let tempdata = image.slice();
		let tempswap = 0;
		for (let i = 0; i < tempdata.length; i += 2)
				{
				// swap real and imaginary parts
				tempswap = tempdata[i];
				tempdata[i] = tempdata[i+1];
				tempdata[i+1] = tempswap;
				}
		let swappedmedian = median(tempdata)
		imageInfo.medianIntensity = [swappedmedian[1], swappedmedian[0]];
		};
		
	if (imageInfo.type === 'complex')
		{
		var value = 0;
		for (let i = 0; i < dlength; i += 2)
			{
			value = Math.hypot(image[i],image[i+1]);
			if (value > max) max = value;
			if (value < min) min = value;
			}
		imageInfo.maxIntensity = [max,0];
		imageInfo.minIntensity = [min,0];
		imageInfo.medianIntensity = undefined;
		};
	
	// energy is the sum of the magnitude-squared complex values
	var energy = 0;
	for (let i = 0; i < dlength; i += 2)
		energy += (Math.pow(image[i],2)+Math.pow(image[i+1],2));
	imageInfo.energyIntensity = [energy,0];
	
	// area = number of samples (complex) whose absolute value > threshold
	var oppervlakte = 0;
	for (let i = 0; i < dlength; i += 2)
		{
		oppervlakte += (Math.hypot(image[i],image[i+1]) > drempel) ? 1 : 0;
		};
	imageInfo.area = [oppervlakte, 0];
	
	return imageInfo;
	};


// ****************************************************************
// Cubic spline taken from
//       http://blog.ivank.net/interpolation-with-cubic-splines.html
// and
//       https://github.com/kuckir/CSPL.js
//
// ity 17 December 2020

function CSPL(){};

CSPL._gaussJ = {};
CSPL._gaussJ.solve = function(A, x) // in Matrix, out solutions
	{
	var m = A.length;
	for(var k=0; k<m; k++) // column
		{
		// pivot for column
		var i_max = 0; var vali = Number.NEGATIVE_INFINITY;
		for(var i=k; i<m; i++) if(Math.abs(A[i][k])>vali) { i_max = i; vali = Math.abs(A[i][k]);}
		CSPL._gaussJ.swapRows(A, k, i_max);
		
		//if(A[k][k] == 0) console.log("matrix is singular!");
		
		// for all rows below pivot
		for(var i=k+1; i<m; i++)
			{
			var cf = (A[i][k] / A[k][k]);
			for(var j=k; j<m+1; j++)  A[i][j] -= A[k][j] * cf;
			}
		}
	
	for(var i=m-1; i>=0; i--) // rows = columns
		{
		var v = A[i][m] / A[i][i];
		x[i] = v;
		for(var j=i-1; j>=0; j--)	// rows
			{
			A[j][m] -= A[j][i] * v;
			A[j][i] = 0;
			}
		}
	}
	
CSPL._gaussJ.zerosMat = function(r,c)
	{
	var A = [];
	for(var i=0; i<r; i++)
		{
		A.push([]);
		for(var j=0; j<c; j++) A[i].push(0);
		}
	return A;
	}

CSPL._gaussJ.printMat = function(A)
	{
	for(var i=0; i<A.length; i++) console.log(A[i]);
	}
	
CSPL._gaussJ.swapRows = function(m, k, l)
	{
	var p = m[k];
	m[k] = m[l];
	m[l] = p;
	}
	
CSPL.getNaturalKs = function(xs, ys, ks) // in x & y values, out k values
	{
	var n = xs.length-1;
	var A = CSPL._gaussJ.zerosMat(n+1, n+2);
		
	for(var i=1; i<n; i++)	// rows
		{
		A[i][i-1] = 1/(xs[i] - xs[i-1]);
		
		A[i][i  ] = 2 * (1/(xs[i] - xs[i-1]) + 1/(xs[i+1] - xs[i])) ;
		
		A[i][i+1] = 1/(xs[i+1] - xs[i]);
		
		A[i][n+1] = 3*( (ys[i]-ys[i-1])/((xs[i] - xs[i-1])*(xs[i] - xs[i-1])) + 
			(ys[i+1]-ys[i])/ ((xs[i+1] - xs[i])*(xs[i+1] - xs[i])) );
		}
	
	A[0][0  ] = 2/(xs[1] - xs[0]);
	A[0][1  ] = 1/(xs[1] - xs[0]);
	A[0][n+1] = 3 * (ys[1] - ys[0]) / ((xs[1]-xs[0])*(xs[1]-xs[0]));
	
	A[n][n-1] = 1/(xs[n] - xs[n-1]);
	A[n][n  ] = 2/(xs[n] - xs[n-1]);
	A[n][n+1] = 3 * (ys[n] - ys[n-1]) / ((xs[n]-xs[n-1])*(xs[n]-xs[n-1]));
		
	CSPL._gaussJ.solve(A, ks);
	}
	
CSPL.evalSpline = function(x, xs, ys, ks)
	{
	var i = 1;
	while(xs[i]<x) i++;
	
	var t = (x - xs[i-1]) / (xs[i] - xs[i-1]);
	
	var a =  ks[i-1]*(xs[i]-xs[i-1]) - (ys[i]-ys[i-1]);
	var b = -ks[i  ]*(xs[i]-xs[i-1]) + (ys[i]-ys[i-1]);
	
	var q = (1-t)*ys[i-1] + t*ys[i] + t*(1-t)*(a*(1-t)+b*t);
	// the following computes derivative of spline at x, q'(x)=q'(t)*t'(x)
	var derivQ = 
		(b*(2 - 3*t)*t + a*(1 - 4*t + 3*t*t) + ys[i] - ys[i-1])/(xs[i] - xs[i-1]);

	return [q, derivQ];
	}


// ****************************************************************
// Modified Bessel function of the first kind I_n(x)
// Taken from "Numerical Recipes in C: Section 6.6:
// Test with https://keisan.casio.com/exec/system/1180573475
//
// Usage: bessI(n,x) with n an integer ≥ 0 and x real
// ity
// Friday, 30 April 2021
//

function bessI0(x)
	{
	let ax,ans,y;

	ax = Math.abs(x)
	if (ax < 3.75)
		{
		y = x/3.75;
		y *= y;
		ans = 1.0+y*(3.5156229+y*(3.0899424+y*(1.2067492 +
			y*(0.2659732+y*(0.360768e-1+y*0.45813e-2)))));
		}
	else
		{
		y = 3.75/ax;
		ans = (Math.exp(ax)/Math.sqrt(ax))*(0.39894228+y*(0.1328592e-1 +
			y*(0.225319e-2+y*(-0.157565e-2+y*(0.916281e-2 +
			y*(-0.2057706e-1+y*(0.2635537e-1+y*(-0.1647633e-1 +
			y*0.392377e-2))))))));
		}
	return ans;
	}

function bessI1(x)
	{
	let ax,ans,y;

	ax = Math.abs(x)
	if (ax < 3.75)
		{
		y = x/3.75;
		y *= y;
		ans = ax*(0.5+y*(0.87890594+y*(0.51498869+y*(0.15084934 +
			y*(0.2658733e-1+y*(0.301532e-2+y*0.32411e-3))))));
		}
	else
		{
		y=3.75/ax;
		ans = 0.2282967e-1+y*(-0.2895312e-1+y*(0.1787654e-1 -
			y*0.420059e-2));
		ans = 0.39894228+y*(-0.3988024e-1+y*(-0.362018e-2 +
			y*(0.163801e-2+y*(-0.1031555e-1+y*ans))));
		ans *= (Math.exp(ax)/Math.sqrt(ax));
		}
	return (x < 0.0 ? -ans : ans);
}

function bessI(n, x)
	{
	let ACC = 40.0;
	let BIGNO = 1.0e10;
	let BIGNI = 1.0e-10;

	let j, bi,bim,bip,tox,ans,index;

	if (n < 0) alert("Index n = "+n+" in bessI")
	else if (n == 0)
		return bessI0(x)
	else if (n == 1)
		return bessI1(x)
	else
		{
		if (x == 0.0)
			return 0.0
		else
			{
			tox=2.0/Math.abs(x);
			bip=0.0; ans=0.0;
			bi=1.0;
			index = 2*(n + Math.floor(Math.sqrt(ACC*n)));
			for (j=index; j>0; j--)
				{
				bim=bip+j*tox*bi;
				bip=bi;
				bi=bim;
				if (Math.abs(bi) > BIGNO)
					{
					ans *= BIGNI;
					bi *= BIGNI;
					bip *= BIGNI;
					};
				if (j == n) ans=bip;
				}
			ans *= bessI0(x)/bi;
			return ((x < 0.0 && (n & 1)) ? -ans : ans);
			}
		}
	};

// ****************************************************************
// Root finding algorithm using Brent Method as described in Section 9.3 of
// "Numerical Recipes in C: but implemented at:
// GitHub <https://gist.github.com/borgar/3317728>
//
// Searches the interval from "lowerLimit" to "upperLimit"
// for a root (i.e., zero) of the function "func" with respect to 
// its first argument using Brent's method root-finding algorithm.
//
// @param {function} function for which the root is sought.
// @param {number} the lower point of the interval to be searched.
// @param {number} the upper point of the interval to be searched.
// @param {number} the desired accuracy (convergence tolerance).
// @param {number} the maximum number of iterations.
// @returns an estimate for the root within accuracy.
//
// Translated from zeroin.c in http://www.netlib.org/c/brent.shar.

/*
function uniroot ( func, lowerLimit, upperLimit, errorTol, maxIter )
	{
	var a = lowerLimit
	, b = upperLimit
	, c = a
	, fa = func(a)
	, fb = func(b)
	, fc = fa
	, s = 0
	, fs = 0
	, tol_act		// Actual tolerance
	, new_step		// Step at this iteration
	, prev_step		// Distance from the last but one to the last approximation
	, p				// Interpolation step is calculated in the form p/q;
					// division is delayed until the last moment
	, q
	;

	errorTol = errorTol || 0;
	maxIter = maxIter || 1000;

	while ( maxIter-- > 0 )
		{
		prev_step = b - a;
		if ( Math.abs(fc) < Math.abs(fb) )
			{
			// Swap data for b to be the best approximation
			a = b, b = c, c = a;
			fa = fb, fb = fc, fc = fa;
			}
		tol_act = 1e-15 * Math.abs(b) + errorTol / 2;
		new_step = (c-b)/2;
		if ( Math.abs(new_step) <= tol_act || fb === 0 )
			{
			return b; // Acceptable approx. is found
			}
		
		// Decide if the interpolation can be tried
		if ( Math.abs(prev_step) >= tol_act && Math.abs(fa) > Math.abs(fb) )
			{
			// If prev_step was large enough and was in true direction,
			// Interpolatiom may be tried
			var t1, cb, t2;
			cb = c - b;
			
			if ( a === c )
				{ // If we have only two distinct points linear
				// interpolation can only be applied
				t1 = fb / fa;
				p = cb * t1;
				q = 1.0 - t1;
				}
			else
				{ // Quadric inverse interpolation
				q = fa / fc, t1 = fb / fc, t2 = fb / fa;
				p = t2 * (cb * q * (q - t1) - (b - a) * (t1 - 1));
				q = (q - 1) * (t1 - 1) * (t2 - 1);
				}
			
			if ( p > 0 )
				{
				q = -q; // p was calculated with the opposite sign; make p positive
				}
			else
				{
				p = -p; // and assign possible minus to q
				}
			
			if ( p < ( 0.75 * cb * q - Math.abs( tol_act * q ) / 2 ) &&
				 p < Math.abs( prev_step * q / 2 ) )
					{ 
					// If (b + p / q) falls in [b,c] and isn't too large it is accepted
					new_step = p / q;
					}
			 // If p/q is too large then the bissection procedure can reduce [b,c] range to more extent
			}
		
		if ( Math.abs( new_step ) < tol_act )
			{ // Adjust the step to be not less than tolerance
			new_step = ( new_step > 0 ) ? tol_act : -tol_act;
			}
		
		a = b, fa = fb; // Save the previous approx.
		b += new_step, fb = func(b); // Do step to a new approxim.
		
		if ( (fb > 0 && fc > 0) || (fb < 0 && fc < 0) )
			{
			c = a, fc = fa; // Adjust c for it to have a sign opposite to that of b
			}
		}
	};
*/

