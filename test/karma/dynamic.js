"use strict";

var url = require( "url" );

function dynamicResponder( config, logger, customFileHandlers ) {
	var log = logger.create( "framework.dynamicResponder" ),
		responderConfig = config.dynamicResponder || {},
		path = responderConfig.path || "/dynamic",
		rheader = /^header:(.+)$/;

	log.info( "Registering dynamic responder for path: " + path );

	customFileHandlers.push({
		urlRegex: new RegExp( "^" + path.replace( /\W/g, "\\$&" ) + "(?:\\?|$)" ),
		handler: function( request, response ) {
			var params = url.parse( request.url, true ).query;

			Object.keys( params ).forEach(function( param ) {
				var header = rheader.exec( param );
				if ( header ) {
					response.setHeader( header[ 1 ], params[ param ] );
				}
			});

			if ( "statusCode" in params ) {
				response.statusCode = params.statusCode;
			}
			response.end( params.body || "" );
		}
	});

	// Return a no-op reporter
	return {};
}
// DI PARAMETER MAPPING
dynamicResponder.$inject = [ "config", "logger", "customFileHandlers" ];

// PUBLISH DI MODULE
module.exports = {
	"framework:dynamicResponse": [ "type", dynamicResponder ]
};
