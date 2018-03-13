# AdGuard's fork of Sizzle

This is a modified version of Sizzle that we use in our [ExtendedCss](https://github.com/AdguardTeam/ExtendedCss) library.

## How to build and test Sizzle

Run this command to build Sizzle and run tests:
```
grunt
```

The version we use in ExtendedCss is `dist/sizzle.adguard.js`.

In order to test Sizzle performance, do the following:
```
// Build Sizzle
grunt build

// Run a web server
python -m SimpleHTTPServer
```

Then open `http://localhost:8000/speed/?qsa` to run the performance tests.

## Changes compared to the original Sizzle

**Global changes**

1. Added additional parameters to the `Sizzle.tokenize` method so that it can be used for stylesheets parsing and validation.
2. Added tokens re-sorting mechanism forcing slow pseudos to be matched last  (see `sortTokenGroups`).
3. Fix the `nonnativeSelectorCache` caching -- there was no value corresponding to a key.
4. Added Sizzle.compile call to the `:has` pseudo definition.

**Changes that are applied to the ADGUARD_EXTCSS build only**

1. Do not expose Sizzle to the global scope. Initialize it lazily via `initializeSizzle()`.
2. Removed `:contains` pseudo declaration -- its syntax is changed and declared outside of Sizzle.
3. Removed declarations for the following non-standard pseudo classes: 
    ```
    :parent, :header, :input, :button, :text, :first, :last, :eq,
    :even, :odd, :lt, :gt, :nth, :radio, :checkbox, :file,
    :password, :image, :submit, :reset
    ```

# Sizzle

__A pure-JavaScript CSS selector engine designed to be easily dropped in to a host library.__

- [More information](https://sizzlejs.com/)
- [Documentation](https://github.com/jquery/sizzle/wiki/)
- [Browser support](https://github.com/jquery/sizzle/wiki/#wiki-browsers)

Contribution Guides
---------------------------

In the spirit of open source software development, jQuery always encourages community code contribution. To help you get started and before you jump into writing code, be sure to read these important contribution guidelines thoroughly:

1. [Getting Involved](https://contribute.jquery.org/)
2. [JavaScript Style Guide](https://contribute.jquery.org/style-guide/js/)
3. [Writing Code for jQuery Organization Projects](https://contribute.jquery.org/code/)

What you need to build Sizzle
---------------------------

In order to build Sizzle, you should have Node.js/npm latest and git 1.7 or later (earlier versions might work OK, but are not tested).

For Windows you have to download and install [git](http://git-scm.com/downloads) and [Node.js](https://nodejs.org/download/).

Mac OS users should install [Homebrew](http://mxcl.github.com/homebrew/). Once Homebrew is installed, run `brew install git` to install git,
and `brew install node` to install Node.js.

Linux/BSD users should use their appropriate package managers to install git and Node.js, or build from source
if you swing that way. Easy-peasy.


How to build Sizzle
----------------------------

Clone a copy of the main Sizzle git repo by running:

```bash
git clone git://github.com/jquery/sizzle.git
```

In the `sizzle/dist` folder you will find build version of sizzle along with the minified copy and associated map file.

Testing
----------------------------

- Run `npm install`, it's also preferable (but not necessarily) to globally install `grunt-cli` package – `npm install -g grunt-cli`
- Open `test/index.html` in the browser. Or run `npm test`/`grunt test` on the command line, if environment variables `BROWSER_STACK_USERNAME` and `BROWSER_STACK_ACCESS_KEY` are set up, it will attempt to use [Browserstack](https://www.browserstack.com/) service (you will need to install java on your machine so browserstack could connect to your local server), otherwise [PhantomJS](http://phantomjs.org/) will be used.
- The actual unit tests are in the `test/unit` directory.

Developing with [grunt](http://gruntjs.com)
----------------------------

- `npm run build` or `grunt` will lint, build, test, and compare the sizes of the built files.
- `npm start` or `grunt start` can be run to re-lint, re-build, and re-test files as you change them.
- `grunt -help` will show other available commands.
