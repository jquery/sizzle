/*
 * Performance test suite using benchmark.js
 */

define([ "require", "benchmark.js/benchmark", "domReady!", "text!selectors.css", "data/checkJava" ],
function( require, Benchmark, document, selectors ) {

	// Convert selectors to an array
	selectors = selectors.split("\n");

	var // Test HTML file name in the data folder
		testHtml = "selector",

		// Whether to allow the use of QSA by the selector engines
		useQSA = false,

		// Queue for benchmark suites
		suites = [],

		// Keep track of all iframes
		iframes = {},

		// Selector engines
		engines = {
			"qsa":            "d.querySelectorAll( s )",
			"dojo":           "dojo.query( s )",
			"mootools-slick": "Slick.search( d, s )",
			"nwmatcher":      "NW.Dom.select( s )",
			"qwery":          "qwery( s )",
			"jquery-1.4.4":   "jQuery.find( s )",
			"jquery-1.7.2":   "jQuery.find( s )",
			"jquery-1.8.1":   "jQuery.find( s )",
			"sizzle":         "Sizzle( s )"
		},

		// Just cause I'm lazy
		numEngines = (function() {
			var engine,
				count = 0;
			for ( engine in engines ) {
				if ( engines.hasOwnProperty(engine) ) {
					count++;
				}
			}
			return count;
		})(),

		selectorIndex = 0;

	// Expose iframeCallbacks
	window.iframeCallbacks = {};

	/**
	 * Add random number to the url to stop caching
	 *
	 * @private
	 * @param {String} value The url to which to add cache control
	 * @returns {String} Returns the new url
	 *
	 * @example url("data/test.html")
	 * // => "data/test.html?10538358428943"
	 *
	 * @example url("data/test.php?foo=bar")
	 * // => "data/test.php?foo=bar&10538358345554"
	 */
	function url( value ) {
		return value + (/\?/.test( value ) ? "&" : "?") + new Date().getTime() + "" + parseInt( Math.random() * 100000, 10 );
	}

	/**
	 * Gets the Hz, i.e. operations per second, of `bench` adjusted for the
	 *  margin of error.
	 *
	 * @private
	 * @param {Object} bench The benchmark object.
	 * @returns {Number} Returns the adjusted Hz.
	 */
	function getHz( bench ) {
		return 1 / ( bench.stats.mean + bench.stats.moe );
	}

	/**
	 * Creates an iframe for use in testing a selector engine
	 *
	 * @private
	 * @param {String} engine Indicates which selector engine to load in the fixture
	 * @param {String} suite Name of the Benchmark Suite to use
	 * @param {Number} callbackIndex Index of the iframe callback for this iframe
	 * @returns {Element} Returns the iframe
	 */
	function createIframe( engine, suite, callbackIndex ) {
		var src = url( "./data/" + testHtml + ".html?engine=" + engine + "&suite=" + suite + "&callback=" + callbackIndex + "&qsa=" + useQSA ),
			iframe = document.createElement("iframe");
		iframe.setAttribute( "src", src );
		iframe.style.cssText = "width: 500px; height: 500px; position: absolute; top: -600px; left: -600px; visibility: hidden;";
		document.body.appendChild( iframe );
		iframes[ suite ].push( iframe );
		return iframe;
	}

	/**
	 * Runs a Benchmark suite from within an iframe
	 *  then destroys the iframe
	 * Each selector is tested in a fresh iframe
	 *
	 * @private
	 * @param {Object} suite Benchmark Suite to which to add tests
	 * @param {String} selector The selector being tested
	 * @param {String} engine The selector engine begin tested
	 * @param {Function} iframeLoaded Callback to call when the iframe has loaded
	 */
	function addTestToSuite( suite, selector, engine, iframeLoaded ) {

		/**
		 * Run selector tests with a particular engine in an iframe
		 *
		 * @param {Function} r Require in the context of the iframe
		 * @param {Object} document The document of the iframe
		 */
		function test( document ) {
			var win = this,
				select = new Function( "w", "s", "d", "return " + (engine !== "qsa" ? "w." : "") + engines[ engine ] );
			suite.add( engine + " : " + selector, function() {
				select( win, selector, document );
			});
			if ( typeof iframeLoaded !== "undefined" ) {
				iframeLoaded();
			}
		}

		// Called by the iframe
		var index,
			name = suite.name,
			callbacks = window.iframeCallbacks[ name ];

		index = callbacks.push(function() {
			var self = this,
				args = arguments;
			setTimeout(function() {
				test.apply( self, args );
			}, 0 );
		}) - 1;

		// Load fixture in iframe and add it to the list
		createIframe( engine, name, index );
	}

	/**
	 * Tests a selector in all selector engines
	 *
	 * @private
	 * @param {String} selector Selector to test
	 */
	function testSelector( selector ) {
		var engine, len,
			suite = Benchmark.Suite( selector ),
			name = suite.name,
			count = numEngines;

		/**
		 * Called when an iframe has loaded for a test.
		 *   Need to wait until all iframes
		 *   have loaded to run the suite
		 */
		function loaded() {
			// Run the suite
			if ( --count === 0 ) {
				suite.run();
			}
		}

		// Add spots for iframe callbacks and iframes
		window.iframeCallbacks[ name ] = [];
		iframes[ name ] = [];

		// Add the tests to the new suite
		for ( engine in engines ) {
			addTestToSuite( suite, selector, engine, loaded );
		}
	}

	/* Benchmark Options
	---------------------------------------------------------------------- */

	Benchmark.options.async = true;
	Benchmark.options.onError = function( error ) {
		debugger;
		console.error( error );
	};

	/* Benchmark Suite Options
	---------------------------------------------------------------------- */
	Benchmark.Suite.options.onStart = function() {
		console.log( this.name + ":" );
	};
	Benchmark.Suite.options.onCycle = function( event ) {
		console.log( event.target );
	};
	Benchmark.Suite.options.onComplete = function() {
		var formatNumber = Benchmark.formatNumber,
			fastest = this.filter("fastest"),
			fastestHz = getHz(fastest[0]),
			slowest = this.filter("slowest"),
			slowestHz = getHz(slowest[0]),
			i = 0,
			len = iframes[ this.name ].length;

		var percent = ( (fastestHz / slowestHz) - 1 ) * 100;

		console.log(
			fastest[0].name + " is " +
			formatNumber( percent < 1 ? percent.toFixed(2) : Math.round(percent) ) +
			"% faster."
		);

		// Remove all added iframes for this suite
		for ( ; i < len; i++ ) {
			document.body.removeChild( iframes[ this.name ].pop() );
		}
		delete iframes[ this.name ];

		// Remove all callbacks on the window for this suite
		window.iframeCallbacks[ this.name ] = null;
		try {
			// Errors in IE
			delete window.iframeCallbacks[ this.name ];
		} catch( e ) {}

		if ( ++selectorIndex < selectors.length ) {
			testSelector( selectors[selectorIndex] );
		}
	};

	// GOOOOO
	testSelector( selectors[selectorIndex] );

});
