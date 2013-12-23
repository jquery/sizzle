module.exports = function( grunt ) {
	"use strict";

	var gzip = require( "gzip-js" );

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON( "package.json" ),
		qunit: {
			files: [ "test/index.html" ]
		},
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
					compress: { evaluate: false },
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
			"test/libs/qunit": "qunit/qunit"
		},
		jshint: {
			source: {
				src: [ "src/sizzle.js" ],
				options: {
					jshintrc: "src/.jshintrc"
				}
			},
			grunt: {
				src: [ "Gruntfile.js", "tasks/*" ],
				options: {
					jshintrc: ".jshintrc"
				}
			},
			speed: {
				src: [ "speed/speed.js" ],
				options: {
					jshintrc: "speed/.jshintrc"
				}
			},
			tests: {
				src: [ "test/unit/*.js" ],
				options: {
					jshintrc: "test/.jshintrc"
				}
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
		watch: {
			files: [
				"<%= jshint.source.src %>",
				"<%= jshint.grunt.src %>",
				"<%= jshint.speed.src %>",
				"<%= jshint.tests.src %>",
				"{package,bower}.json",
				"test/index.html"
			],
			tasks: "default"
		}
	});
	
	// Integrate Sizzle specific tasks
	grunt.loadTasks( "tasks" );

	// Load dev dependencies
	require( "load-grunt-tasks" )( grunt );

	grunt.registerTask( "build", [ "jsonlint", "jshint", "compile", "uglify", "dist" ] );
	grunt.registerTask( "default", [ "build", "qunit", "compare_size" ] );

	// Task aliases
	grunt.registerTask( "lint", [ "jshint" ] );
	grunt.registerTask( "bower", "bowercopy" );
};
