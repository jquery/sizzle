module.exports = function( grunt ) {
	"use strict";

	var gzip = require( "gzip-js" ),
		isBrowserStack = process.env.BROWSER_STACK_USERNAME && process.env.BROWSER_STACK_ACCESS_KEY,
		browsers = {
			phantom: [ "PhantomJS" ],
			desktop: [],
			android: [],
			ios: [],
			old: {
				firefox: [],
				chrome: [],
				safari: [],
				ie: [],
				opera: [],
				android: []
			}
		},
		files = {
			source: "src/sizzle.js",
			speed: "speed/speed.js",
			tests: "test/{data,unit}/*.js",
			karma: "test/karma/*.js",
			grunt: [ "Gruntfile.js", "tasks/*" ]
		};

	// if Browserstack is set up, assume we can use it
	if ( isBrowserStack ) {

		// See https://github.com/jquery/sizzle/wiki/Sizzle-Documentation#browsers

		browsers.desktop = [
			"bs_chrome-45", // shares V8 with Node.js v4 LTS
			"bs_chrome-68", // shares V8 with Node.js v10.24.1 LTS
			"bs_chrome-84", // shares V8 with Node.js v14.20.0 LTS
			"bs_chrome-104", "bs_chrome-105",

			// Firefox ESR + last 2 Firefox versions
			"bs_firefox-60", "bs_firefox-68", "bs_firefox-78", "bs_firefox-91", "bs_firefox-102",
			"bs_firefox-103", "bs_firefox-104",

			"bs_edge-15", "bs_edge-16", "bs_edge-17", "bs_edge-18",
			"bs_edge-104", "bs_edge-105",

			"bs_ie-9", "bs_ie-10", "bs_ie-11",

			"bs_opera-89", "bs_opera-90",

			// Real Safari 6.1 and 7.0 are not available
			"bs_safari-6.0", "bs_safari-8.0", "bs_safari-9.1", "bs_safari-10.1",
			"bs_safari-11.1", "bs_safari-12.1", "bs_safari-13.1", "bs_safari-14", "bs_safari-15"
		];

		browsers.ios = [
			"bs_ios-9.3", "bs_ios-10", "bs_ios-11", "bs_ios-12", "bs_ios-13",
			"bs_ios-14", "bs_ios-15"
		];
		browsers.android = [
			"bs_android-4.0", "bs_android-4.1", "bs_android-4.2",
			"bs_android-4.3", "bs_android-4.4"
		];

		browsers.old = {
			firefox: [ "bs_firefox-3.6" ],
			chrome: [ "bs_chrome-16" ],
			safari: [ "bs_safari-4.0", "bs_safari-5.0", "bs_safari-5.1" ],
			ie: [ "bs_ie-7", "bs_ie-8" ],
			opera: [ "bs_opera-11.6", "bs_opera-12.16" ],
			ios: [
				"bs_ios-5.1", "bs_ios-6.0",

				// iOS 7 is very unreliable on BrowserStack; if often doesn't open
				// the browser at all. For this reason, we've already disabled tests
				// on it in jQuery a while ago. Let's disable it here as well.
				// "bs_ios-7.0",

				"bs_ios-8.3"
			],
			android: [ "bs_android-2.3" ]
		};
	}

	// Project configuration
	grunt.initConfig( {
		pkg: grunt.file.readJSON( "package.json" ),
		dateString: new Date().toISOString().replace( /\..*Z/, "" ),
		compile: {
			all: {
				dest: "dist/sizzle.js",
				src: "src/sizzle.js"
			}
		},
		version: {
			files: [ "package.json", "bower.json" ]
		},
		uglify: {
			all: {
				files: {
					"dist/sizzle.min.js": [ "dist/sizzle.js" ]
				},
				options: {
					compress: {
						"hoist_funs": false,
						loops: false
					},
					output: {
						ascii_only: true
					},
					banner: "/*! Sizzle v<%= pkg.version %> | (c) " +
						"JS Foundation and other contributors | js.foundation */",
					sourceMap: true,
					sourceMapName: "dist/sizzle.min.map"
				}
			}
		},
		"ensure_ascii": {
			files: [ "dist/*.js" ]
		},
		"compare_size": {
			files: [ "dist/sizzle.js", "dist/sizzle.min.js" ],
			options: {
				compress: {
					gz: function( contents ) {
						return gzip.zip( contents, {} ).length;
					}
				},
				cache: "dist/.sizecache.json"
			}
		},
		npmcopy: {
			all: {
				options: {
					destPrefix: "external"
				},
				files: {
					"benchmark/benchmark.js": "benchmark/benchmark.js",
					"benchmark/LICENSE.txt": "benchmark/LICENSE.txt",

					"jquery/jquery.js": "jquery/jquery.js",
					"jquery/MIT-LICENSE.txt": "jquery/MIT-LICENSE.txt",

					"qunit/qunit.js": "qunitjs/qunit/qunit.js",
					"qunit/qunit.css": "qunitjs/qunit/qunit.css",
					"qunit/LICENSE.txt": "qunitjs/LICENSE.txt",

					"requirejs/require.js": "requirejs/require.js",
					"requirejs-domready/domReady.js": "requirejs-domready/domReady.js",
					"requirejs-text/text.js": "requirejs-text/text.js"
				}
			}
		},
		eslint: {
			options: {

				// See https://github.com/sindresorhus/grunt-eslint/issues/119
				quiet: true
			},

			dist: {
				src: "dist/sizzle.js"
			},
			dev: {
				src: [ files.source, files.grunt, files.karma, files.speed, files.tests ]
			},
			grunt: {
				src: files.grunt
			},
			speed: {
				src: [ files.speed ]
			},
			tests: {
				src: [ files.tests ]
			},
			karma: {
				src: [ files.karma ]
			}
		},
		jsonlint: {
			pkg: {
				src: [ "package.json" ]
			},
			bower: {
				src: [ "bower.json" ]
			}
		},
		karma: {
			options: {
				configFile: "test/karma/karma.conf.js",
				singleRun: true
			},
			watch: {
				background: true,
				singleRun: false,
				browsers: browsers.phantom
			},
			phantom: {
				browsers: browsers.phantom
			},
			desktop: {
				browsers: browsers.desktop
			},
			android: {
				browsers: browsers.android
			},
			ios: {
				browsers: browsers.ios
			},
			oldIe: {
				browsers: browsers.old.ie,

				// Support: IE <=8 only
				// Force use of JSONP polling
				transports: [ "polling" ],
				forceJSONP: true
			},
			oldOpera: {
				browsers: browsers.old.opera
			},
			oldFirefox: {
				browsers: browsers.old.firefox
			},
			oldChrome: {
				browsers: browsers.old.chrome
			},
			oldSafari: {
				browsers: browsers.old.safari
			},
			oldAndroid: {
				browsers: browsers.old.android
			},
			oldIos: {
				browsers: browsers.old.ios
			},
			all: {
				browsers: browsers.phantom.concat(
					browsers.desktop,

					browsers.old.firefox,
					browsers.old.chrome,
					browsers.old.safari,
					browsers.old.ie,
					browsers.old.opera,

					browsers.ios,
					browsers.android,

					browsers.old.ios,
					browsers.old.android
				)
			}
		},
		watch: {
			options: {
				livereload: true
			},
			files: [
				files.source,
				files.grunt,
				files.karma,
				files.speed,
				"test/**/*",
				"test/*.html",
				"{package,bower}.json"
			],
			tasks: [ "build", "karma:watch:run" ]
		}
	} );

	// Integrate Sizzle specific tasks
	grunt.loadTasks( "tasks" );

	// Load dev dependencies
	require( "load-grunt-tasks" )( grunt );

	grunt.registerTask( "lint", [ "jsonlint", "eslint:dev", "eslint:dist" ] );
	grunt.registerTask( "start", [ "karma:watch:start", "watch" ] );

	grunt.registerTask( "tests", [
		`karma-tests:${ isBrowserStack ? "browserstack" : "" }`
	] );

	grunt.registerTask( "build", [
		"jsonlint",
		"eslint:dev",
		"compile",
		"uglify",
		"dist",
		"eslint:dist",
		"ensure_ascii"
	] );
	grunt.registerTask( "default", [
		"build",
		"compare_size",
		"eslint:dist"
	] );

	grunt.registerTask( "bower", "bowercopy" );
};
