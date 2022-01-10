"use strict";

var grunt = require( "grunt" );

module.exports = function( config ) {
	var isCi = process.env.GITHUB_ACTION,
		dateString = grunt.config( "dateString" ),
		isBrowserStack = !!( process.env.BROWSER_STACK_USERNAME &&
			process.env.BROWSER_STACK_ACCESS_KEY ),
		hostName = isBrowserStack ? "bs-local.com" : "localhost";

	config.set( {
		browserStack: {
			project: "sizzle",
			build: "local run" + ( dateString ? ", " + dateString : "" ),
			timeout: 600, // 10 min
			// BrowserStack has a limit of 120 requests per minute. The default
			// "request per second" strategy doesn't scale to so many browsers.
			pollingTimeout: 10000
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
			},
			{
				pattern: "test/data/noConflict.html",
				watched: false,
				included: false
			}
		],

		preprocessors: {

			// mixed_sort.html, noConflict.html downloaded through iframe inclusion
			// so it should not be preprocessed
			"test/data/mixed_sort.html": [],
			"test/data/noConflict.html": [],
			"test/data/fixtures.html": [ "html2js" ]
		},

		// Add BrowserStack launchers
		customLaunchers: require( "./launchers" ),

		// Make GitHub Actions output less verbose
		reporters: isCi ? "dots" : "progress",

		colors: !isCi,

		hostname: hostName,
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
	} );

	// Deal with the GitHub Actions environment
	if ( isCi ) {
		config.browserStack.build = "Sizzle GitHub #" + process.env.GITHUB_RUN_NUMBER;

		// You can't get access to secure environment variables from pull requests
		// so we don't have browserstack from them, but GitHub Actions have headless
		// Firefox so use that.
		// The `GITHUB_BASE_REF` env variable is only available on PRs, see:
		// https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
		if ( !isBrowserStack && process.env.GITHUB_BASE_REF ) {
			config.browsers.push( "FirefoxHeadless" );
		}
	}
};
