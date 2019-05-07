module.exports = function( grunt ) {
	"use strict";
	grunt.registerTask( "test", "Run lint and tests for the specific browsers", function() {
		var browsers = grunt.option( "browsers" ),
			options = grunt.config.data.karma.all;

		if ( browsers ) {
			options.browsers = browsers.split( "," );

			grunt.task.run( [ "lint", "karma:all" ] );

		} else {
			grunt.task.run( [ "lint", "tests" ] );
		}
	} );
};
