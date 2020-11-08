// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// ****************************************************************
// Fourier processing procedures to be used in the SSP package
// i.t. young
// Wednesday, 21 September 2016


// ****************************************************************
// From Mathematica: f2D1A = Abs[f2D1]; MagOnlyImage = Chop[InverseFourier[f2D1A]]
// checked Sunday, 18 December 2016

function magOnlySignal(data)
	{
	var nn = data[0];
	var ndim = data[0].length;
	var n = data[1].length;
	var theData = data[1].slice();
	var temp = fft(theData, nn, ndim, FORWARD);
	var magOnly = abs(temp);
	temp = fft(magOnly, nn, ndim, BACKWARD);
	return [nn, chop(temp)];
	};


// ****************************************************************
// For 1D & 2D signals
// From Mathematica, PhaseOnlyImage: f2D1P = f2D1/Abs[f2D1] -->
// PhaseOnlyImage = Chop[InverseFourier[f2D1P]]
// checked Sunday, 18 December 2016

function phaseOnlySignal(data)
	{
	var nn = data[0];
	var ndim = data[0].length;
	var n = data[1].length;
	var phaseOnly = createArray(n);
	var theData = data[1].slice();
	var temp = fft(theData, nn, ndim, FORWARD);
	var mag = abs(temp);
	let tmag = 1;
	for(var i = 0; i < n; i += 2)
		{
		tmag = mag[i];
		if(tmag == 0)
			{
			phaseOnly[i] = 0;
			phaseOnly[i+1] = 0;
			}
		else
			{
			phaseOnly[i] = temp[i]/tmag;
			phaseOnly[i+1] = temp[i+1]/tmag;
			}
		};
	temp = fft(phaseOnly, nn, ndim, BACKWARD);
	return [nn, chop(temp)];
	};


// ****************************************************************
// Copied and slightly modified from fft.js
// define() has been removed as has the complicated return statement

// ****************************************************************
// Free FFT and convolution (JavaScript)
// Copyright (c) 2014 Project Nayuki
// Licensed under the MIT license.
// http://www.nayuki.io/page/free-small-fft-in-multiple-languages
// ****************************************************************
// checked Sunday, 18 December 2016

	var cosTable = [];
	var sinTable = [];
	var lutInitialised = undefined;

	"use strict";

	function initLut(n) {
		cosTable = new Array(n / 2);
		sinTable = new Array(n / 2);
		for (var i = 0; i < n / 2; i++) {
			cosTable[i] = Math.cos(2 * Math.PI * i / n);
			sinTable[i] = Math.sin(2 * Math.PI * i / n);
		}
		lutInitialised = n;
	}


	/* 
	 * Computes the discrete Fourier transform (DFT) of the given complex vector,
	 * storing the result back into the vector.
	 * The vector can have any length. This is a wrapper function.
	 */
	function transform(real, imag) {
		if (real.length != imag.length)
			throw "Mismatched lengths";

		var n = real.length;
		if (n == 0)
			return;
		else if ((n & (n - 1)) == 0)  // Is power of 2
			transformRadix2(real, imag);
		else  // More complicated algorithm for arbitrary sizes
			transformBluestein(real, imag);
	}


	/* 
	 * Computes the inverse discrete Fourier transform (IDFT) of the given complex
	 * vector, storing the result back into the vector.
	 * The vector can have any length. This is a wrapper function. This
	 * transform does not perform scaling, so the inverse is not a true inverse.
	 */

	function inverseTransform(real, imag)
		{
		var ntot = real.length;
		transform(imag, real); 
		}

	/* 
	 * Computes the discrete Fourier transform (DFT) of the given complex vector,
	 * storing the result back into the vector.
	 * The vector's length must be a power of 2. Uses the Cooley-Tukey
	 * decimation-in-time radix-2 algorithm.
	 */
	function transformRadix2(real, imag) {
		// Initialization
		if (real.length != imag.length)
			throw "Mismatched lengths";
		var n = real.length;
		if (n == 1)  // Trivial transform
			return;
		var levels = -1;
		for (var i = 0; i < 32; i++) {
			if (1 << i == n)
				levels = i;  // Equal to log2(n)
		}
		if (n !== lutInitialised) { // has the LUT been initialised with the right samplesize?
			if (levels == -1)
				throw "Length is not a power of 2";
			initLut(n);
		}

		// Bit-reversed addressing permutation
		for (var i = 0; i < n; i++) {
			var j = reverseBits(i, levels);
			if (j > i) {
				var temp = real[i];
				real[i] = real[j];
				real[j] = temp;
				temp = imag[i];
				imag[i] = imag[j];
				imag[j] = temp;
			}
		}

		// Cooley-Tukey decimation-in-time radix-2 FFT
		for (var size = 2; size <= n; size *= 2) {
			var halfsize = size / 2;
			var tablestep = n / size;
			for (var i = 0; i < n; i += size) {
				for (var j = i, k = 0; j < i + halfsize; j++, k += tablestep) {
					var tpre = real[j + halfsize] * cosTable[k] + imag[j + halfsize] * sinTable[k];
					var tpim = -real[j + halfsize] * sinTable[k] + imag[j + halfsize] * cosTable[k];
					real[j + halfsize] = real[j] - tpre;
					imag[j + halfsize] = imag[j] - tpim;
					real[j] += tpre;
					imag[j] += tpim;	
				}
			}
		}

		// Returns the integer whose value is the reverse of the lowest 'bits' bits of the integer 'x'.
		function reverseBits(x, bits) {
			var y = 0;
			for (var i = 0; i < bits; i++) {
				y = (y << 1) | (x & 1);
				x >>>= 1;
			}
			return y;
		}
	}


	/* 
	 * Computes the discrete Fourier transform (DFT) of the given complex vector,
	 * storing the result back into the vector.
	 * The vector can have any length. This requires the convolution function,
	 * which in turn requires the radix-2 FFT function.
	 * Uses Bluestein's chirp z-transform algorithm.
	 */
	function transformBluestein(real, imag) {
		// Find a power-of-2 convolution length m such that m >= n * 2 + 1
		if (real.length != imag.length)
			throw "Mismatched lengths";
		var n = real.length;
		var m = 1;
		while (m < n * 2 + 1)
			m *= 2;

		// Trignometric tables
		var cosTable = new Array(n);
		var sinTable = new Array(n);
		for (var i = 0; i < n; i++) {
			var j = i * i % (n * 2);  // This is more accurate than j = i * i
			cosTable[i] = Math.cos(Math.PI * j / n);
			sinTable[i] = Math.sin(Math.PI * j / n);
		}

		// Temporary vectors and preprocessing
		var areal = new Array(m);
		var aimag = new Array(m);
		for (var i = 0; i < n; i++) {
			areal[i] = real[i] * cosTable[i] + imag[i] * sinTable[i];
			aimag[i] = -real[i] * sinTable[i] + imag[i] * cosTable[i];
		}
		for (var i = n; i < m; i++)
			areal[i] = aimag[i] = 0;
		var breal = new Array(m);
		var bimag = new Array(m);
		breal[0] = cosTable[0];
		bimag[0] = sinTable[0];
		for (var i = 1; i < n; i++) {
			breal[i] = breal[m - i] = cosTable[i];
			bimag[i] = bimag[m - i] = sinTable[i];
		}
		for (var i = n; i <= m - n; i++)
			breal[i] = bimag[i] = 0;

		// Convolution
		var creal = new Array(m);
		var cimag = new Array(m);
		convolveComplex(areal, aimag, breal, bimag, creal, cimag);

		// Postprocessing
		for (var i = 0; i < n; i++) {
			real[i] = creal[i] * cosTable[i] + cimag[i] * sinTable[i];
			imag[i] = -creal[i] * sinTable[i] + cimag[i] * cosTable[i];
		}
	}


	/* 
	 * Computes the circular convolution of the given real vectors. Each vector's length must be the same.
	 */
	function convolveReal(x, y, out) {
		if (x.length != y.length || x.length != out.length)
			throw "Mismatched lengths";
		var zeros = new Array(x.length);
		for (var i = 0; i < zeros.length; i++)
			zeros[i] = 0;
		convolveComplex(x, zeros, y, zeros.slice(0), out, zeros.slice(0));
	}


	/* 
	 * Computes the circular convolution of the given complex vectors.
	 * Each vector's length must be the same.
	 */
	function convolveComplex(xreal, ximag, yreal, yimag, outreal, outimag) {
		if (xreal.length != ximag.length || xreal.length != yreal.length || yreal.length != yimag.length || xreal.length != outreal.length || outreal.length != outimag.length)
			throw "Mismatched lengths";

		var n = xreal.length;
		xreal = xreal.slice(0);
		ximag = ximag.slice(0);
		yreal = yreal.slice(0);
		yimag = yimag.slice(0);

		transform(xreal, ximag);
		transform(yreal, yimag);
		for (var i = 0; i < n; i++) {
			var temp = xreal[i] * yreal[i] - ximag[i] * yimag[i];
			ximag[i] = ximag[i] * yreal[i] + xreal[i] * yimag[i];
			xreal[i] = temp;
		}
		inverseTransform(xreal, ximag);

		for (var i = 0; i < n; i++)
		{  // Scaling (because this FFT implementation omits it)
			outreal[i] = xreal[i] / n;
			outimag[i] = ximag[i] / n;
		}

	}


// ****************************************************************
// Following is based upon Numerical Recipe's's procedure fourn.c (2nd Edition).
// checked Sunday, 18 December 2016

function fourND(data, nn, ndim, isign)
// Replaces data by its ndim-dimensional discrete Fourier transform
// if isign is input as 1 (FORWARD). nn[1..ndim] is an integer array containing
// the lengths of each dimension (number of complex values), which MUST all be
// powers of 2.

// Data is a real array of length twice the product of these lengths, in which the data
// are stored as in a multidimensional complex array: real and imaginary parts of each
// element are in consecutive locations, and the rightmost index of the array increases
// most rapidly as one proceeds along data.

// For a two-dimensional array, this is equivalent to storing the array by rows.
// If isign is input as −1 (BACKWARD), data is replaced by its inverse transform times the
// product of the lengths of all dimensions.

	{
	// Compute total number of complex values
	var ntot = 1;
	var idim = 1;
	for (idim = 0; idim < ndim; idim++)
		ntot *= nn[idim];
	
	var nprev = 1;
	var n = 1;
	var nrem = 1;
	var i1 = 1; var i2 = 1; var i3 = 1;
	var ip1 = 1; var ip2 = 1; var ip3 = 1;
	var i2rev = 1; var i3rev = 1;
	var ibit = 1;
	var ifp1 = 1; var ifp2 = 1;
	var theta = 1;
	var wr = 1; var wi = 1;
	var wpr = 1; var wpi = 1;
	var wtemp = 1;
	var tempr = 1; var tempi = 1;
	var k1 = 1; var k2 = 1;
	
	// Main loop over the dimensions.
	for (idim = ndim; idim >= 1; idim--)
		{
		n = nn[idim - 1];
		nrem = ntot / (n * nprev);
		ip1 = nprev << 1;
		ip2 = ip1 * n;
		ip3 = ip2 * nrem;
		i2rev = 1;
		for (i2 = 1; i2 <= ip2; i2 += ip1)
			// This is the bit-reversal section of the routine.
			{
			if (i2 < i2rev)
				{
				for (i1 = i2; i1 <= i2 + ip1 - 2; i1 += 2)
					{
					for (i3 = i1; i3 <= ip3; i3 += ip2)
						{
						i3rev = i2rev + i3 - i2;
						// inline swap routine
						temp = data[i3 - 1];
						data[i3 - 1] = data[i3rev - 1];
						data[i3rev - 1] = temp;
						// inline swap routine
						temp = data[i3];
						data[i3] = data[i3rev];
						data[i3rev] = temp;
						}
					}
				}
			ibit = ip2 >>> 1;
			while (ibit >= ip1 && i2rev > ibit)
				{
				i2rev -= ibit;
				ibit >>>= 1;
				}
			i2rev += ibit;
			}
			
		// Here begins the Danielson - Lanczos section of the routine
		ifp1 = ip1;
		while (ifp1 < ip2)
			{
			ifp2 = ifp1 << 1;
			// Initialize for the trig. recurrence.
			theta = isign * 2 * Math.PI / (ifp2 / ip1); 
			wtemp = Math.sin(0.5 * theta);
			wpr = -2.0 * wtemp * wtemp;
			wpi = Math.sin(theta);
			wr = 1.0;
			wi = 0.0;
			for (i3 = 1; i3 <= ifp1; i3 += ip1)
				{
				for (i1 = i3; i1 <= i3 + ip1 - 2; i1 += 2)
					{
					for (i2 = i1; i2 <= ip3; i2 += ifp2)
						{
						// Danielson - Lanczos formula:
						k1 = i2;
						k2 = k1 + ifp1;
						tempr = wr * data[k2-1] - wi * data[k2];
						tempi = wr * data[k2] + wi * data[k2-1];
						data[k2-1] = data[k1-1] - tempr;
						data[k2] = data[k1] - tempi;
						data[k1-1] += tempr;
						data[k1] += tempi;
						}
					}
				// Trigonometric recurrence.
				wtemp = wr;
				wr = wr * wpr - wi * wpi + wr;
				wi = wi * wpr + wtemp * wpi + wi;
				}
			ifp1 = ifp2;
			}
		nprev *= n;
		};
	// following is NOT in Numerical Recipes but it should be, right?
	if (isign === BACKWARD)
		for(var i = 0; i < data.length; i++) data[i] /= ntot;
	return data};


// ****************************************************************
// Following is the general fft routine for 1D and 2D data.
// Both 1D and 2D versions are working Wednesday, 7 December 2016

// Remember 1D can be ANY length but 2D MUST be powers of two lengths in both dimensions.
// A 2D 512 x 512 fft takes about 75 ms (determined by the performance command below).
// checked Sunday, 18 December 2016


// The calling sequence is:

function fft(tempData, nn, ndim, isign)
// Computes n-dim-dimensional discrete Fourier transform starting from "data"
// Does NOT overwrite input "data". (Assumption: Memory is cheap and plentiful.)
// If isign = 1 (FORWARD), this is a transform from time (or space) to frequency. 
// If isign = –1 (BACKWARD), this is a transform from frequency to time (or space).
// The parameter ndim is the number of dimensions , e.g. ndim = 1 or ndim = 2.
// nn[1,2, ..., ndim] is an integer array containing the lengths of each dimension,
// For example:
//     if ndim = 1, then nn = [197] means 197 samples.
//     if ndim = 2, then nn = [128,256] means 128 rows by 256 columns leading
// to 128*256 samples and each sample is assumed to be a COMPLEX value.
// Note that a 1D signal can have ANY length but a 2D signal MUST have rows and
// columns that are each a power of two.

// The array "data" is a REAL array of a length that is twice the product of the
// total signal length. In the examples above, the 1D array has a total length
// of 2*197 and the 2D array has a total length of 2*128*256.
// The real and imaginary parts of each element are in consecutive locations.
// As one indexes along the array one is moving along a row of the data.

// This fft routine automatically determines which Fourier subroutine should be used.
// For 1D data this is the routine "transform" and for 2D data this is "fourND".
	
	{
	// Compute total number of complex values
	var ntot = 1;
	var idim = 1;
	for (idim = 0; idim < ndim; idim++) ntot *= nn[idim];

	if (ndim === 1)
		{
		var splitData = split(tempData,nn);
		if (isign === FORWARD)
			{
			transform(splitData[0], splitData[1]);
			var mergeData = merge(splitData,nn);
			}
		else
			{
			inverseTransform(splitData[0],splitData[1]);
			var mergeData = merge(splitData,nn);
			// Scaling (because this FFT implementation omits it)
			var n = (mergeData.length) >> 1;
			for (var i = 0; i < mergeData.length; i++)
				mergeData[i] /= n;
			};
		return mergeData;
		}
	else if (ndim === 2)
		{
		var data = tempData.slice();
		var nprev = 1;
		var n = 1;
		var nrem = 1;
		var i1 = 1; var i2 = 1; var i3 = 1;
		var ip1 = 1; var ip2 = 1; var ip3 = 1;
		var i2rev = 1; var i3rev = 1;
		var ibit = 1;
		var ifp1 = 1; var ifp2 = 1;
		var theta = 1;
		var wr = 1; var wi = 1;
		var wpr = 1; var wpi = 1;
		var wtemp = 1;
		var tempr = 1; var tempi = 1;
		var k1 = 1; var k2 = 1;
	
		// Main loop over the dimensions.
		for (idim = ndim; idim >= 1; idim--)
			{
			n = nn[idim - 1];
			nrem = ntot / (n * nprev);
			ip1 = nprev << 1;
			ip2 = ip1 * n;
			ip3 = ip2 * nrem;
			i2rev = 1;
			for (i2 = 1; i2 <= ip2; i2 += ip1)
				// This is the bit-reversal section of the routine.
				{
				if (i2 < i2rev)
					{
					for (i1 = i2; i1 <= i2 + ip1 - 2; i1 += 2)
						{
						for (i3 = i1; i3 <= ip3; i3 += ip2)
							{
							i3rev = i2rev + i3 - i2;
							// inline swap routine
							temp = data[i3 - 1];
							data[i3 - 1] = data[i3rev - 1];
							data[i3rev - 1] = temp;
							// inline swap routine
							temp = data[i3];
							data[i3] = data[i3rev];
							data[i3rev] = temp;
							}
						}
					}
				ibit = ip2 >>> 1;
				while (ibit >= ip1 && i2rev > ibit)
					{
					i2rev -= ibit;
					ibit >>>= 1;
					}
				i2rev += ibit;
				}
			
			// Here begins the Danielson - Lanczos section of the routine
			ifp1 = ip1;
			while (ifp1 < ip2)
				{
				ifp2 = ifp1 << 1;
				// Initialize for the trig. recurrence.
				theta = isign * 2 * Math.PI / (ifp2 / ip1); 
				wtemp = Math.sin(0.5 * theta);
				wpr = -2.0 * wtemp * wtemp;
				wpi = Math.sin(theta);
				wr = 1.0;
				wi = 0.0;
				for (i3 = 1; i3 <= ifp1; i3 += ip1)
					{
					for (i1 = i3; i1 <= i3 + ip1 - 2; i1 += 2)
						{
						for (i2 = i1; i2 <= ip3; i2 += ifp2)
							{
							// Danielson - Lanczos formula:
							k1 = i2;
							k2 = k1 + ifp1;
							tempr = wr * data[k2-1] - wi * data[k2];
							tempi = wr * data[k2] + wi * data[k2-1];
							data[k2-1] = data[k1-1] - tempr;
							data[k2] = data[k1] - tempi;
							data[k1-1] += tempr;
							data[k1] += tempi;
							}
						}
					// Trigonometric recurrence.
					wtemp = wr;
					wr = wr * wpr - wi * wpi + wr;
					wi = wi * wpr + wtemp * wpi + wi;
					}
				ifp1 = ifp2;
				}
			nprev *= n;
			};
		// following is NOT in Numerical Recipes but it should be, right?
		if (isign == BACKWARD)
			for(var i = 0; i < data.length; i++) data[i] /= ntot;
		return data;
		}
	else
		throw "fft: Wrong number of dimensions!";
	};


function convolveTwoSignals(signal1, signal2, correlationFlag)
// Computes convolution (or correlation) for two signals through the Fourier domain.
// Does NOT overwrite input "data". (Assumption: Memory is cheap and plentiful.)
// The parameter ndim is the number of dimensions , e.g. ndim = 1 or ndim = 2.
// Both signals must have the same number of dimensions
// nn[...] is an integer array containing the lengths of each dimension,
// For example:
//     if ndim = 1, then nn = [197] means 197 samples.
//     if ndim = 2, then nn = [128,256] means 128 rows by 256 columns leading
// to 128*256 samples and each sample is assumed to be a COMPLEX value.
// Note that a 1D signal can have ANY length but a 2D signal MUST have rows and
// columns that are each a power of two.

// If you want a convolution then correlationFlag = CONVOLUTION.
// If you want a correlation then correlationFlag = CORRELATION.

// It is assumed that for a 2D signal, signal2 is wholly contained within
// signal1. That is rows2 ≤ rows1 AND cols2 ≤ cols1. In other words either
// both signals are exactly the same size or signal2 is a "filter" whose
// footprint is smaller in all dimensions than signal1.

// The arrays "signal1"  and "signal2" are in "universal" format but assumed to
// contain only real data. The arrays have a length that is twice the product of the
// total signal length. In the examples above, the 1D array has a total length
// of 2*197 and the 2D array has a total length of 2*128*256.
// The real and imaginary parts of each element are in consecutive locations.
// As one indexes along the array one is moving along a row of the data.

// This convolution routine automatically determines which Fourier subroutine
// should be used. For 1D data this is the routine "transform" and for 2D data
// this is "fourND".
//
// ity Monday, 30 October 2017
	
	{
	var ndim = signal1[0].length;
	var padvalue = [0, 0];
	var rows1 = signal1[0][0];
	var rows2 = signal2[0][0];
	if (ndim === 2)
		{
		var cols1 = signal1[0][1];
		var cols2 = signal2[0][1];
		};
	var sig1 = [];
	var sig2 = [];
	var Spect1 = [];
	var Spect2 = [];
	var outputSpect = [];
	var output = [];
	
	// zero padding is needed for convolution through Fourier domain. The
	// length of each data set must be doubled. But we go further,
	// making all lengths powers of two for this computation.
	var newLengthR1 = 2**Math.floor(Math.log2(rows1));
	if ( (rows1 % newLengthR1) != 0) newLengthR1 *= 4
	else newLengthR1 *= 2;
	
	var newLengthR2 = 2**Math.floor(Math.log2(rows2));
	if ( (rows2 % newLengthR2) > 0) newLengthR2 *= 4
	else newLengthR2 *= 2;

	var newLengthR = Math.max(newLengthR1,newLengthR2);
	var nnout = [newLengthR];
	
	if (ndim === 2)
		{
		var newLengthC1 = 2**Math.floor(Math.log2(cols1));
		if ( (cols1 % newLengthC1) != 0) newLengthC1 *= 4
		else newLengthC1 *= 2;
	
		var newLengthC2 = 2**Math.floor(Math.log2(cols2));
		if ( (cols2 % newLengthC2) != 0) newLengthC2 *= 4
		else newLengthC2 *= 2;
		};

	var newLengthC = Math.max(newLengthC1,newLengthC2);
	
	if (ndim === 1)
		{
		// 1D padding to be done properly
		sig1 = arrayPad(signal1[1],newLengthR-rows1, padvalue)
		Spect1 = fft(sig1, nnout, ndim, FORWARD);  // signal1 spectrum

		sig2 = arrayPad(signal2[1],newLengthR-rows2, padvalue)
		Spect2 = fft(sig2, nnout, ndim, FORWARD);  // signal2 spectrum
		
		if (correlationFlag)
			outputSpect = filterMult(Spect1, conjugate(Spect2))  // correlation
		else
			outputSpect = filterMult(Spect1, Spect2);  // convolution
		// result is real so force it
		output = chop(re(fft(outputSpect, nnout, ndim, BACKWARD)));
		var outLength = (rows1 >= rows2) ? rows1 : rows2;
		return [[outLength],take(output, outLength)];
		}
	else if (ndim === 2)
		{
		// zero-pad 2D signal1
		var sDim1 = [newLengthR-rows1,newLengthC-cols1];
		sig1 = imagePad(sDim1, [signal1[0], signal1[1]], padvalue);
		var s1Dims = sig1[0];
		Spect1 = fft(sig1[1], s1Dims, ndim, FORWARD);  // signal spectrum
		
		// zero-pad 2D signal2
		var sDim2 = [newLengthR-rows2,newLengthC-cols2];
		sig2 = imagePad(sDim2, [signal2[0], signal2[1]], padvalue);
		var s2Dims = sig2[0];
		Spect2 = fft(sig2[1], s2Dims, ndim, FORWARD);  // signal2 spectrum
	
		if (correlationFlag)
			outputSpect = filterMult(Spect1, conjugate(Spect2))  // correlation
		else
			outputSpect = filterMult(Spect1, Spect2);  // convolution
		// result should be real so force it
		var output = chop(re(fft(outputSpect, s1Dims, ndim, BACKWARD)));

		var output2 = imageTake([s1Dims,output],[0,rows1,0,cols1]);
		return [[rows1,cols1], output2[1]];
		}
	else
		throw "convolveTwoSignals: Wrong number of dimensions!";
	}


// ****************************************************************
// ****************************************************************
// For 1D signals
// data is assumed to be complex with the structure data = [real_array,imag_array]
// transform & inverseTransform mutate the arrays sent to the subroutine
// Caveat emptor

/* No longer used; replaced by fft()

function myFourier(data)
	{
	var real = data[0].slice();
	var imag = data[1].slice();
	transform(real, imag);
	return [real,imag];
	};

function myInverseFourier(data)
	{
	var real = data[0].slice();
	var imag = data[1].slice();
	inverseTransform(real, imag);
	var n = real.length;
	
	// install the missing scaling
	for(var i = 0; i < n; i++)
		{
			real[i] /= n;
			imag[i] /= n;
		};
	return [real,imag];
	};

*/

