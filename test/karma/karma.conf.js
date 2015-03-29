"use strict";

var grunt = require( "grunt" );

module.exports = function( config ) {
	var isTravis = process.env.TRAVIS,
		dateString = grunt.config( "dateString" );

	config.set({
		browserStack: {
			project: "sizzle",
			build: "local run" + (dateString ? ", " + dateString : ""),
			timeout: 600 // 10 min
		},

		// Can't specify path as "../../test" which would be intuitive
		// because if we do, karma will make paths outside "test" folder absolute
		// that will break iframe tests
		basePath: "../../",

		frameworks: [ "qunit" ],

		files: [
			"external/jquery/jquery.js",
			"dist/sizzle.js",
			"test/data/testingPseudos.js",

			// Base fixtures
			{
				pattern: "test/data/fixtures.html",
				watched: false
			},

			"test/data/testinit.js",
			"test/data/testrunner.js",
			"test/data/empty.js",

			"test/unit/selector.js",
			"test/unit/utilities.js",
			"test/unit/extending.js",

			// For iframe tests
			{
				pattern: "test/data/mixed_sort.html",
				watched: false,
				included: false
			}
		],

		preprocessors: {

			// mixed_sort.html downloaded through iframe inclusion
			// so it should not be preprocessed
			"test/data/mixed_sort.html": [],
			"test/data/fixtures.html": [ "html2js" ]
		},

		// Add BrowserStack launchers
		customLaunchers: require( "./launchers" ),

		// Make travis output less verbose
		reporters: isTravis ? "dots" : "progress",

		colors: !isTravis,

		port: 9876,

		// Possible values:
		// config.LOG_DISABLE
		// config.LOG_ERROR
		// config.LOG_WARN
		// config.LOG_INFO
		// config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 3e5,
		browserNoActivityTimeout: 3e5,
		browserDisconnectTimeout: 3e5,
		browserDisconnectTolerance: 3
	});

	// Deal with Travis environment
	if ( isTravis ) {

		// Browserstack launcher specifies "build" options as a default value
		// of "TRAVIS_BUILD_NUMBER" variable, but this way a bit more verbose
		config.browserStack.build = "travis #" + process.env.TRAVIS_BUILD_NUMBER;

		// You can't get access to secure environment variables from pull requests
		// so we don't have browserstack from them, but travis has headless Firefox so use that
		if ( !(process.env.BROWSER_STACK_USERNAME && process.env.BROWSER_STACK_ACCESS_KEY) &&
			process.env.TRAVIS_PULL_REQUEST ) {
			config.browsers.push( "Firefox" );
		}
	}
};
