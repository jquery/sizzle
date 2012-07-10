/*global module: true*/
module.exports = function( grunt ) {

	// Project configuration.
	grunt.initConfig({
		lint: {
			files: [ "grunt.js", "sizzle.js", "test/unit/*.js" ]
		},
		qunit: {
			files: [ "test/**/*.html" ]
		},
		watch: {
			files: "<config:lint.files>",
			tasks: "default"
		},
		jshint: {
			options: {
				evil: true,
				browser: true,
				wsh: true,
				eqnull: true,
				expr: true,
				curly: true,
				trailing: true,
				undef: true,
				smarttabs: true,
				maxerr: 100,
				sub: true
			},
			globals: {
				jQuery: true,
				define: true
			}
		}
	});

	// Default task.
	grunt.registerTask( "default", "lint" );
};
