module( "utilities", { setup: setup } );

function testAttr( doc ) {
	expect( 9 );

	var el;
	if ( doc ) {
		// XML
		el = doc.createElement( "input" );
		el.setAttribute( "type", "checkbox" );
	} else {
		// Set checked on creation by creating with a fragment
		// See http://jsfiddle.net/8sVgA/1/show/light in oldIE
		el = jQuery( "<input type='checkbox' checked='checked' />" )[0];
	}

	// Set it again for good measure
	el.setAttribute( "checked", "checked" );
	el.setAttribute( "id", "id" );
	el.setAttribute( "value", "on" );

	strictEqual( Sizzle.attr( el, "nonexistent" ), null, "nonexistent" );
	strictEqual( Sizzle.attr( el, "id" ), "id", "existent" );
	strictEqual( Sizzle.attr( el, "value" ), "on", "value" );
	strictEqual( Sizzle.attr( el, "checked" ), "checked", "boolean" );
	strictEqual( Sizzle.attr( el, "href" ), null, "interpolation risk" );
	strictEqual( Sizzle.attr( el, "constructor" ), null,
		"Object.prototype property \"constructor\" (negative)" );
	strictEqual( Sizzle.attr( el, "watch" ), null,
		"Gecko Object.prototype property \"watch\" (negative)" );
	el.setAttribute( "constructor", "foo" );
	el.setAttribute( "watch", "bar" );
	strictEqual( Sizzle.attr( el, "constructor" ), "foo",
		"Object.prototype property \"constructor\"" );
	strictEqual( Sizzle.attr( el, "watch" ), "bar",
		"Gecko Object.prototype property \"watch\"" );
}

test("Sizzle.attr (HTML)", function() {
	testAttr();
});

test("Sizzle.attr (XML)", function() {
	testAttr( jQuery.parseXML("<root/>") );
});

test("Sizzle.escape", function( assert ) {
	// Null bytes
	// We allow NULL input, unlike the draft spec as of 2015-11-09
	assert.equal( Sizzle.escape( "\0" ), "\\0 ", "Escapes null-character input" );
	assert.equal( Sizzle.escape( "a\0" ), "a\\0 ", "Escapes trailing-null input" );
	assert.equal( Sizzle.escape( "\0b" ), "\\0 b", "Escapes leading-null input" );
	assert.equal( Sizzle.escape( "a\0b" ), "a\\0 b", "Escapes embedded-null input" );

	// Edge cases
	assert.equal( Sizzle.escape(), "undefined", "Converts undefined to string" );
	assert.equal( Sizzle.escape("-"), "\\-", "Escapes standalone dash" );
	assert.equal( Sizzle.escape("-a"), "-a", "Doesn't escape leading dash followed by non-number" );
	assert.equal( Sizzle.escape("--"), "--", "Doesn't escape standalone double dash" );

	// Derived from CSSOM tests
	// https://test.csswg.org/harness/test/cssom-1_dev/section/7.1/

	// String conversion
	assert.equal( Sizzle.escape( true ), "true", "Converts boolean true to string" );
	assert.equal( Sizzle.escape( false ), "false", "Converts boolean true to string" );
	assert.equal( Sizzle.escape( null ), "null", "Converts null to string" );
	assert.equal( Sizzle.escape( "" ), "", "Doesn't modify empty string" );

	// Null bytes
	// We allow NULL input, unlike the draft spec as of 2015-11-09
	//assert.throws( function() { Sizzle.escape( "\0" ); }, /escape/,
	//	"Throws on null-character input" );
	//assert.throws( function() { Sizzle.escape( "a\0" ); }, /escape/,
	//	"Throws on trailing-null input" );
	//assert.throws( function() { Sizzle.escape( "\0b" ); }, /escape/,
	//	"Throws on leading-null input" );
	//assert.throws( function() { Sizzle.escape( "a\0b" ); }, /escape/,
	//	"Throws on embedded-null input" );

	// Number prefix
	assert.equal( Sizzle.escape( "0a" ), "\\30 a", "Escapes leading 0" );
	assert.equal( Sizzle.escape( "1a" ), "\\31 a", "Escapes leading 1" );
	assert.equal( Sizzle.escape( "2a" ), "\\32 a", "Escapes leading 2" );
	assert.equal( Sizzle.escape( "3a" ), "\\33 a", "Escapes leading 3" );
	assert.equal( Sizzle.escape( "4a" ), "\\34 a", "Escapes leading 4" );
	assert.equal( Sizzle.escape( "5a" ), "\\35 a", "Escapes leading 5" );
	assert.equal( Sizzle.escape( "6a" ), "\\36 a", "Escapes leading 6" );
	assert.equal( Sizzle.escape( "7a" ), "\\37 a", "Escapes leading 7" );
	assert.equal( Sizzle.escape( "8a" ), "\\38 a", "Escapes leading 8" );
	assert.equal( Sizzle.escape( "9a" ), "\\39 a", "Escapes leading 9" );

	// Letter-number prefix
	assert.equal( Sizzle.escape( "a0b" ), "a0b", "Doesn't escape embedded 0" );
	assert.equal( Sizzle.escape( "a1b" ), "a1b", "Doesn't escape embedded 1" );
	assert.equal( Sizzle.escape( "a2b" ), "a2b", "Doesn't escape embedded 2" );
	assert.equal( Sizzle.escape( "a3b" ), "a3b", "Doesn't escape embedded 3" );
	assert.equal( Sizzle.escape( "a4b" ), "a4b", "Doesn't escape embedded 4" );
	assert.equal( Sizzle.escape( "a5b" ), "a5b", "Doesn't escape embedded 5" );
	assert.equal( Sizzle.escape( "a6b" ), "a6b", "Doesn't escape embedded 6" );
	assert.equal( Sizzle.escape( "a7b" ), "a7b", "Doesn't escape embedded 7" );
	assert.equal( Sizzle.escape( "a8b" ), "a8b", "Doesn't escape embedded 8" );
	assert.equal( Sizzle.escape( "a9b" ), "a9b", "Doesn't escape embedded 9" );

	// Dash-number prefix
	assert.equal( Sizzle.escape( "-0a" ), "-\\30 a", "Escapes 0 after leading dash" );
	assert.equal( Sizzle.escape( "-1a" ), "-\\31 a", "Escapes 1 after leading dash" );
	assert.equal( Sizzle.escape( "-2a" ), "-\\32 a", "Escapes 2 after leading dash" );
	assert.equal( Sizzle.escape( "-3a" ), "-\\33 a", "Escapes 3 after leading dash" );
	assert.equal( Sizzle.escape( "-4a" ), "-\\34 a", "Escapes 4 after leading dash" );
	assert.equal( Sizzle.escape( "-5a" ), "-\\35 a", "Escapes 5 after leading dash" );
	assert.equal( Sizzle.escape( "-6a" ), "-\\36 a", "Escapes 6 after leading dash" );
	assert.equal( Sizzle.escape( "-7a" ), "-\\37 a", "Escapes 7 after leading dash" );
	assert.equal( Sizzle.escape( "-8a" ), "-\\38 a", "Escapes 8 after leading dash" );
	assert.equal( Sizzle.escape( "-9a" ), "-\\39 a", "Escapes 9 after leading dash" );

	// Double dash prefix
	assert.equal( Sizzle.escape( "--a" ), "--a", "Doesn't escape leading double dash" );

	// Miscellany
	assert.equal( Sizzle.escape( "\x01\x02\x1E\x1F" ), "\\1 \\2 \\1e \\1f ",
		"Escapes C0 control characters" );
	assert.equal( Sizzle.escape( "\x80\x2D\x5F\xA9" ), "\x80\x2D\x5F\xA9",
		"Doesn't escape general punctuation or non-ASCII ISO-8859-1 characters" );
	assert.equal(
		Sizzle.escape( "\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90" +
			"\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F" ),
		"\\7f \x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90" +
			"\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F",
		"Escapes DEL control character"
	);
	assert.equal( Sizzle.escape( "\xA0\xA1\xA2" ), "\xA0\xA1\xA2",
		"Doesn't escape non-ASCII ISO-8859-1 characters" );
	assert.equal( Sizzle.escape( "a0123456789b" ), "a0123456789b",
		"Doesn't escape embedded numbers" );
	assert.equal( Sizzle.escape( "abcdefghijklmnopqrstuvwxyz" ), "abcdefghijklmnopqrstuvwxyz",
		"Doesn't escape lowercase ASCII letters" );
	assert.equal( Sizzle.escape( "ABCDEFGHIJKLMNOPQRSTUVWXYZ" ), "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		"Doesn't escape uppercase ASCII letters" );
	assert.equal( Sizzle.escape( "\x20\x21\x78\x79" ), "\\ \\!xy",
		"Escapes non-word ASCII characters" );

	// Astral symbol (U+1D306 TETRAGRAM FOR CENTRE)
	assert.equal( Sizzle.escape( "\uD834\uDF06" ), "\uD834\uDF06",
		"Doesn't escape astral characters" );

	// Lone surrogates
	assert.equal( Sizzle.escape( "\uDF06" ), "\uDF06", "Doesn't escape lone low surrogate" );
	assert.equal( Sizzle.escape( "\uD834" ), "\uD834", "Doesn't escape lone high surrogate" );
});

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

if ( jQuery("<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='1' width='1'><g/></svg>")[0].firstChild ) {
	test("Sizzle.contains in SVG (jQuery #10832)", function() {
		expect( 4 );

		var svg = jQuery(
			"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='1' width='1'>" +
				"<g><circle cx='1' cy='1' r='1' /></g>" +
			"</svg>"
		).appendTo("#qunit-fixture")[0];

		ok( Sizzle.contains( svg, svg.firstChild ), "root child" );
		ok( Sizzle.contains( svg.firstChild, svg.firstChild.firstChild ), "element child" );
		ok( Sizzle.contains( svg, svg.firstChild.firstChild ), "root granchild" );
		ok( !Sizzle.contains( svg.firstChild.firstChild, svg.firstChild ), "parent (negative)" );
	});
}

test("Sizzle.uniqueSort", function() {
	expect( 14 );

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

	var i, tests,
		detached = [],
		body = document.body,
		fixture = document.getElementById("qunit-fixture"),
		detached1 = document.createElement("p"),
		detached2 = document.createElement("ul"),
		detachedChild = detached1.appendChild( document.createElement("a") ),
		detachedGrandchild = detachedChild.appendChild( document.createElement("b") );

	for ( i = 0; i < 12; i++ ) {
		detached.push( document.createElement("li") );
		detached[i].id = "detached" + i;
		detached2.appendChild( document.createElement("li") ).id = "detachedChild" + i;
	}

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
		"Detached": {
			input: detached.slice( 0 ),
			expected: detached.slice( 0 )
		},
		"Detached children": {
			input: [
				detached2.childNodes[3],
				detached2.childNodes[0],
				detached2.childNodes[2],
				detached2.childNodes[1]
			],
			expected: [
				detached2.childNodes[0],
				detached2.childNodes[1],
				detached2.childNodes[2],
				detached2.childNodes[3]
			]
		},
		"Attached/detached mixture": {
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

testIframeWithCallback( "Sizzle.uniqueSort works cross-window (jQuery #14381)", "mixed_sort.html", deepEqual );
