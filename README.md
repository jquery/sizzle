# Sizzle

__A pure-JavaScript CSS selector engine designed to be easily dropped in to a host library.__

More information: http://sizzlejs.com/

Discussion: http://groups.google.com/group/sizzlejs

Documentation: https://github.com/jquery/sizzle/wiki/Sizzle-Documentation

Browser support: https://github.com/jquery/sizzle/wiki/Sizzle-Documentation#wiki-browsers

Dependencies
---------------------------

In order to build Sizzle, you need to have Node.js/npm latest and git 1.7 or later.<br/>
(Earlier versions might work OK, but are not tested.)

Windows users have two options:

1. Install [msysgit](https://code.google.com/p/msysgit/) (Full installer for official Git) and a
   [binary version of Node.js](http://nodejs.org). Make sure all two packages are installed to the same
   location (by default, this is C:\Program Files\Git).
2. Install [Cygwin](http://cygwin.com/) (make sure you install the git and which packages), and
   a [binary version of Node.js](http://nodejs.org/).

Mac OS users should install Xcode (comes on your Mac OS install DVD, or downloadable from
[Apple's Xcode site](http://developer.apple.com/technologies/xcode.html)) and
[Homebrew](http://mxcl.github.com/homebrew/). Once Homebrew is installed, run `brew install git` to install git,
and `brew install node` to install Node.js.

Linux/BSD users should use their appropriate package managers to install git and Node.js, or build from source
if you swing that way. Easy-peasy.


Building
----------------------------

First, clone a copy of the main Sizzle git repo by running:

```bash
git clone git://github.com/jquery/sizzle.git
```

Install the grunt-cli package so that you will have the correct version of grunt available from any project that needs it. This should be done as a global install:

```bash
npm install -g grunt-cli
```

Enter the Sizzle directory and install the Node dependencies, this time *without* specifying a global install:

```bash
cd sizzle && npm install
```

Make sure you have `grunt` installed by testing:

```bash
grunt -version
```

Then, to get a complete, minified (w/ [UglifyJS2](https://github.com/mishoo/UglifyJS2)), linted (w/ [JSHint](http://jshint.com/)) version of Sizzle, type the following:

```bash
grunt
```

The built version of Sizzle will be put in the `dist/` subdirectory, along with the minified copy and associated map file.


Testing
----------------------------

- First, make sure you have [bower](http://bower.io/) installed.
- Run 'bower install' to install QUnit
- Open `test/index.html` in the browser or `grunt` or `grunt qunit` on the command line
- The actual unit tests are in the `test/unit` directory.

Developing with [grunt](http://gruntjs.com)
----------------------------

- `grunt` will lint, build, test, and compare the sizes of the built files.
- `grunt jshint` will only lint sizzle.js and the tests.
- `grunt watch` can be run to re-lint, re-build, and re-test files as you change them.
