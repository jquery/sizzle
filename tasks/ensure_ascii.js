"use strict";

var fs = require( "fs" );

module.exports = function( grunt ) {
	grunt.registerMultiTask(
		"ensure_ascii",
		"Verify that files contain no non-ASCII characters.",
		function() {
			var MAX_CONTEXT = 40,
				reject = /[^\0-\x7F]/g,
				pass = true;

			this.filesSrc.forEach( function( file ) {
				var first, firstIndex, lineStart, lineEnd, context,
					text = fs.readFileSync( file, "utf8" ),
					offenses = text.match( reject );

				if ( offenses ) {
					pass = false;
					firstIndex = reject.exec( text ).index;
					lineStart = text.lastIndexOf( "\n", firstIndex - 1 );
					lineEnd = text.indexOf( "\n", firstIndex + 1 );
					if ( lineEnd === -1 ) {
						lineEnd = firstIndex + MAX_CONTEXT;
					}
					context = text.slice( lineStart + 1, lineEnd );
					if ( context.length > MAX_CONTEXT ) {
						if ( (firstIndex - lineStart) < MAX_CONTEXT ) {
							context = context.slice( 0, MAX_CONTEXT );
						} else {
							context = context.substr(
								firstIndex - lineStart - Math.floor( MAX_CONTEXT / 2 ),
								MAX_CONTEXT
							);
						}
					}
					first = "U+" + ("000" + offenses[ 0 ].charCodeAt( 0 ).toString( 16 ))
						.slice( -4 ).toUpperCase();
					grunt.log.error( offenses.length + " non-ASCII character(s) in " + file );
					grunt.log.error( "First (" + first + ") at index " + firstIndex + ": " +
						context );
				}
			} );
			return pass;
		}
	);
};
