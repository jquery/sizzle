/*
 * Check the necessity of the java applet and add it if needed
 */

define(function() {
	var measured,
		perfNow,
		begin = new Date;

	// is the applet permitted?
	if ( !/[?&]nojava=true(?:&|$)/.test(window.location.search) ) {
		// is the applet really needed?
		while (!(measured = new Date - begin)) { }
		if ( measured !== 1 &&
			!( (perfNow = window.performance) && typeof (perfNow.now || perfNow.webkitNow) === "function" ) ) {
			// load applet
			document.write("<applet code=\"nano\" archive=\"benchmark.js/nano.jar\"></applet>");
		}
	}
});
