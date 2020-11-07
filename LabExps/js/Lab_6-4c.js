// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// Laboratory experiment 6.4 (c)
// i.t. young
// Thursday, 28 September 2017
// 
// ****************************************************************
// checked Tuesday, 3 October 2017


function executeLab_6_4c( )
	{
	// critical values defined here (for now)
	dispState = 'SH';
	digiState = 'ANALOG';

	rotateSymmetrics();
	myFunctionZoom(thisZoom);

// signal processing initiating ends here
// *****************************************************************
// now start displays

	for (var i = startSample; i < stopSample; i++)
		{
		xDataDT[i] = i; // discrete time index
		tauDT[i] = i - middleSample;
		xDataCT[i] = 1000*i/sampFreq; // continuous time in [ms]
		tauCT[i] = 1000*(i - middleSample)/sampFreq;
		zeroes[i] = 0;
		};
	for (var i = 0; i < nLabels; i++)
		{
		freqTicks[i] = Math.floor(i*newSamples/(nLabels-1));
		if (i == (nLabels-1)) freqTicks[i] = newSamples-1;
		freqLabels[i] = d1round(sampFreq*(i - ((nLabels-1)/2))/4000);
		};
		
	// raw data: signal & amplitude histogram
	
	rstg.x = binning(xDataCT,binningFactor);
	rstg.y = binning(yData,binningFactor);
	
	rstl.title = 'Exponential noise';
	rstl.annotations[0].text = 't [ms]';
	
	rhg.x = yData;
	nbins = Math.floor(Math.sqrt(rhg.x.length));
	rhg.nbinsx = nbins;
	rhg.xbins.start = getMinOfArray(rhg.x);
// 	rhg.xbins.end = getMaxOfArray(rhg.x);

	rhl.title = 'Amplitude histogram';
	rhl.annotations[0].text = 'signal amplitude';

	// filtered data: signal & amplitude histogram
	fstg.x = rstg.x;
	fstg.y = binning(yfData,binningFactor);

	fstl.title = 'Filtered exponential noise';
	fstl.annotations[0].text = 't [ms]';

	fhg.x = yfData;
	fhg.nbinsx = nbins;
	fhg.xbins.start = getMinOfArray(fhg.x);
// 	fhg.xbins.end = getMaxOfArray(fhg.x);

	fhl.title = 'Filtered amplitude histogram';
	fhl.annotations[0].text = 'signal amplitude';
	
	// this is where the first (empty) display gets placed
	myFunctionDisp(dispState,digiState,wA,wB,wC,wD);

	// to be used below when switching dispState
	// raw & filtered data, corr. function, power spectral densities & filter
	
	var rotSamples = Math.floor(autoCorrData.length/2);

	// these "symmetrics" require binning because they are ANALOG
	rctg.y = rotateRight(binning(autoCorrData,binningFactor),binningFactor/2);
	rctg.x = binning(tauCT,binningFactor);
	
	rctl.title = 'Normalized 𝜑<sub>ee</sub>(\u03C4 = kT)';
	rctl.annotations[0].text = tau+' [ms]';
	autoCorrData = rotateRight(autoCorrData,rotSamples);

	fctg.y = rotateRight(binning(autoFiltCorrData,binningFactor),binningFactor/2);
	fctg.x = rctg.x;
	
	fctl.title = 'Normalized 𝜑<sub>FF</sub>(\u03C4 = kT)';
	fctl.annotations[0].text = rctl.annotations[0].text;
	autoFiltCorrData = rotateRight(autoFiltCorrData,rotSamples);

	rpg.y = rotateRight(binning(rpsd,binningFactor),binningFactor/2);
	rpg.x = binning(xDataDT,binningFactor);
	rpl.title = 'S<sub>ee</sub>(2\u03C0f)';
	freqTicks[nLabels-1] = rpg.x[rpg.x.length-1];
	rpl.xaxis4.tickvals = freqTicks;
	rpl.xaxis4.ticktext = freqLabels;
	rpl.annotations[0].text = 'f  [kHz]';
	rpsd = rotateRight(rpsd,rotSamples);

	fpg.y = rotateRight(binning(fpsd,binningFactor),binningFactor/2);
	fpg.x = rpg.x;
	fpl.title = 'S<sub>FF</sub>(2\u03C0f)';
	fpl.xaxis4.tickvals = rpl.xaxis4.tickvals;
	fpl.xaxis4.ticktext = rpl.xaxis4.ticktext;
	fpl.annotations[0].text = rpl.annotations[0].text;
	fpsd = rotateRight(fpsd,rotSamples);

	// these do not require binning because they are DIGITAL
	rsdg.x = xDataDT;
	rsdg.y = yData;
	rsdg.error_y.array = zeroes;
	rsdg.error_y.arrayminus = yData;
	rsdl.annotations[0].text = 'n';

	fsdg.x = rsdg.x;
	fsdg.y = yfData;
	fsdg.error_y.array = rsdg.error_y.array;
	fsdg.error_y.arrayminus = yfData;
	fsdl.title = 'Filtered exponential noise';
	fsdl.annotations[0].text = rsdl.annotations[0].text;

	rcdg.x = tauDT;
	rcdg.y = autoCorrData;
	rcdl.title = 'Normalized 𝜑<sub>ee</sub>[k]';
	rcdl.annotations[0].text = 'k';

	fcdl.title = 'Normalized 𝜑<sub>FF</sub>[k]';
	fcdl.annotations[0].text = rcdl.annotations[0].text;

	var deltaN = 0; // change in number of samples (zoom)
	var power = 0;

// Await interaction
	};
