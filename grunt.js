module.exports = function( grunt ) {

	"use strict";

	// readOptionalJSON
	// by Ben Alman
	// https://gist.github.com/2876125
	function readOptionalJSON( filepath ) {
		var data = {};
		try {
			data = grunt.file.readJSON( filepath );
			grunt.verbose.write( "Reading " + filepath + "..." ).ok();
		} catch(e) {}
		return data;
	}

	// Project configuration.
	grunt.initConfig({
		lint: {
			src: [ "grunt.js", "sizzle.js" ],
			speed: "speed/speed.js",
			tests: "test/unit/*.js"
		},
		qunit: {
			files: [ "test/**/*.html" ]
		},
		watch: {
			files: [ "<config:lint.src>", "<config:lint.speed>", "<config:lint.tests>" ],
			tasks: "default"
		},
		jshint: (function() {
			function jshintrc( path ) {
				return readOptionalJSON( (path || "") + ".jshintrc" ) || {};
			}

			return {
				src: {
					options: jshintrc()
				},
				speed: {
					options: jshintrc("speed/")
				},
				tests: {
					options: jshintrc("test/")
				}
			};
		})()
	});

	// Default task.
	grunt.registerTask( "default", "lint" );
};
