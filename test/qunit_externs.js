function module(name, opts) {}
/**
 * @param {string} testName
 * @param {number|function()} expected
 * @param {function()=} callback
 * @param {function()=} async
 */
function test(testName, expected, callback, async) {}
function expect(num) {}
function ok(mth1, mth2) {}
/**
 * @param {*} a
 * @param {...*} var_args
 */
function equal(a, var_args) {}
function deepEqual(mth1, mth2, mth3) {}
function strictEqual( input1, input2, testname ) {}
function notEqual( meth1, meth2, testname ) {}
function notStrictEqual( meth1, meth2, testname ) {}
function fireNative( node, type ) {}
function raises( block, expected, message ) {}
function asyncTest( testName, expected, callback ) {}
function t(a,b,c) {}
var moduleTeardown = "";
var originaljQuery = "";
var original$ = "";
var amdDefined = {};
var globalEvalTest = "";
var isLocal = false;
window.globalEvalTest = "";
window.iframeDone = "";
window.define = {};
window.define.amd = {};
window.define.amd.jQuery = {};
/** @param {...*} var_args */
function q(var_args) {}
function stop() {}
function start() {}
function url(value) {}
var QUnit = {};
QUnit.reset = function(){};
