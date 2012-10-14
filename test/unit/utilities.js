/*global
	QUnit: true,
	q: true,
	t: true,
	url: true,
	createWithFriesXML: true,
	Sizzle: true,
	module: true,
	test: true,
	asyncTest: true,
	expect: true,
	stop: true,
	start: true,
	ok: true,
	equal: true,
	notEqual: true,
	deepEqual: true,
	notDeepEqual: true,
	strictEqual: true,
	notStrictEqual: true,
	raises: true,
	moduleTeardown: true
*/

module("utilities", { teardown: moduleTeardown });

test("Sizzle.contains", function() {
	expect( 16 );

	var container = document.getElementById("nonnodes"),
		element = container.firstChild,
		text = element.nextSibling,
		nonContained = container.nextSibling,
		detached = document.createElement("a");
	ok( element && element.nodeType === 1, "preliminary: found element" );
	ok( text && text.nodeType === 3, "preliminary: found text" );
	ok( nonContained, "preliminary: found non-descendant" );
	ok( Sizzle.contains(container, element), "child" );
	ok( Sizzle.contains(container.parentNode, element), "grandchild" );
	ok( Sizzle.contains(container, text), "text child" );
	ok( Sizzle.contains(container.parentNode, text), "text grandchild" );
	ok( !Sizzle.contains(container, container), "self" );
	ok( !Sizzle.contains(element, container), "parent" );
	ok( !Sizzle.contains(container, nonContained), "non-descendant" );
	ok( !Sizzle.contains(container, document), "document" );
	ok( !Sizzle.contains(container, document.documentElement), "documentElement (negative)" );
	ok( !Sizzle.contains(container, null), "Passing null does not throw an error" );
	ok( Sizzle.contains(document, document.documentElement), "documentElement (positive)" );
	ok( Sizzle.contains(document, element), "document container (positive)" );
	ok( !Sizzle.contains(document, detached), "document container (negative)" );
});

test("Sizzle.uniqueSort", function() {
	expect( 8 );

	function Arrayish() {
		var i = this.length = arguments.length;
		while ( i-- ) {
			this[ i ] = arguments[ i ];
		}
	}
	Arrayish.prototype = {
		slice: [].slice,
		sort: [].sort,
		splice: [].splice
	};

	var el1 = document.body,
		el2 = document.getElementById("qunit-fixture"),
		arrEmpty = [],
		objEmpty = new Arrayish(),
		arr1 = [ el1 ],
		obj1 = new Arrayish( el1 ),
		arr2 = [ el2, el1 ],
		obj2 = new Arrayish( el2, el1 ),
		arrDup = [ el1, el2, el2, el1 ],
		objDup = new Arrayish( el1, el2, el2, el1 );

	deepEqual( Sizzle.uniqueSort( arrEmpty ).slice( 0 ), [], "Empty array" );
	deepEqual( Sizzle.uniqueSort( objEmpty ).slice( 0 ), [], "Empty quasi-array" );
	deepEqual( Sizzle.uniqueSort( arr1 ).slice( 0 ), [ el1 ], "Single-element array" );
	deepEqual( Sizzle.uniqueSort( obj1 ).slice( 0 ), [ el1 ], "Single-element quasi-array" );
	deepEqual( Sizzle.uniqueSort( arr2 ).slice( 0 ), [ el1, el2 ], "No-duplicates array" );
	deepEqual( Sizzle.uniqueSort( obj2 ).slice( 0 ), [ el1, el2 ], "No-duplicates quasi-array" );
	deepEqual( Sizzle.uniqueSort( arrDup ).slice( 0 ), [ el1, el2 ], "Duplicates array" );
	deepEqual( Sizzle.uniqueSort( objDup ).slice( 0 ), [ el1, el2 ], "Duplicates quasi-array" );
});
