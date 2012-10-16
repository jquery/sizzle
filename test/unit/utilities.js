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
	expect( 10 );

	function Arrayish( arr ) {
		var i = this.length = arr.length;
		while ( i-- ) {
			this[ i ] = arr[ i ];
		}
	}
	Arrayish.prototype = {
		slice: [].slice,
		sort: [].sort,
		splice: [].splice
	};

	var body = document.body,
		fixture = document.getElementById("qunit-fixture"),
		detached1 = document.createElement("p"),
		detached2 = document.createElement("ul"),
		detachedChild = detached1.appendChild( document.createElement("a") ),
		detachedGrandchild = detachedChild.appendChild( document.createElement("b") ),
		tests = {
			"Empty": {
				input: [],
				expected: []
			},
			"Single-element": {
				input: [ fixture ],
				expected: [ fixture ]
			},
			"No duplicates": {
				input: [ fixture, body ],
				expected: [ body, fixture ]
			},
			"Duplicates": {
				input: [ body, fixture, fixture, body ],
				expected: [ body, fixture ]
			},
			"Detached elements": {
				input: [ detached1, fixture, detached2, document, detachedChild, body, detachedGrandchild ],
				expected: [ document, body, fixture ],
				length: 3
			}
		};

	jQuery.each( tests, function( label, test ) {
		var length = test.length || test.input.length;
		deepEqual( Sizzle.uniqueSort( test.input ).slice( 0, length ), test.expected, label + " (array)" );
		deepEqual( Sizzle.uniqueSort( new Arrayish(test.input) ).slice( 0, length ), test.expected, label + " (quasi-array)" );
	});
});
