// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// ****************************************************************
// Probability and statistical procedures to be used in the SSP package
//
// All of the routines for generating random numbers according to a
// specific, desired distribution provide a single value of the random
// variate. That is, to generate a list of 10,000 numbers you must call
// the given routine 10,000 times.
//
// Statistics routines, however, assume that an array of data is presented
// that consists of (preferably) more than one sample. This array must be
// in the "universal" format described in the header of "SSPconstants.js"
// so that it can be used on 1D and 2D complex data.
//
// i.t. young
// Tuesday, 5 July 2016


// ****************************************************************
function randomInteger(lower,upper)
// Uniform integer distribution on x for lower ≤ x ≤ upper
// Checked Wednesday, 11 January 2017

	{
	var ulimit = upper - lower + 1;
	return (Math.floor(ulimit*Math.random() + lower));
	};


// ****************************************************************
function randomReal(lower,upper)
// Uniform distribution on x for lower ≤ x < upper
// Checked Wednesday, 11 January 2017

	{
	var ulimit = upper - lower;
	return (ulimit*Math.random() + lower);
	};


// ****************************************************************
// Based upon remark in Wikipedia about Triangular distribution
// <https://en.wikipedia.org/wiki/Triangular_distribution>.
// See "Generating Triangular-distributed random variates"
// Checked Wednesday, 11 January 2017

function randomTriangular(lower,upper,mode)
// Triangular distribution on x for lower ≤ x ≤ upper with peak at mode
	{
	var f = (mode - lower)/(upper - lower);
	var u = Math.random();
	var result = 0;
	
	if (0 < u && u < f)
		{
		result = lower + Math.sqrt(u*(upper - lower)*(mode - lower));
		};
	if (f <= u && u < 1)
		{result = upper - Math.sqrt((1-u)*(upper - lower)*(upper - mode));
		};
	return result;
	};


// ****************************************************************
// Copied from:
// <http://www.ollysco.de/2012/04/gaussian-normal-functions-in-javascript.html>

// Returns a Gaussian Random Number around a normal distribution defined by the mean
// and standard deviation parameters.

// Uses the algorithm used in Java's random class, which in turn comes from
// Donald Knuth's implementation of the Box–Muller transform.

// @param {Number} [mean = 0.0] The mean value, default 0.0
// @param {Number} [standardDeviation = 1.0] The standard deviation, default 1.0
// @return {Number} A random number

// Checked Wednesday, 11 January 2017

function randomGaussian(mean, standardDeviation)
	{	
	if (randomGaussian.nextGaussian !== undefined)
		{
		var nextGaussian = randomGaussian.nextGaussian;
		delete randomGaussian.nextGaussian;
		return (nextGaussian * standardDeviation) + mean;
		}
	else
		{
		var v1, v2, s, multiplier;
		do
			{
			v1 = 2 * Math.random() - 1; // between -1 and 1
			v2 = 2 * Math.random() - 1; // between -1 and 1
			s = v1 * v1 + v2 * v2;
			} while (s >= 1 || s == 0);
		multiplier = Math.sqrt(-2 * Math.log(s) / s);
		randomGaussian.nextGaussian = v2 * multiplier;
		return (v1 * multiplier * standardDeviation) + mean;
		};
	};



// ****************************************************************
// Based upon remark in Wikipedia about Rayleigh distribution
// <https://en.wikipedia.org/wiki/Rayleigh_distribution>.
// "[If] random complex numbers whose real and imaginary components are
// independently and identically distributed Gaussian with equal variance
// and zero mean, [then] the absolute value of the complex number is
// Rayleigh-distributed"
// Checked Wednesday, 11 January 2017

function randomRayleigh(standardDeviation)
	{	
	var v1, v2, s, multiplier;
	do
		{
		v1 = 2 * Math.random() - 1; // between -1 and 1
		v2 = 2 * Math.random() - 1; // between -1 and 1
		s = v1 * v1 + v2 * v2;
		} while (s >= 1 || s == 0);
	multiplier = Math.sqrt(-2 * Math.log(s) / s);
	v1 *= multiplier;
	v2 *= multiplier;
	return (standardDeviation*Math.hypot(v1,v2));
	};


// ****************************************************************
// Based upon Knuth, Semi-Numerical Algorithsms, Vol. 2, p. 117, (1969)
// Returns a Poisson-distributed random integer whose mean is given.
// Checked Wednesday, 11 January 2017

function randomPoisson(mean)
	{ 
	var p = Math.exp(-mean);
	var q = 1.0;
	var n = 0;

	while (q >= p)
		{
		n++;
		q *= Math.random();
		};
	return (n - 1);
	};


// ****************************************************************
// Based upon Knuth, Semi-Numerical Algorithsms, Vol. 2, p. 114, (1969)
// Returns an Exponential-distributed random real whose mean is given.
// Checked Wednesday, 11 January 2017

function randomExponential(lambda)
	{ 
	var p = Math.random();

	if (p < tooSmall) p = tooSmall;
	
	return (-Math.log(p)*lambda);
	};


// ****************************************************************
// Method #1 Knuth, "Seminumerical Algorithms", Vol2 Sec 3.4.1 D,
// the "logarithm method"

// Method #2 See
// <https://en.wikipedia.org/wiki/Laplace_distribution#Generating_random_variables_according_to_the_Laplace_distribution>
// "The difference between two independent identically distributed
// exponential random variables is governed by a Laplace distribution"
//
// The following is a slightly modified Method #1.

// Checked Wednesday, 11 January 2017

function randomLaplace(mean,b)
	{ 
	var u = randomReal(-1/2,+1/2);
	if (u == 0) u = Math.sign(u)*tooSmall; // non illigitimum carborundum
	var v = mean - b * Math.sign(u) * Math.log(1-(2*Math.abs(u)));
	
	return v;
	};


// ****************************************************************
// Based upon flipping a coin with prob(Heads) = p and
// prob(Tails) = 1-p. The former returns 1 and the latter 0.
// Checked Wednesday, 11 January 2017

function randomBinary(p)
	{ 
	var value = Math.random();
	
	return ((value < p) ? 1 : 0);
	};


// ****************************************************************
// All of the routines for generating random numbers according to a
// specific, desired distribution provide a single value of the random
// variate. That is, to generate a list of 10,000 numbers you must call
// the given routine 10,000 times.
//
// Statistics routines, however, assume that an array of data is presented
// that consists of (preferably) more than one sample. This array must be
// in the "universal" format described in the header of "SSPconstants.js"
// so that it can be used on 1D and 2D complex data.
//
// ****************************************************************
// Checked Wednesday, 11 January 2017

function mean(data)
	{
	var totalr = 0;
	var totali = 0;
	var dLength = data.length;
	for (var i = 0; i < dLength; i += 2)
		{
		totalr += data[i];
		totali += data[i+1];
		};
		return [2*totalr/dLength, 2*totali/dLength];
	};


// ****************************************************************
// Checked Thursday, 12 January 2017

function variance(data)
	{
	var z = Array(data.length);
	var dLength = data.length >> 1;
	var tmean = mean(data);
	var meanr = tmean[0];
	var meani = tmean[1];
	// computed the old fashioned way
	for (var i = 0; i < 2*dLength; i += 2)
		{
		z[i] = data[i] - meanr;
		z[i+1] = data[i+1] - meani;
		};
	var sqz = dot(z,z); // z•z*
	return [sqz[0]/(dLength-1), 0];
	};

function stdev(data)
	{
	var temp = variance(data);
	var std = Math.sqrt(temp[0]);
	return [std, 0];
	};


// ****************************************************************
// Mathematica function Quantile
// Returns the value at a given percentile in a sorted numeric array.
// "Linear interpolation between closest ranks" method. Take from:
// <https://gist.github.com/IceCreamYou/6ffa1b18c4c8f6aeaad2>
//
// We assume the data are REAL as one cannot sort complex numbers.
// Thus we only look at the real part of the array data.
//
// If the array is not already sorted, it will be sorted. If it is already
// sorted then no harm will be done.
// Checked Monday, 16 January 2017

function quantile(arr, p)
	{
		if (typeof p !== 'number') throw new TypeError('p must be a number');
		if (arr.length == 0) return [0,0];
		var sdata = sort(arr);
		if (p <= 0) return [sdata[0], 0];
		if (p >= 1) return [sdata[sdata.length] - 2, 0];
		if (p == 1/2) return median(sdata);

		var index = (sdata.length/2) * p;
		var lower = Math.floor(index);
		var upper = lower + 1;
		var weight = index % 1;
		if (2*upper >= sdata.length) return [sdata[2*lower],0];
		return [sdata[2*lower] * (1 - weight) + sdata[2*upper] * weight, 0];
	};

// Returns the percentile of the given value in a sorted numeric array.
function percentRank(arr, v)
	{
		if (typeof v !== 'number') throw new TypeError('v must be a number');
		for (var i = 0, l = arr.length; i < l; i++)
			{
				if (v <= arr[i])
					{
						while (i < l && v == arr[i]) i++;
							if (i == 0) return 0;
							if (v !== arr[i-1])
								{
									i += (v - arr[i-1]) / (arr[i] - arr[i-1]);
								}
					return i / l;
					};
			};
		return 1;
	};


// ****************************************************************
// Copied from <https://gist.github.com/caseyjustus/1166258>
// See description from quantile (above) for more details
//
// Checked Monday, 16 January 2017

function median(data)
	{
	if (data.length == 0) return [0,0];
	var values = sort(data);
	var dLength = data.length >> 1

	if(oddQ(dLength)) // test if length is even or odd
		return [values[dLength-1], 0]; // odd
	else
		return [(values[dLength-2] + values[dLength]) / 2.0, 0]; // even
}


// ****************************************************************
// Based upon Mathematica's HistogramList function. Given an array of
// REAL numbers (not in complex format), produce a histogram list of the 
// occurrences of the values.
//
// The binWidth for the histograms is computed automatically. The data 
// are floating point numbers. If the number of data samples (e.g. pixels) is 
// N, the number of bins will be approximately sqrt(N).
//
// Checked Friday, 27 January 2017

function histogramList(thisData)
	{
	'use strict';

	var myData = thisData.slice();
	var totalN = myData.length;
	var extrema = getDynRange(myData);
	var range = extrema[0];
	var minval = extrema[1];
	var maxval = extrema[2];
	var dBins = Math.floor(Math.sqrt(totalN));
	var dlBins = dBins+1;
	var hBins = dBins+1;
	var binWidth = range / dBins; // automatically computed bin width;
	var frac = 0;
	var index = 0;
	
	// Create list of bin delimiters
	var delimitersList = Array(dlBins).fill(0);
	delimitersList[0] = minval - (binWidth/2)
	for (var i = 1; i <= dlBins; i++)
		delimitersList[i] = delimitersList[i-1] + binWidth;
		
	// Initialize histogram array
	var myHistogramList = Array(hBins).fill(0);
	for (var i = 0; i < totalN; i++)
		{
		frac = (myData[i] - minval)/range; // 0 ≤ frac ≤ 1
		index = Math.round(dBins*frac);
		myHistogramList[index] += 1;
		};
	return [delimitersList, myHistogramList];
	}

// ****************************************************************
// Based upon Mathematica's PearsonChiSquareTest function. There is a 
// hypothesis that data collected are from a certain probability
// distribution / density function. We examine the normalized mean square
// difference between the actual data histogram and the histogram from the
// hypothesized distribution with the same number of samples N.
// Based upon procedure found at <http://simplestatistics.org>

// The χ2 statistic uses the χ2 probability distribution which is an
// incomplete gamma function. See Numerical Recipes 6.2.18 which points
// to the procedure "gammp", "gammq", and others
//
// Checked Friday, 27 January 2017

function gammp(a, x) 
	{ // Note: no checking of variables
	var result = [];
	if (x < a+1) // use series approximation
		{
		result = gser(a, x);
		return result[0];
		}
	else // use continued fraction representation
		{
		result = gcf(a, x);
		return 1-result[0]; // and take complement
		};
	};
	
function gammq(a, x) 
	{ // Note: no checking of variables
	var result = [];
	if (x < a+1) // use series approximation
		{
		result = gser(a, x);
		return 1-result[0];
		}
	else // use continued fraction representation
		{
		result = gcf(a, x);
		return result[0]; // and take complement
		};
	};
	
function gser(a,x)
	{ // Note: no checking of variables
	var gamser = 0;
	var gln = gammln(a);
	var ap = a;
	var sum = 1/a;
	var del = sum;
	for (var n = 1; n <= iTMAX; n++)
		{
		++ap;
		del *= (x/ap);
		sum += del;
		if (Math.abs(del) < Math.abs(sum)*ePS)
			{
			gamser = sum*Math.exp(-x + (a*Math.log(x)) - gln);
			return [gamser, gln];
			};
		};
	throw("gser: a too large, iTMAX too small");
	};

function gcf(a,x)
	{ // Note: no checking of variables
	var gln = gammln(a);
	var b = x+1-a;
	var c = 1/fPMIN;
	var d = 1/b;
	var h = d;
	var an = 0;
	var del = 0;
	for (var i = 1; i <= iTMAX; i++)
		{
		an = -i*(i-a);
		b += 2;
		d = an*d + b;
		if (Math.abs(d) < fPMIN) d = fPMIN;
		c = b+(an/c);
		if (Math.abs(c) < fPMIN) c = fPMIN;
		d = 1/d;
		del = d*c;
		h *= del;
		if (Math.abs(del-1) < ePS) break;
		};
	if (i > iTMAX) throw("gcf: a too large, iTMAX too small");
	var gammcf = Math.exp(-x + (a*Math.log(x)) - gln)*h;
	return [gammcf, gln];
	
	};

function gammln(xx)
	{ // Note: no checking of variables
	var cof = [76.18009172947146, -86.50532032941677, 24.01409824083091,
		-1.231739572450155, 0.1208650973866179e-2,-0.5395239384953e-5];
	var x = xx;
	var y = x;
	var tmp = x+5.5;
	tmp = tmp - (x+0.5)*Math.log(tmp);
	var ser = 1.000000000190015;
	for (var j = 0; j < cof.length; j++)
		{
		++y;
		ser += (cof[j]/y);
		};
	return -tmp+Math.log(2.506628274631005*ser/x);
	};
	
// ****************************************************************
// Here begin the various density functions currently supported in this test
function gaussDensity(mu,sigma,totalN,delimiters)
	{
	// Gaussian does NOT need these:
	// delimiters[0] = -Infinity;
	// delimiters[delimiters.length - 1] = Infinity;

	// the expected histogram cells to be returned
	var bins = delimiters.length - 1;
	var probP = 0;
	var cells = Array(bins).fill(0);
	var normalize = 0;
	var aconst = 1/Math.sqrt(2*Math.PI);
	for (var i = 0; i < bins-1; i++)
		{
		// probability of being in this bin
		probP = cdfGauss(delimiters[i+1], mu, sigma) - cdfGauss(delimiters[i], mu, sigma);
		normalize += probP;
		cells[i] = probP;
		};
		
	// correct for the use of a limited number of bins of finite width
	var bconst = totalN / normalize;
	let tTotal = 0;
	for (var i = 0; i < bins; i++)
		{
		cells[i] *= bconst;
		tTotal += cells[i];
		};
	return cells;
	};

function laplaceDensity(mid,b,totalN,delimiters)
	{
	// Laplace needs these:
	delimiters[0] = -Infinity;
	delimiters[delimiters.length - 1] = Infinity;

	// the expected histogram cells to be returned
	var bins = delimiters.length - 1;
	var cells = Array(bins).fill(0);
	
	var prob = 0;
	var normalize = 0;
	for (var i = 0; i < bins; i++)
		{
		// probability of each bin
		prob = cdfLaplace(delimiters[i+1],mid,b) - cdfLaplace(delimiters[i],mid,b);
		normalize += prob;
		cells[i] = prob;
		};
		
	// correct for the use of a limited number of bins
	var bconst = totalN / normalize;
	let tTotal = 0;
	for (var i = 0; i < bins; i++)
		{
		cells[i] *= bconst;
		tTotal += cells[i];
		};
	return cells;
	};

function uniformDensity(left,right,totalN,delimiters)
	{
	// the expected histogram cells to be returned
	var cells = Array(delimiters.length-1).fill(0);
	var bins = cells.length;
	var prob = 1/bins;
	var expect = totalN*prob;
	for (var i = 0; i < bins; i++)
		{
		cells[i] = expect;
		};
	return cells;
	};

// ****************************************************************
function chiSquaredGoodnessOfFit(data, distributionType)
	{
	'use strict';

	// The binWidth is computed automatically.
	// For more information, See "histogramList".
	
	var avg = mean(data)[0]; // ML estimate of mean
	var std = stdev(data)[0]; // ML estimate of sigma
	var middle = median(data)[0]; // ML estimate of middle

	var myData = uRs(data);
	var histoResults = histogramList(myData);
	var totalN = myData.length; // real data format
	var delimiters = histoResults[0].slice(); // delimiters on histogram bins

	// Estimate parameters from the sample data
	var ttotal = 0;
	for (var i = 0; i < totalN; i++)
		ttotal += Math.abs(myData[i] - middle);
	var inputWidth = ttotal / totalN; // ML estimate of width

	var extrema = getDynRange(myData);
	var range = extrema[0];
	var lower = extrema[1];
	var upper = extrema[2];
	
	var nParams = 0;
	var hypothesizedN = [];
	
	// Generate the hypothesized distribution.
	switch(distributionType)
		{
		case "Gauss":
			{
			hypothesizedN = gaussDensity(avg,std,totalN,delimiters);
			nParams = 2; // mean & sigma
			break;
			}
	
	// See <https://en.wikipedia.org/wiki/Laplace_distribution#Parameter_estimation>
		case "Laplace":
			{
			hypothesizedN = laplaceDensity(middle,inputWidth,totalN,delimiters);
			nParams = 2; // middle & width
			break;
			}
	
		case "Uniform":
			{
			hypothesizedN = uniformDensity(lower,upper,totalN,delimiters);
			nParams = 2; // lower & upper
			break;
			}
	
		default: throw("Non-existent probability choice");
		};

	var observed = histoResults[1].slice(); // binned histogram
	var expected = hypothesizedN.slice(); // same length as observed
	
	let tO = observed.slice();
	let tE = expected.slice();

	// Working backward and forwards through the hypothesized (expected)
	// frequencies, collapse bins if less than three observations are expected
	// for a bin. This transformation is applied to the observed frequencies
	// as well so that both arrays will have the same length. Duh!

	// see W.G. Cochran, "Some Methods for Strengthening the Common Chi-Square
	// Tests", Biometrics,10, 417-450, 1954.
	let cutoff = 3; // all experiments will have a large number of samples, thus...
	let theLength = expected.length;
	for (var k = theLength-1; k > 0; k--)
		{
		if (expected[k] < cutoff)
			{
			expected[k-1] += expected[k];
			expected.splice(k, 1);

			observed[k-1] += observed[k];
			observed.splice(k, 1);
			};
		};
		
	for (var k = 0; k < theLength-1; k++)
		{
		if (expected[k] < cutoff)
			{
			expected[k+1] += expected[k];
			expected.splice(k, 1);

			observed[k+1] += observed[k];
			observed.splice(k, 1);
			};
		};

	// Degrees of freedom = (number of class intervals -
	// the number of independent parameters for the distribution - 1).
	var n = Math.min(observed.length,expected.length);
	var degreesOfFreedom = n - nParams - 1;
	var chiSquared = 0;
	var o = 0;
	var e = 0;
	var q = 0;
	let sumO = 0;
	let sumE = 0;
	for (var i = 0; i < n; i++)
		{
		o = observed[i];
		e = expected[i];
		q = o-e;
		chiSquared += (q*q)/e;
		sumO += o;
		sumE += e;
		};

	// We want probChiSquared close to 1.0 if the null hypothesis
	// (good fit) is not to be rejected.
	let probChiSquared = gammq(degreesOfFreedom/2,chiSquared/2);
	return [degreesOfFreedom, chiSquared, probChiSquared]
	};

// ****************************************************************
// Based upon Mathematica's TTest function and "Numerical Recipes in C",
// Second Edition, Section 14.2. There is a hypothesis that data collected
// are from a certain probability distribution with mean mu. This is the
// "one-sample test concerning means". This routine uses the Student-t test
// to see if this hypothesis, Ho, should be rejected.

// The t statistic uses the incomplete beta function Numerical Recipes 6.4
// which points to the procedure "betai" and "betacf".
//
// Checked Tuesday, 28 February 2017

function betai(a, b, x) 
	{
	if ( (x < 0.0) || (x > 1) ) throw("routine betai: bad x");
	var bt = 0.0;
	if ( (x == 0.0) || (x == 1.0) )
		bt = 0.0;
	else
		bt = Math.exp(gammln(a+b) - gammln(a) - gammln(b) +
		 a*Math.log(x) + b*Math.log(1-x));
	if ( x < (a+1)/(a+b+2) )
		return bt*betacf(a,b,x)/a; // direct use of continued fraction exp.
	else
		return 1-bt*betacf(b,a,1-x)/b; // symmetry xform then continued fraction exp.
	};
	
	
function betacf(a, b, x)
	{ // Note: no checking of variables
	var qab = a+b;
	var qap = a+1;
	var qam = a-1;
	var c = 1;
	var d = 1 - (qab*x/qap);
	if (Math.abs(d) < fPMIN) d = fPMIN;
	d = 1/d;
	var h = d;
	var m2 = 0;
	var aa = 0;
	var del = 0;

	for (var m = 1; m <= iTMAX; m++)
		{
		m2 = 2*m;
		aa = m*(b-m)*x/((qam+m2)*(a+m2));
		d = 1+(aa*d); // even step of the recurrence
		if (Math.abs(d) < fPMIN) d = fPMIN;
		c = 1+(aa/c);
		if (Math.abs(c) < fPMIN) c = fPMIN;
		d = 1/d;
		h = h*(d*c);
		aa = -(a+m)*(qab+m)*x/((a+m2)*(qap+m2));
		d = 1+(aa*d); // odd step of the recurrence
		if (Math.abs(d) < fPMIN) d = fPMIN;
		c = 1+(aa/c);
		if (Math.abs(c) < fPMIN) c = fPMIN;
		d = 1/d;
		del = d*c;
		h *= del;
		if (Math.abs(del-1) < ePS) break; // are we done?
		};

	if (m > iTMAX) throw("betacf: m or b too large or iTMAX too small");
	return h;
	};


// ****************************************************************
function tTest(data, mu)
	{
	'use strict';
	// Estimate mean & standard deviation from the sample data
	var avg = mean(data)[0]; // ML estimate of average
	var std = stdev(data)[0]; // ML estimate of standard deviation
	var dof = (data.length >> 1) - 1; // degrees-of-freedom
	
	var t = (avg - mu)*Math.sqrt(dof)/std;
	
	// We want probability > alpha if the null hypothesis
	// (avg ≈ mu) is not to be rejected at the alpha percent level.
	var probT = betai(dof/2, 0.5, dof/(dof + t*t));

	return [dof, t, probT]
	};


// ****************************************************************
// Based upon Mathematica's SignTest function. There is a hypothesis that
// data collected are from a certain probability distribution with median mu.
// This version is a "one-sample test concerning means". The test statistic
// is assumed to follow a BinomialDistribution[n,1/2] where n is the number
// of elements in the data not equal to 0.
//
// The Sign statistic uses the incomplete beta function as described in
// Numerical Recipes 6.4, "Cumulative Binomial Probability Distribution"
// which points to the procedures "betai" and "betacf".
//
// Checked Tuesday, 28 February 2017


function signTest(data, med)
	{
	'use strict';
	// Estimate mean & standard deviation from the sample data
	var middle = median(data)[0]; // ML estimate of average
	var n = data.length/2; // number of samples
	
	var nPos = 0
	var nNeg = 0;
	for (var i = 0; i < data.length; i += 2)
		{
		if (data[i] > med)
			++nPos; // how many values above the median
		else if (data[i] < med)
			++nNeg; // how many values below the median
		else break;
		};
	
	var n = nPos + nNeg;
	var nMax = Math.max(nPos,nNeg); // See https://en.wikipedia.org/wiki/Sign_test
	
	// We want probability > alpha if the null hypothesis
	// (median ≈ med) is not to be rejected at the alpha percent level.
	// See https://en.wikipedia.org/wiki/Sign_test (again)
	var probS = 2*betai(nMax, n-nMax+1, 1/2);

	return [n, nMax, probS]
	};


// ****************************************************************
// Based upon Mathematica's KolmogorovSmirnovTest function. There is a 
// hypothesis that data collected is from a certain continuous (!) probability
// density function. We examine the absolute distance between the actual data
// cumulative and the cumulative from the hypothesized distribution
// Based upon procedure found in Knuth II Section 3.3.1B and Numerical Recipes
// Second in C, Section 14.3 
//
// Checked Wednesday, 8 February 2017

function cdfGauss(x, mean, std)
	{
	return 0.5 * (1 + erf((x - mean) / (std*Math.SQRT2)));
	};

function erf(x)
	{
	// save the sign of x
	var sign = (x >= 0) ? 1 : -1;
	x = Math.abs(x);

	// constants
	const a1 = 0.254829592;
	const a2 = -0.284496736;
	const a3 = 1.421413741;
	const a4 = -1.453152027;
	const a5 = 1.061405429;
	const p = 0.3275911;

	// Abramowitz & Stegun formula 7.1.26
	var t = 1.0/(1.0 + p*x);
	var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
	return sign * y; // erf(-x) = -erf(x);
	};
	
function cdfLaplace(x, m, b)
	{
	if (x == m)
		y = 1/2;
	else if (x < m)
		y = Math.exp((x-m)/b)/2;
	else
		y = 1 - Math.exp(-(x-m)/b)/2; 
	return y;
	};

function cdfUniform(x, lower, upper)
	{
	return (x-lower)/(upper - lower);
	};

// ****************************************************************
function probks(alam)
	{
	var ePS1 = 0.001;
	var ePS2 = 1e-8;
	var iter = 100;
	
	var fac = 2.0;
	var sum = 0.0;
	
	var term = 0.0;
	var termbf = 0.0;
	
	var a2 = -2.0*alam*alam;
	for (var j = 1; j <= iter; j++)
		{
		term = fac * Math.exp(a2*j*j);
		sum += term;
		if (Math.abs(term) <= ePS1*termbf || Math.abs(term) <= ePS2*sum)
			return sum;
		fac = -fac; // alternating signs in sum
		termbf = Math.abs(term);
		};
	return 1.0; // only if failing to converge
	};

// ****************************************************************
// <https://en.wikipedia.org/wiki/Kolmogorov–Smirnov_test#Test_with_estimated_parameters>
// If either the form or the parameters of F(x) are determined from the data, then
// the critical values determined in this way are invalid. In such cases,
// Monte Carlo or other methods may be required, but tables have been prepared.... 
// this means kstwo (ks2GoodnessOfFit) instead of ksone
//
//
// Checked Wednesday, 8 February 2017

function ksone(data, distributionType)
	{
	var fo = 0.0;
	var ff = 0.0;
	var fn = 0.0;
	var dt = 0;
	
	var sorted = sort(data);
	var n = sorted.length/2;
	var d = 0.0;
	
	// Use the hypothesized distribution.
	switch(distributionType)
		{
		case "Gauss":
			var avgData = mean(data)[0]; // ML estimate of mean (Gauss)
			var stdData = stdev(data)[0]; // ML estimate of sigma (Gauss)
			
			for (var j = 1; j <= n; j++)
				{
				fn = j / n;
				ff = cdfGauss(sorted[2*(j-1)], avgData, stdData);
				dt = Math.max(Math.abs(fo-ff),Math.abs(fn-ff));
				if (dt > d) d = dt;
				fo = fn;
				}
			break;
	// See <https://en.wikipedia.org/wiki/Laplace_distribution#Parameter_estimation>
		case "Laplace":
			var middleEst = median(data)[0]; // ML estimate of middle (Laplace)
			var ttotal = 0;
			for (var i = 0; i < n; i++)
				ttotal += Math.abs(data[2*i] - middleEst);
			var bEst = ttotal / n; // ML estimate of width (Laplace)
			
			for (var j = 1; j <= n; j++)
				{
				fn = j / n;
				ff = cdfLaplace(sorted[2*(j-1)], middleEst, bEst);
				dt = Math.max(Math.abs(fo-ff),Math.abs(fn-ff));
				if (dt > d) d = dt;
				fo = fn;
				}
			break;
		default: throw("Non-existent probability choice");
		};
		var corrKS = Math.sqrt(n) + 0.12 + (0.11/n);
		var prob = probks(corrKS*d);
		return [d, prob];
	};

// ****************************************************************
function ks2GoodnessOfFit(data1, distributionType)
	{
	var fo = 0.0;
	var ff = 0.0;
	var fn = 0.0;
	var dt = 0;
	
	var sorted1 = sort(data1);
	var n1 = sorted1.length/2;
	var dataMC = Array(2*n1); // MC = Monte Carlo method

	var d = 0.0;
	var prob = 0.0;
	
	// Use the hypothesized distribution.
	switch(distributionType)
		{
		case "Gauss":
			// generate a Gaussian data set with same length, mean, sigma
			var avgData = mean(data1)[0]; // ML estimate of mean (Gauss)
			var stdData = stdev(data1)[0]; // ML estimate of sigma (Gauss)
			
			for (var i = 0; i < 2*n1; i += 2) // generate MC data
				{
				dataMC[i] = randomGaussian(avgData,stdData);
				dataMC[i+1] = 0;
				};

				
			var sorted2 = sort(dataMC);
			var n2 = n1;
			var j1 = 1;
			var j2 = 1;
			var fn1 = 0.0;
			var fn2 = 0.0;
			var d1 = 0;
			var d2 = 0;
			
			while (j1 <= n1 && j2 <= n2)
				{
				d1 = sorted1[2*(j1-1)];
				d2 = sorted2[2*(j2-1)];
				if (d1 <= d2)
					{
					fn1 = j1 / n1;
					j1 += 1;
					};
				if (d2 <= d1)
					{
					fn2 = j2 / n2;
					j2 += 1;
					};
				dt = Math.abs(fn2 - fn1);
				if (dt > d)
					d = dt;
				};
				
			var n = Math.sqrt((n1*n2)/(n1+n2));
			var corrKS = Math.sqrt(n) + 0.12 + (0.11/n);
			prob = probks(corrKS*d);
			break;
			
	// See <https://en.wikipedia.org/wiki/Laplace_distribution#Parameter_estimation>
		case "Laplace":
			// generate a Laplace data set with same length, middle, width
			var middleEst = median(data1)[0]; // ML estimate of middle (Laplace)
			var ttotal = 0;
			for (var i = 0; i < 2*n1; i += 2)
				ttotal += Math.abs(data1[i] - middleEst);
			var bEst = ttotal / n1; // ML estimate of width (Laplace)
			
			for (var i = 0; i < 2*n1; i += 2) // generate MC data
				{
				dataMC[i] = randomLaplace(middleEst,bEst);
				dataMC[i+1] = 0;
				};
				
			var sorted2 = sort(dataMC);
			var n2 = n1;
			var j1 = 1;
			var j2 = 1;
			var fn1 = 0.0;
			var fn2 = 0.0;
			var d1 = 0;
			var d2 = 0;
			var d = 0.0;
			
			while (j1 <= n1 && j2 <= n2)
				{
				d1 = sorted1[j1-1];
				d2 = sorted2[j2-1];
				if (d1 <= d2)
					{
					fn1 = j1 / n1;
					j1 += 1;
					};
				if (d2 <= d1)
					{
					fn2 = j2 / n2;
					j2 += 1;
					};
				dt = Math.abs(fn2 - fn1);
				if (dt > d)
					d = dt;
				};
				
			var n = Math.sqrt((n1*n2)/(n2+n1));
			var corrKS = Math.sqrt(n) + 0.12 + (0.11/n);
			prob = probks(corrKS*d);
			break;
		default: throw("Non-existent probability choice");
		};
	return [d, prob];
	};


