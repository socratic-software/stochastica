// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2020
// Licensed under the MIT license.
// ****************************************************************
var els = document.getElementsByClassName("listroman");

for (var i=0; i<els.length; i++) {
    el = els.item(i);
    el.classList.remove('listroman');
    par = el.parentElement;
    par.classList.add('listroman');
}

var els = document.getElementsByClassName("listalpha");

for (var i=0; i<els.length; i++) {
    el = els.item(i);
    el.classList.remove('listalpha');
    par = el.parentElement;
    par.classList.add('listalpha');
}

window.addEventListener('statusTap', function() {
	// Max safe 32-bit number = (2**31) - 1
	let scrollRight = 0;
	let scrollDown = (2**31) - 1;
	window.scroll(scrollRight,scrollDown);
	}, false);


