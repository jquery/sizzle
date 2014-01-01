
var launchers = {},

	// By default, we use only phantom
	browsers = [ "PhantomJS" ];

// if Browserstack is set up, assume we can use it
if ( process.env.BROWSER_STACK_USERNAME && process.env.BROWSER_STACK_ACCESS_KEY ) {
	browsers = browsers.concat(
		"firefox-24", "firefox-25",
		"chrome-30", "chrome-31",
		"ie-6", "ie-7", "ie-8", "ie-9", "ie-10", "ie-11",
		"opera-12.16", "opera-16", "opera-17",
		"safari-5.1", "safari-6.1", "safari-7",

		"ios-5",
		"android-2.3", "android-4.1"
	);

	launchers = {
		"firefox-24": {
			base: "BrowserStack",
			browser: "firefox",
			browser_version: "24.0",
			os: "OS X",
			os_version: "Mavericks"
		},
		"firefox-25": {
			base: "BrowserStack",
			browser: "firefox",
			browser_version: "25.0",
			os: "OS X",
			os_version: "Mavericks"
		},

		"chrome-30": {
			base: "BrowserStack",
			browser: "chrome",
			browser_version: "30.0",
			os: "OS X",
			os_version: "Mavericks"
		},
		"chrome-31": {
			base: "BrowserStack",
			browser: "chrome",
			browser_version: "31.0",
			os: "OS X",
			os_version: "Mavericks"
		},

		"ie-6": {
			base: "BrowserStack",
			browser: "ie",
			browser_version: "6.0",
			os: "Windows",
			os_version: "XP"
		},
		"ie-7": {
			base: "BrowserStack",
			browser: "ie",
			browser_version: "7.0",
			os: "Windows",
			os_version: "XP"
		},
		"ie-8": {
			base: "BrowserStack",
			browser: "ie",
			browser_version: "8.0",
			os: "Windows",
			os_version: "7"
		},
		"ie-9": {
			base: "BrowserStack",
			browser: "ie",
			browser_version: "9.0",
			os: "Windows",
			os_version: "7"
		},
		"ie-10": {
			base: "BrowserStack",
			browser: "ie",
			browser_version: "10.0",
			os: "Windows",
			os_version: "8"
		},
		"ie-11": {
			base: "BrowserStack",
			browser: "ie",
			browser_version: "11.0",
			os: "Windows",
			os_version: "8.1"
		},

		"opera-12.16": {
			base: "BrowserStack",
			browser: "opera",
			browser_version: "12.16",
			os: "Windows",
			os_version: "8"
		},
		"opera-16": {
			base: "BrowserStack",
			browser: "opera",
			browser_version: "16.0",
			os: "OS X",
			os_version: "Mavericks"
		},
		"opera-17": {
			base: "BrowserStack",
			browser: "opera",
			browser_version: "17.0",
			os: "OS X",
			os_version: "Mavericks"
		},

		"safari-5.1": {
			base: "BrowserStack",
			browser: "safari",
			browser_version: "5.1",
			os: "OS X",
			os_version: "Lion"
		},
		"safari-6.1": {
			base: "BrowserStack",
			browser: "safari",
			browser_version: "6.1",
			os: "OS X",
			os_version: "Mountain Lion"
		},
		"safari-7": {
			base: "BrowserStack",
			browser: "safari",
			browser_version: "7.0",
			os: "OS X",
			os_version: "Mavericks"
		},

		"ios-5": {
			base: "BrowserStack",
			device: "iPhone 5",
			os: "ios",
			os_version: "6.0"
		},

		"android-2.3": {
			base: "BrowserStack",
			device: "Samsung Galaxy S II",
			os: "android",
			os_version: "2.3"
		},

		"android-4.1": {
			base: "BrowserStack",
			device: "Samsung Galaxy S III",
			os: "android",
			os_version: "4.1"
		}
	};
}

module.exports = {
	browsers: browsers,
	launchers: launchers
};
