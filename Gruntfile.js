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
			tests: "test/unit/*.js",
			karma: "test/karma/*.js",
			grunt: [ "Gruntfile.js", "tasks/*" ]
		};

	// if Browserstack is set up, assume we can use it
	if ( isBrowserStack ) {

		// See https://github.com/jquery/sizzle/wiki/Sizzle-Documentation#browsers

		browsers.desktop = [
			"bs_chrome-50", "bs_chrome-51",

			"bs_firefox-38", "bs_firefox-45", // Firefox ESR
			"bs_firefox-46", "bs_firefox-47",

			"bs_edge-13",

			"bs_ie-9", "bs_ie-10", "bs_ie-11",

			"bs_opera-37", "bs_opera-38",

			// Real Safari 6.1 and 7.0 are not available
			"bs_safari-6.0", "bs_safari-8.0", "bs_safari-9.1"
		];

		browsers.ios = [ "bs_ios-5.1", "bs_ios-6.0", "bs_ios-7.0", "bs_ios-8.3", "bs_ios-9.3" ];
		browsers.android = [
			"bs_android-4.0", "bs_android-4.1", "bs_android-4.2",
			"bs_android-4.3", "bs_android-4.4"
		];

		browsers.old = {
			firefox: [ "bs_firefox-3.6" ],
			chrome: [ "bs_chrome-16", "bs_chrome-24" ],
			safari: [ "bs_safari-4.0", "bs_safari-5.0", "bs_safari-5.1" ],
			ie: [ "bs_ie-7", "bs_ie-8" ],
			opera: [ "bs_opera-11.6", "bs_opera-12.16" ],
			android: [ "bs_android-2.3" ]
		};
	}

	// Project configuration
	grunt.initConfig({
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
					banner: "/*! Sizzle v<%= pkg.version %> | (c) " +
						"JS Foundation and other contributors | js.foundation */",
					sourceMap: true,
					sourceMapName: "dist/sizzle.min.map",
					ASCIIOnly: true
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

					"requirejs/require.js": "requirejs/require.js"
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
			src: {
				options: {
					requireDotNotation: null
				},
				src: [ files.source ]
			},
			grunt: files.grunt,
			speed: [ files.speed ],
			tests: {
				options: {
					maximumLineLength: null
				},
				src: [ files.tests ]
			},
			karma: {
				options: {
					requireCamelCaseOrUpperCaseIdentifiers: null
				},
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
			all: {
				browsers: browsers.phantom.concat(
					browsers.desktop,
					browsers.ios,
					browsers.android,

					browsers.old.firefox,
					browsers.old.chrome,
					browsers.old.safari,
					browsers.old.ie,
					browsers.old.opera,

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
		"karma:phantom", "karma:desktop",

		"karma:ios",

		"karma:oldIe", "karma:oldFirefox", "karma:oldChrome",
		"karma:oldSafari", "karma:oldOpera"

		// See #314 :-(
		// "karma:android", "karma:oldAndroid"
	] : "karma:phantom" );

	grunt.registerTask( "build", [ "lint", "compile", "uglify", "dist", "ensure_ascii" ] );
	grunt.registerTask( "default", [ "build", "tests", "compare_size" ] );

	grunt.registerTask( "bower", "bowercopy" );
};
