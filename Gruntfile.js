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
			"bs_chrome-34", "bs_chrome-35",

			"bs_firefox-17", "bs_firefox-24", // Firefox ESR
			"bs_firefox-28", "bs_firefox-29",

			"bs_ie-9", "bs_ie-10", "bs_ie-11",

			"bs_opera-20", "bs_opera-21",

			"bs_safari-6.0", "bs_safari-6.1", "bs_safari-7.0"
		];

		browsers.old = [
			// Node.js 0.10 has the same v8 version as Chrome 24
			"bs_chrome-14", "bs_chrome-24",

			"bs_firefox-3.6",

			"bs_ie-6", "bs_ie-7", "bs_ie-8",

			// Opera 12.16 temporary unavailable on BS through Karma launcher
			//,"bs_opera-12.16",

			"bs_safari-4.0", "bs_safari-5.0", "bs_safari-5.1"
		];

		browsers.ios = [ "bs_ios-5.1", "bs_ios-6.0", "bs_ios-7.0" ];
		browsers.oldAndroid = [ "bs_android-2.3" ];
		browsers.newAndroid = [ "bs_android-4.0", "bs_android-4.1", "bs_android-4.2" ];
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
			all: {
				options: {
					clean: true,
					destPrefix: "external"
				},

				files: {
					"benchmark/benchmark.js": "benchmark/benchmark.js",
					"benchmark/LICENSE.txt": "benchmark/LICENSE.txt",

					"jquery/jquery.js": "jquery/jquery.js",
					"jquery/MIT-LICENSE.txt": "jquery/MIT-LICENSE.txt",

					"qunit/qunit.js": "qunit/qunit/qunit.js",
					"qunit/qunit.css": "qunit/qunit/qunit.css",
					"qunit/MIT-LICENSE.txt": "qunit/MIT-LICENSE.txt",

					"requirejs/require.js": "requirejs/require.js",

					"requirejs-domready/domReady.js": "requirejs-domready/domReady.js",
					"requirejs-domready/LICENSE.txt": "requirejs-domready/LICENSE",

					"requirejs-text/text.js": "requirejs-text/text.js",
					"requirejs-text/LICENSE.txt": "requirejs-text/LICENSE"
				}
			}
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

	grunt.registerTask( "build", [ "lint", "compile", "uglify", "tests", "dist" ] );
	grunt.registerTask( "default", [ "build", "compare_size" ] );

	grunt.registerTask( "bower", "bowercopy" );
};
