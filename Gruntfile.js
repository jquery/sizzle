module.exports = function( grunt ) {

	"use strict";

	// Project configuration.
	grunt.initConfig({
		qunit: {
			files: ["test/index.html"]
		},
		uglify: {
			all: {
				files: {
					"dist/sizzle.min.js": ["sizzle.js"]
				},
				options: {
					sourceMap: "dist/sizzle.min.map"
				},
				beautify: {
					ascii_only: true
				}
			}
		},
		compare_size: {
			files: [ "sizzle.js", "dist/sizzle.min.js" ]
		},
		jshint: {
			source: {
				src: ["sizzle.js"],
				options: {
					jshintrc: ".jshintrc"
				}
			},
			grunt: {
				src: ["Gruntfile.js"],
				options: {
					jshintrc: ".jshintrc"
				}
			},
			speed: {
				src: ["speed/speed.js"],
				options: {
					jshintrc: "speed/.jshintrc"
				}
			},
			tests: {
				src: ["test/unit/*.js"],
				options: {
					jshintrc: "test/.jshintrc"
				}
			}
		},
		watch: {
			files: [
				"<config:jshint.source.src>",
				"<config:jshint.grunt.src>",
				"<config:jshint.speed.src>",
				"<config:jshint.tests.src>"
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

	// Default task.
	grunt.registerTask( "default", [ "jshint", "uglify", "qunit", "compare_size" ] );
};
