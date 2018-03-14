"use strict";

var pp = require("preprocess");
var fs = require("fs");

module.exports = function (grunt) {
    grunt.registerTask("preprocess_dist", "Applies pre-processor directives to the dist files", function () {

        var files = grunt.file.expand({ filter: "isFile" }, "dist/sizzle.js");

        files.forEach(function (filename) {
            var text = fs.readFileSync(filename, "utf-8");
            var options = { type: "js" };

            // Default Sizzle build
            var defaultText = pp.preprocess(text, { "ADGUARD_EXTCSS": false }, options);

            // Patched build with some of the functionality removed
            var patchedText = pp.preprocess(text, { "ADGUARD_EXTCSS": true }, options);

            if (defaultText === text || patchedText === text) {
                throw grunt.util.error("Pre-processor directives were not applied to " + filename);
            }

            fs.writeFileSync(filename, defaultText, "utf-8");
            grunt.log.ok("Pre-processed file written to " + filename);

            var patchedFileName = filename.replace(".js", ".adguard.js");
            fs.writeFileSync(patchedFileName, patchedText, "utf-8");
            grunt.log.ok("Pre-processed file written to " + patchedFileName);
        });
    });
};