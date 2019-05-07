var exec = require( "child_process" ).exec;

module.exports = function( grunt ) {
	"use strict";
	grunt.registerTask( "tag", "Tag the specified version", function( version ) {
		exec( "git tag " + version, this.async() );
	} );
};
