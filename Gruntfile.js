module.exports = function( grunt ) {

	"use strict";

	var gzip = require("gzip-js"),
		exec = require("child_process").exec;

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		qunit: {
			files: [ "test/index.html" ]
		},
		build: {
			all: {
				dest: "dist/sizzle.js",
				src: "sizzle.js"
			}
		},
		version: {
			files: [ "package.json", "bower.json" ]
		},
		uglify: {
			all: {
				files: {
					"dist/sizzle.min.js": [ "dist/sizzle.js" ]
				},
				options: {
					compress: { evaluate: false },
					banner: "/*! Sizzle v<%= pkg.version %> | (c) 2013 jQuery Foundation, Inc. | jquery.org/license */",
					sourceMap: "dist/sizzle.min.map",
					beautify: {
						ascii_only: true
					}
				}
			}
		},
		compare_size: {
			files: [ "dist/sizzle.js", "dist/sizzle.min.js" ],
			options: {
				compress: {
					gz: function( contents ) {
						return gzip.zip( contents, {} ).length;
					}
				},
				cache: "dist/.sizecache.json"
			}
		},
		jshint: {
			source: {
				src: [ "sizzle.js" ],
				options: {
					jshintrc: ".jshintrc"
				}
			},
			grunt: {
				src: [ "Gruntfile.js" ],
				options: {
					jshintrc: ".jshintrc"
				}
			},
			speed: {
				src: [ "speed/speed.js" ],
				options: {
					jshintrc: "speed/.jshintrc"
				}
			},
			tests: {
				src: [ "test/unit/*.js" ],
				options: {
					jshintrc: "test/.jshintrc"
				}
			}
		},
		watch: {
			files: [
				"<%= jshint.source.src %>",
				"<%= jshint.grunt.src %>",
				"<%= jshint.speed.src %>",
				"<%= jshint.tests.src %>"
			],
			tasks: "default"
		}
	});

	grunt.registerMultiTask(
		"build",
		"Build sizzle.js to the dist directory. Embed date/version.",
		function() {
			var data = this.data,
				dest = data.dest,
				src = data.src,
				version = grunt.config("pkg.version"),
				compiled = grunt.file.read( src );

			// Embed version and date
			compiled = compiled
				.replace( /@VERSION/g, version )
				.replace( "@DATE", function () {
					var date = new Date();

					// YYYY-MM-DD
					return [
						date.getFullYear(),
						( "0" + ( date.getMonth() + 1 ) ).slice( -2 ),
						( "0" + date.getDate() ).slice( -2 )
					].join( "-" );
				});

			// Write source to file
			grunt.file.write( dest, compiled );

			grunt.log.ok( "File written to " + dest );
		}
	);

	// Process files for distribution
	grunt.registerTask( "dist", function() {
		var files = grunt.file.expand( { filter: "isFile" }, "dist/*" ),
			fs = require("fs");

		files.forEach(function( filename ) {
			var map,
				text = fs.readFileSync( filename, "utf8" );

			// Modify map/min so that it points to files in the same folder;
			// see https://github.com/mishoo/UglifyJS2/issues/47
			if ( /\.map$/.test( filename ) ) {
				text = text.replace( /"dist\//g, "\"" );
				fs.writeFileSync( filename, text, "utf-8" );
			} else if ( /\.min\.js$/.test( filename ) ) {
				// Wrap sourceMap directive in multiline comments (#13274)
				text = text.replace( /\n?(\/\/@\s*sourceMappingURL=)(.*)/,
					function( _, directive, path ) {
						map = "\n" + directive + path.replace( /^dist\//, "" );
						return "";
					});
				if ( map ) {
					text = text.replace( /(^\/\*[\w\W]*?)\s*\*\/|$/,
						function( _, comment ) {
							return ( comment || "\n/*" ) + map + "\n*/";
						});
				}
				fs.writeFileSync( filename, text, "utf-8" );
			}
		});
	});

	// Commit and tag the specified version
	grunt.registerTask( "tag", function( version ) {
		exec( "git tag " + version, this.async() );
	});

	grunt.registerTask( "commit", function( message ) {
		// Always add dist directory
		exec( "git add dist && git commit -m " + message, this.async() );
	});

	// Commit a new version
	grunt.registerTask( "version", function( version ) {
		if ( !/\d\.\d+\.\d+(?:-pre)?/.test(version) ) {
			grunt.fail.fatal( "Version must follow semver release format: " + version );
			return;
		}

		var done = this.async(),
			files = grunt.config("version.files"),
			n = files.length,
			rversion = /("version":\s*")[^"]+/;

		files.forEach(function( filename ) {
			// Update version in specified files
			var text = grunt.file.read( filename );
			text = text.replace( rversion, "$1" + version );
			grunt.file.write( filename, text );
			exec( "git add " + filename, function() {
				// Commit when all files are added
				if ( !--n ) {
					grunt.config( "pkg.version", version );
					grunt.task.run([ "build", "uglify", "dist", "commit:\"Update version to " + version + "\"" ]);
					done();
				}
			});
		});
	});

	// Release a version of sizzle
	grunt.registerTask( "release", function( version, next ) {
		if ( !/\d\.\d+\.\d+/.test(version) ) {
			grunt.fail.fatal( "Version should be a release version (x.x.x): " + version );
			return;
		}
		if ( !/\d\.\d+\.\d+-pre/.test(next) ) {
			grunt.fail.fatal( "Next version should be a -pre version (x.x.x-pre): " + next );
			return;
		}

		// Build to dist directories along with a map and tag the release
		grunt.task.run([
			// Commit new version
			"version:" + version,
			// Tag new version
			"tag:" + version,
			// Commit next version
			"version:" + next
		]);
	});

	// Load grunt tasks from NPM packages
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-qunit");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-compare-size");
	grunt.loadNpmTasks("grunt-git-authors");

	// Default task
	grunt.registerTask( "default", [ "jshint", "build", "uglify", "dist", "qunit", "compare_size" ] );

	// Task aliases
	grunt.registerTask( "lint", ["jshint"] );
};
