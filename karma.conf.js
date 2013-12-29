module.exports = function(config) {
	config.set({

		// Can't specify path as "test" which would be intuitive
		// because if we do, karma will make some paths absolute
		// that will break iframe tests
		basePath: "",

		// frameworks to use
		frameworks: [ "qunit" ],

		// list of files/patterns to load in the browser
		files: [
			"test/jquery.js",
			"dist/sizzle.js",

			{
				pattern: "test/data/fixtures.html",
				watched: true,
				served: true,
				included: true
			},

			{
				pattern: "test/data/mixed_sort.html",
				watched: false,
				served: true,
				included: false
			},

			"test/data/testinit.js",
			"test/data/testrunner.js",

			"test/unit/selector.js",
			"test/unit/utilities.js",
			"test/unit/extending.js"
		],

		preprocessors: {

			// mixed_sort.html downloaded through iframe inclusion
			// so it should not be preprocessed
			"test/data/mixed_sort.html": [],
			"test/data/fixtures.html": [ "html2js" ]
		},

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera (has to be installed with `npm install karma-opera-launcher`)
		// - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
		// - PhantomJS
		// - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
		browsers: [ "PhantomJS" ],

		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 60000,

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: false
	});
};
