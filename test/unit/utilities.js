QUnit.module( "utilities", { beforeEach: setup } );

function testAttr( doc, assert ) {
	assert.expect( 9 );

	var el;
	if ( doc ) {
		// XML
		el = doc.createElement( "input" );
		el.setAttribute( "type", "checkbox" );
	} else {
		// Set checked on creation by creating with a fragment
		// See https://jsfiddle.net/8sVgA/1/show/light in oldIE
		el = jQuery( "<input type='checkbox' checked='checked' />" )[ 0 ];
	}

	// Set it again for good measure
	el.setAttribute( "checked", "checked" );
	el.setAttribute( "id", "id" );
	el.setAttribute( "value", "on" );

	assert.strictEqual( Sizzle.attr( el, "nonexistent" ), null, "nonexistent" );
	assert.strictEqual( Sizzle.attr( el, "id" ), "id", "existent" );
	assert.strictEqual( Sizzle.attr( el, "value" ), "on", "value" );
	assert.strictEqual( Sizzle.attr( el, "checked" ), "checked", "boolean" );
	assert.strictEqual( Sizzle.attr( el, "href" ), null, "interpolation risk" );
	assert.strictEqual( Sizzle.attr( el, "constructor" ), null,
		"Object.prototype property \"constructor\" (negative)" );
	assert.strictEqual( Sizzle.attr( el, "watch" ), null,
		"Gecko Object.prototype property \"watch\" (negative)" );
	el.setAttribute( "constructor", "foo" );
	el.setAttribute( "watch", "bar" );
	assert.strictEqual( Sizzle.attr( el, "constructor" ), "foo",
		"Object.prototype property \"constructor\"" );
	assert.strictEqual( Sizzle.attr( el, "watch" ), "bar",
		"Gecko Object.prototype property \"watch\"" );
}

QUnit.test( "Sizzle.attr (HTML)", function( assert ) {
	testAttr( null, assert );
} );

QUnit.test( "Sizzle.attr (XML)", function( assert ) {
	testAttr( jQuery.parseXML( "<root/>" ), assert );
} );

QUnit.test( "Sizzle.escape", function( assert ) {

	// Edge cases
	assert.equal( Sizzle.escape(), "undefined", "Converts undefined to string" );
	assert.equal( Sizzle.escape( "-" ), "\\-", "Escapes standalone dash" );
	assert.equal( Sizzle.escape( "-a" ), "-a", "Doesn't escape leading dash followed by non-number" );
	assert.equal( Sizzle.escape( "--" ), "--", "Doesn't escape standalone double dash" );
	assert.equal( Sizzle.escape( "\uFFFD" ), "\uFFFD",
		"Doesn't escape standalone replacement character" );
	assert.equal( Sizzle.escape( "a\uFFFD" ), "a\uFFFD",
		"Doesn't escape trailing replacement character" );
	assert.equal( Sizzle.escape( "\uFFFDb" ), "\uFFFDb",
		"Doesn't escape leading replacement character" );
	assert.equal( Sizzle.escape( "a\uFFFDb" ), "a\uFFFDb",
		"Doesn't escape embedded replacement character" );

	// Derived from CSSOM tests
	// https://test.csswg.org/harness/test/cssom-1_dev/section/7.1/

	// String conversion
	assert.equal( Sizzle.escape( true ), "true", "Converts boolean true to string" );
	assert.equal( Sizzle.escape( false ), "false", "Converts boolean true to string" );
	assert.equal( Sizzle.escape( null ), "null", "Converts null to string" );
	assert.equal( Sizzle.escape( "" ), "", "Doesn't modify empty string" );

	// Null bytes
	assert.equal( Sizzle.escape( "\0" ), "\uFFFD",
		"Escapes null-character input as replacement character" );
	assert.equal( Sizzle.escape( "a\0" ), "a\uFFFD",
		"Escapes trailing-null input as replacement character" );
	assert.equal( Sizzle.escape( "\0b" ), "\uFFFDb",
		"Escapes leading-null input as replacement character" );
	assert.equal( Sizzle.escape( "a\0b" ), "a\uFFFDb",
		"Escapes embedded-null input as replacement character" );

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
} );

QUnit.test( "Sizzle.contains", function( assert ) {
	assert.expect( 16 );

	var container = document.getElementById( "nonnodes" ),
		element = container.firstChild,
		text = element.nextSibling,
		nonContained = container.nextSibling,
		detached = document.createElement( "a" );
	assert.ok( element && element.nodeType === 1, "preliminary: found element" );
	assert.ok( text && text.nodeType === 3, "preliminary: found text" );
	assert.ok( nonContained, "preliminary: found non-descendant" );
	assert.ok( Sizzle.contains( container, element ), "child" );
	assert.ok( Sizzle.contains( container.parentNode, element ), "grandchild" );
	assert.ok( Sizzle.contains( container, text ), "text child" );
	assert.ok( Sizzle.contains( container.parentNode, text ), "text grandchild" );
	assert.ok( !Sizzle.contains( container, container ), "self" );
	assert.ok( !Sizzle.contains( element, container ), "parent" );
	assert.ok( !Sizzle.contains( container, nonContained ), "non-descendant" );
	assert.ok( !Sizzle.contains( container, document ), "document" );
	assert.ok( !Sizzle.contains( container, document.documentElement ), "documentElement (negative)" );
	assert.ok( !Sizzle.contains( container, null ), "Passing null does not throw an error" );
	assert.ok( Sizzle.contains( document, document.documentElement ), "documentElement (positive)" );
	assert.ok( Sizzle.contains( document, element ), "document container (positive)" );
	assert.ok( !Sizzle.contains( document, detached ), "document container (negative)" );
} );

if ( jQuery( "<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='1' width='1'><g/></svg>"
	)[ 0 ].firstChild ) {

	QUnit.test( "Sizzle.contains in SVG (jQuery #10832)", function( assert ) {
		assert.expect( 4 );

		var svg = jQuery(
			"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='1' width='1'>" +
				"<g><circle cx='1' cy='1' r='1' /></g>" +
			"</svg>"
		).appendTo( "#qunit-fixture" )[ 0 ];

		assert.ok( Sizzle.contains( svg, svg.firstChild ), "root child" );
		assert.ok( Sizzle.contains( svg.firstChild, svg.firstChild.firstChild ), "element child" );
		assert.ok( Sizzle.contains( svg, svg.firstChild.firstChild ), "root granchild" );
		assert.ok( !Sizzle.contains( svg.firstChild.firstChild, svg.firstChild ),
			"parent (negative)" );
	} );
}

QUnit.test( "Sizzle.isXML", function( assert ) {
	assert.expect( 15 );

	var svgTree,
		xmlTree = jQuery.parseXML( "<docElem><elem/></docElem>" ).documentElement,
		htmlTree = jQuery( "<div>" +
			"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='1' width='1'>" +
			"<desc></desc>" +
			"</svg>" +
			"</div>"
		)[ 0 ],
		supportsSVG = /svg/i.test( htmlTree.firstChild.namespaceURI );

	// Support: IE<=8
	// Omit the SVG DOCTYPE if it is not understood
	try {
		svgTree = jQuery.parseXML(
			"<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" " +
				"\"http://www.w3.org/Gaphics/SVG/1.1/DTD/svg11.dtd\">" +
			"<svg version='1.1' xmlns='http://www.w3.org/2000/svg'><desc/></svg>"
		).documentElement;
	} catch ( ex ) {
		svgTree = jQuery.parseXML(
			"<svg version='1.1' xmlns='http://www.w3.org/2000/svg'><desc/></svg>"
		).documentElement;
	}

	assert.strictEqual( Sizzle.isXML( xmlTree ), true, "XML element" );
	assert.strictEqual( Sizzle.isXML( xmlTree.firstChild ), true, "XML child element" );

	assert.strictEqual( Sizzle.isXML( svgTree ), true, "SVG root element" );
	assert.strictEqual( Sizzle.isXML( svgTree.firstChild ), true, "SVG child element" );

	assert.strictEqual( Sizzle.isXML( htmlTree ), false, "disconnected div element" );
	assert.strictEqual( Sizzle.isXML( htmlTree.firstChild ), supportsSVG,
		"disconnected HTML-embedded SVG root element" );

	// Support: IE 7 only
	// The DOM under foreign elements can be incomplete
	if ( htmlTree.firstChild.firstChild ) {
		assert.strictEqual( Sizzle.isXML( htmlTree.firstChild.firstChild ), supportsSVG,
			"disconnected HTML-embedded SVG child element" );
	} else {
		assert.ok( true, "Cannot test an incomplete DOM" );
	}

	document.getElementById( "qunit-fixture" ).appendChild( htmlTree );
	assert.strictEqual( Sizzle.isXML( htmlTree ), false, "connected div element" );
	assert.strictEqual( Sizzle.isXML( htmlTree.firstChild ), supportsSVG,
		"connected HTML-embedded SVG root element" );

	// Support: IE 7 only
	// The DOM under foreign elements can be incomplete
	if ( htmlTree.firstChild.firstChild ) {
		assert.strictEqual( Sizzle.isXML( htmlTree.firstChild.firstChild ), supportsSVG,
			"disconnected HTML-embedded SVG child element" );
	} else {
		assert.ok( true, "Cannot test an incomplete DOM" );
	}

	assert.strictEqual( Sizzle.isXML( undefined ), false, "undefined" );
	assert.strictEqual( Sizzle.isXML( null ), false, "null" );
	assert.strictEqual( Sizzle.isXML( false ), false, "false" );
	assert.strictEqual( Sizzle.isXML( 0 ), false, "0" );
	assert.strictEqual( Sizzle.isXML( "" ), false, "\"\"" );
} );

QUnit.test( "Sizzle.uniqueSort", function( assert ) {
	assert.expect( 14 );

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
		fixture = document.getElementById( "qunit-fixture" ),
		detached1 = document.createElement( "p" ),
		detached2 = document.createElement( "ul" ),
		detachedChild = detached1.appendChild( document.createElement( "a" ) ),
		detachedGrandchild = detachedChild.appendChild( document.createElement( "b" ) );

	for ( i = 0; i < 12; i++ ) {
		detached.push( document.createElement( "li" ) );
		detached[ i ].id = "detached" + i;
		detached2.appendChild( document.createElement( "li" ) ).id = "detachedChild" + i;
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
				detached2.childNodes[ 3 ],
				detached2.childNodes[ 0 ],
				detached2.childNodes[ 2 ],
				detached2.childNodes[ 1 ]
			],
			expected: [
				detached2.childNodes[ 0 ],
				detached2.childNodes[ 1 ],
				detached2.childNodes[ 2 ],
				detached2.childNodes[ 3 ]
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
		assert.deepEqual(
			Sizzle.uniqueSort( test.input.slice( 0 ) ).slice( 0, length ),
			test.expected,
			label + " (array)"
		);
		assert.deepEqual(
			Sizzle.uniqueSort( new Arrayish( test.input ) ).slice( 0, length ),
			test.expected,
			label + " (quasi-array)"
		);
	} );
} );

testIframeWithCallback( "Sizzle.uniqueSort works cross-window (jQuery #14381)", "mixed_sort.html",
	function( actual, expected, message ) {
		var assert = this;
		assert.deepEqual( actual, expected, message );
	}
);

testIframeWithCallback( "Sizzle.noConflict", "noConflict.html", function( reporter ) {
	var assert = this;
	reporter( assert );
} );
