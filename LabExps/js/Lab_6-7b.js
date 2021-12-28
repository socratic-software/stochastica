// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2022
// Licensed under the MIT license.
// Laboratory experiment 6.7 (b)
// i.t. young
// Thursday, 28 September 2017
// 
// ****************************************************************
// checked Tuesday, 3 October 2017


function executeLab_6_7b( )
	{
	// critical values defined here (for now)
	dispState = 'SH';
	digiState = 'ANALOG';

	thisAlg = 'f';
	leftCoeffs = [1,0];
	rightCoeffs = youngBPFilter;
	coefficients = [ leftCoeffs, rightCoeffs ];
	process_6_7( );
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
		
		if (i < (nLabels-1)>>1)
			freqLabels[i] = evenQ(i) ? negPiSymbol : negPiSymbol+'/'+(2*scaleLabel)
		else if (i == (nLabels-1)>>1)
			freqLabels[i] = 0
		else
			freqLabels[i] = evenQ(i) ? posPiSymbol : posPiSymbol+'/'+(2*scaleLabel)
		};
		
	// raw data: signal & amplitude histogram
	
	rstg.x = binning(xDataCT,altBinningFactor);
	rstg.y = binning(yData,altBinningFactor);
	
	rstl.title = 'Gaussian noise';
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
	fstg.y = binning(yfData,altBinningFactor);

	fstl.title = 'Filtered Gaussian noise';
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
	
	var rotSamples = autoCorrData.length >> 1;

	// these "symmetrics" require binning because they are ANALOG
	rctg.y = rotateRight(binning(autoCorrData,altBinningFactor),altBinningFactor>>1);
	rctg.x = binning(tauCT,altBinningFactor);
	
	rctl.title = 'Normalized 𝜑<sub>gg</sub>(\u03C4 = kT)';
	rctl.annotations[0].text = tau+' [ms]';
	autoCorrData = rotateRight(autoCorrData,rotSamples);

	fctg.y = rotateRight(binning(autoFiltCorrData,altBinningFactor),altBinningFactor>>1);
	fctg.x = rctg.x;
	
	fctl.title = 'Normalized 𝜑<sub>FF</sub>(\u03C4 = kT)';
	fctl.annotations[0].text = rctl.annotations[0].text;
	autoFiltCorrData = rotateRight(autoFiltCorrData,rotSamples);

	rpg.y = rotateRight(binning(rpsd,altBinningFactor),altBinningFactor>>1);
	rpg.x = binning(xDataDT,altBinningFactor);
	rpl.title = 'log<sub>10</sub> S<sub>gg</sub>(Ω)';
	freqTicks[nLabels-1] = rpg.x[rpg.x.length-1];
	rpl.xaxis4.tickvals = freqTicks;
	rpl.xaxis4.ticktext = freqLabels;
	rpl.annotations[0].text = Omega;
	rpsd = rotateRight(rpsd,rotSamples);

	fpg.y = rotateRight(binning(origFilter,altBinningFactor),altBinningFactor>>1);
	fpg.x = rpg.x;
	fpl.title = 'log<sub>10</sub> S<sub>FF</sub>(Ω)/S<sub>gg</sub>(Ω)';
	fpl.xaxis4.tickvals = rpl.xaxis4.tickvals;
	fpl.xaxis4.ticktext = rpl.xaxis4.ticktext;
	fpl.annotations[0].text = rpl.annotations[0].text;
	origFilter = rotateRight(origFilter,rotSamples);

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
	fsdl.title = 'Filtered Gaussian noise';
	fsdl.annotations[0].text = rsdl.annotations[0].text;

	rcdg.x = tauDT;
	rcdg.y = autoCorrData;
	rcdl.title = 'Normalized 𝜑<sub>gg</sub>[k]';
	rcdl.annotations[0].text = 'k';

	fcdg.x = rcdg.x;
	fcdg.y = autoFiltCorrData;
	fcdl.title = 'Normalized 𝜑<sub>FF</sub>[k]';
	fcdl.annotations[0].text = rcdl.annotations[0].text;

	deltaN = 0; // change in number of samples (zoom)
	power = 0;

	// Await interaction
	};
