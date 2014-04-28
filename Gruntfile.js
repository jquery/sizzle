module.exports = function( grunt ) {
	"use strict";

	var gzip = require( "gzip-js" ),
		isBrowserStack = process.env.BROWSER_STACK_USERNAME && process.env.BROWSER_STACK_ACCESS_KEY,
		browsers = {
			phantom: [ "PhantomJS" ],
			desktop: [],
			old: [],
			ios: [],
			oldAndroid: [],
			newAndroid: []
		},
		files = {
			source: "src/sizzle.js",
			speed: "speed/speed.js",
			tests: "test/unit/*.js",
			karma: "test/karma/*.js",
			grunt: [ "Gruntfile.js", "tasks/*" ]
		};

	// if Browserstack is set up, assume we can use it
	if ( isBrowserStack ) {

		// See https://github.com/jquery/sizzle/wiki/Sizzle-Documentation#browsers

		browsers.desktop = [
			"bs_chrome-32", "bs_chrome-33",

			"bs_firefox-27", "bs_firefox-28",

			"bs_ie-9", "bs_ie-10", "bs_ie-11",

			"bs_opera-19", "bs_opera-20",

			"bs_safari-6.1", "bs_safari-7"
		];

		browsers.old = [
			"bs_ie-6", "bs_ie-7", "bs_ie-8"

			// Opera 12.16 temporary unavailable on BS through Karma launcher
			//,"bs_opera-12.16"
		];

		browsers.ios = [ "bs_ios-6", "bs_ios-7" ];
		browsers.oldAndroid = [ "bs_android-2.3" ];
		browsers.newAndroid = [ "bs_android-4.1" ];
	}

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON( "package.json" ),
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
						hoist_funs: false,
						loops: false
					},
					banner: "/*! Sizzle v<%= pkg.version %> | (c) 2013 jQuery Foundation, Inc. | jquery.org/license */",
					sourceMap: "dist/sizzle.min.map",
					beautify: {
						ascii_only: true
					}
				}
			}
		},
		compare_size: {
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
		bowercopy: {
			options: {
				clean: true
			},

			speed: {
				options: {
					destPrefix: "speed/libs"
				},

				files: {
					"requirejs/require.js": "requirejs/require.js",
					"requirejs-domready/domReady.js": "requirejs-domready/domReady.js",
					"requirejs-text/text.js": "requirejs-text/text.js",
					"benchmark/benchmark.js": "benchmark/benchmark.js"
				}
			},

			"test/libs/qunit": "qunit/qunit"
		},
		jshint: {
			options: {
				jshintrc: true
			},
			all: {
				src: [ files.source, files.grunt, files.karma, files.speed, files.tests ]
			}
		},
		jscs: {
			src: [
				files.source,
				files.grunt,
				files.speed,
				files.karma
			]
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
			old: {
				browsers: browsers.old,

				// Support: IE6
				// Have to re-arrange socket.io transports by prioritizing "jsonp-polling"
				// otherwise IE6 can't connect to karma server
				transports: [ "jsonp-polling" ],
			},
			ios: {
				browsers: browsers.ios
			},
			oldAndroid: {
				browsers: browsers.oldAndroid,
				transports: [ "jsonp-polling" ]
			},
			newAndroid: {
				browsers: browsers.newAndroid
			},
			all: {
				browsers: browsers.phantom.concat(
					browsers.desktop,
					browsers.old,
					browsers.ios,
					browsers.newAndroid,
					browsers.oldAndroid
				)
			}
		},
		watch: {
			files: [
				files.source,
				files.grunt,
				files.speed,
				files.karma,
				"test/**/*",
				"<%= jshint.tests.src %>",
				"{package,bower}.json",
				"test/*.html"
			],
			tasks: [ "lint", "karma:watch:run" ]
		}
	});

	// Integrate Sizzle specific tasks
	grunt.loadTasks( "tasks" );

	// Load dev dependencies
	require( "load-grunt-tasks" )( grunt );

	grunt.registerTask( "lint", [ "jsonlint", "jshint", "jscs" ] );
	grunt.registerTask( "start", [ "karma:watch:start", "watch" ] );

	// Execute tests all browsers in sequential way,
	// so slow connections would not affect other runs
	grunt.registerTask( "tests", isBrowserStack ? [
	    "karma:phantom", "karma:desktop", "karma:old",
	    "karma:ios", "karma:newAndroid", "karma:oldAndroid"
	] : "karma:phantom" );

	grunt.registerTask( "build", [ "lint", "tests", "compile", "uglify", "dist" ] );
	grunt.registerTask( "default", [ "build", "compare_size" ] );

	grunt.registerTask( "bower", "bowercopy" );
};
