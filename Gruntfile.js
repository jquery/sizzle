module.exports = function( grunt ) {
	"use strict";

	var browsers = [ "PhantomJS" ],
		gzip = require( "gzip-js" ),
		files = {
			source: "src/sizzle.js",
			speed: "speed/speed.js",
			tests: "test/unit/*.js",
			karma: "test/karma/*.js",
			grunt: [ "Gruntfile.js", "tasks/*" ]
		};

	// if Browserstack is set up, assume we can use it
	if ( process.env.BROWSER_STACK_USERNAME && process.env.BROWSER_STACK_ACCESS_KEY ) {

		// See https://github.com/jquery/sizzle/wiki/Sizzle-Documentation#browsers
		browsers = [
			"bs_chrome-30", "bs_chrome-31",

			"bs_firefox-24", "bs_firefox-25",

			"bs_ie-6", "bs_ie-7", "bs_ie-8", "bs_ie-9", "bs_ie-10", "bs_ie-11",

			"bs_opera-12.16", "bs_opera-16", "bs_opera-17",

			"bs_safari-5.1", "bs_safari-6.1", "bs_safari-7",

			"bs_ios-6", "bs_android-2.3", "bs_android-4.1"
		];
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
			source: {
				src: files.source,
				options: {
					jshintrc: "src/.jshintrc"
				}
			},
			build: {
				src: [ files.grunt, files.karma ],
				options: {
					jshintrc: ".jshintrc"
				}
			},
			speed: {
				src: files.speed,
				options: {
					jshintrc: "speed/.jshintrc"
				}
			},
			tests: {
				src: files.tests,
				options: {
					jshintrc: "test/.jshintrc"
				}
			}
		},
		jscs: {
			// Can't check the actual source file until
			// https://github.com/mdevils/node-jscs/pull/90 is merged
			files: [ files.grunt, files.speed, files.karma ],

			options: {
				preset: "jquery"
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
				configFile: "test/karma/karma.conf.js"
			},
			watch: {
				background: true,
				browsers: [ "PhantomJS" ]
			},
			unit: {
				singleRun: true,
				browsers: browsers
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

	grunt.registerTask( "build", [ "lint", "karma:unit", "compile", "uglify", "dist" ] );
	grunt.registerTask( "default", [ "build", "compare_size" ] );

	grunt.registerTask( "bower", "bowercopy" );
};
