/* eslint-env node */
module.exports = function( Release ) {

	var files = [
		"dist/sizzle.js",
		"dist/sizzle.min.js",
		"dist/sizzle.min.map"
	];

	Release.define( {
		cdnPublish: false,
		npmPublish: true,
		issueTracker: "github",

		generateArtifacts: function( done ) {
			Release.exec( "grunt", "Grunt command failed" );
			done( files );
		}
	} );

};
