module.exports = function( grunt ) {
	"use strict";

	var gzip = require( "gzip-js" ),
		files = {
			source: "src/sizzle.js",
			speed: "speed/speed.js",
			tests: "test/unit/*.js",
			karma: "test/karma/karma.conf.js",
			grunt: [ "Gruntfile.js", "tasks/*" ]
		};

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
				preset: "jquery",
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
				configFile: files.karma
			},
			watch: {
				background: true,
			},
			unit: {
				singleRun: true
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
	grunt.registerTask( "test", [ "lint", "karma:unit" ] );

	grunt.registerTask( "start", [ "karma:watch:start", "watch" ] );

	grunt.registerTask( "build", [ "lint", "compile", "uglify", "dist" ] );
	grunt.registerTask( "default", [ "build", "karma:unit", "compare_size" ] );

	grunt.registerTask( "bower", "bowercopy" );
};
