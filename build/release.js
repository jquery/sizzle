/* eslint-env node */
module.exports = function( Release ) {

	var files = [
		"dist/sizzle.js",
		"dist/sizzle.min.js",
		"dist/sizzle.min.map"
	];

	Release.define( {
		npmPublish: true,
		issueTracker: "github",

		generateArtifacts: function( done ) {
			Release.exec( "grunt", "Grunt command failed" );
			done( files );
		},

		// TODO Add Sizzle to the CDN, or add public opt-out interfaces to jquery-release
		_copyCdnArtifacts: function() {
			console.warn( "Skipping CDN artifact copy." );
		},
		_pushToCdn: function() {
			console.warn( "Skipping CDN push." );
		}
	} );

};
