var exec = require( "child_process" ).exec;

module.exports = function( grunt ) {
	"use strict";
	grunt.registerTask( "commit", "Add and commit changes", function( message ) {

		// Always add dist directory
		exec( "git add dist && git commit -m " + message, this.async() );
	} );
};
