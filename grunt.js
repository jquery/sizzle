/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		lint: {
			files: ['grunt.js', 'sizzle.js', 'test/unit/*.js']
		},
		qunit: {
			files: ['test/**/*.html']
		},
		watch: {
			files: '<config:lint.files>',
			tasks: 'lint qunit'
		},
		jshint: {
			options: {
				evil: true,
				browser: true,
				wsh: true,
				eqnull: true,
				expr: true,
				curly: true,
				trailing: true,
				undef: true,
				smarttabs: true,
				predef: [
					"define",
					"DOMParser",
					"__dirname"
				],
				maxerr: 100
			},
			globals: {
				jQuery: true,
				global: true,
				module: true,
				exports: true,
				require: true,
				file: true,
				log: true,
				console: true
			}
		}
	});

	// Default task.
	grunt.registerTask('default', 'lint qunit');

};
