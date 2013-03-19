module.exports = function( grunt ) {

	"use strict";

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		qunit: {
			files: ["test/index.html"]
		},
		build: {
			all: {
				dest: "dist/sizzle.js",
				src: "sizzle.js"
			}
		},
		uglify: {
			all: {
				files: {
					"dist/sizzle.min.js": [ "dist/sizzle.js" ]
				},
				options: {
					sourceMap: "dist/sizzle.min.map",
					// Preserve license in minified
					preserveComments: "some"
				},
				beautify: {
					ascii_only: true
				}
			}
		},
		compare_size: {
			files: [ "dist/sizzle.js", "dist/sizzle.min.js" ]
		},
		jshint: {
			source: {
				src: [ "sizzle.js" ],
				options: {
					jshintrc: ".jshintrc"
				}
			},
			grunt: {
				src: [ "Gruntfile.js" ],
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
		watch: {
			files: [
				"<%= jshint.source.src %>",
				"<%= jshint.grunt.src %>",
				"<%= jshint.speed.src %>",
				"<%= jshint.tests.src %>"
			],
			tasks: "default"
		}
	});

	// Load grunt tasks from NPM packages
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-qunit");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-compare-size");
	grunt.loadNpmTasks("grunt-git-authors");

	// Default task
	grunt.registerTask( "default", [ "jshint", "build", "uglify", "qunit", "compare_size" ] );

	// Task aliases
	grunt.registerTask( "lint", ["jshint"] );

	grunt.registerMultiTask(
		"build",
		"Build sizzle.js to the dist directory. Embed date/version.",
		function() {
			var data = this.data,
				dest = data.dest,
				src = data.src,
				version = grunt.config("pkg.version"),
				compiled = grunt.file.read( src );

			// Embed version and date
			compiled = compiled
				.replace( /@VERSION/g, version )
				.replace( "@DATE", function () {
					var date = new Date();

					// YYYY-MM-DD
					return [
						date.getFullYear(),
						date.getMonth() + 1,
						date.getDate()
					].join( "-" );
				});

			// Write source to file
			grunt.file.write( dest, compiled );

			grunt.log.ok( "File written to " + dest );
		}
	);
};
