module.exports = function( config ) {

	// if Browserstack is set up, assume we can use it
	if ( process.env.BROWSER_STACK_USERNAME && process.env.BROWSER_STACK_ACCESS_KEY ) {
		config.browsers = config.browsers.concat(
			"firefox-24", "firefox-25",
			"chrome-30", "chrome-31",
			"ie-6", "ie-7", "ie-8", "ie-9", "ie-10", "ie-11",
			"opera-12.16", "opera-16", "opera-17",
			"safari-5.1", "safari-6.1", "safari-7",

			"ios-5",
			"android-2.3", "android-4.1"
		);

		config.customLaunchers = require( "./launchers" );

		// Support IE6
		// Have to re-arrange socket.io transports by prioritizing "jsonp-polling"
		// otherwise IE6 can't connect to karma server
		config.transports = [ "websocket", "flashsocket", "jsonp-polling", "xhr-polling" ];
	}

	if ( process.env.TRAVIS ) {
		config.browserStack.build = "Travis #" + process.env.TRAVIS_BUILD_NUMBER;
	}

	config.reporters = "dots";
};
