"use strict";

module.exports = function( config ) {
	var env = require( "./environment" );

	config.set({
		browserStack: {
			project: "sizzle",
			timeout: 600 // 10 min
		},

		// Can't specify path as "../../test" which would be intuitive
		// because if we do, karma will make paths outside "test" folder absolute
		// that will break iframe tests
		basePath: "../../",

		// frameworks to use
		frameworks: [ "qunit" ],

		// list of files/patterns to load in the browser
		files: [
			"test/jquery.js",
			"dist/sizzle.js",

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

		port: 9876,

		colors: true,

		// Default option, might be augmented in environment module
		browsers: [ "PhantomJS" ],

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 60000
	});

	env( config );
};
