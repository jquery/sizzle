QUnit.module( "selector", { beforeEach: setup } );

/*
	======== testinit.js reference ========
	See data/testinit.js

	q(...);
		Returns an array of elements with the given IDs
		@example q("main", "foo", "bar") => [<div id="main">, <span id="foo">, <input id="bar">]

	t( testName, selector, [ "array", "of", "ids" ] );
		Asserts that a select matches the given IDs
		@example t("Check for something", "//[a]", ["foo", "baar"]);

	url( "some/url.php" );
		Add random number to url to stop caching
		@example url("data/test.html") => "data/test.html?10538358428943"
		@example url("data/test.php?foo=bar") => "data/test.php?foo=bar&10538358345554"
*/

QUnit.test( "element", function( assert ) {
	assert.expect( 35 );

	var form, all, good, i, lengthtest, siblingTest, html;

	assert.equal( Sizzle( "" ).length, 0, "Empty selector returns an empty array" );
	assert.deepEqual( Sizzle( "div", document.createTextNode( "" ) ), [],
		"Text element as context fails silently" );
	form = document.getElementById( "form" );
	assert.ok( !Sizzle.matchesSelector( form, "" ),
		"Empty string passed to matchesSelector does not match" );
	assert.equal( Sizzle( " " ).length, 0, "Empty selector returns an empty array" );
	assert.equal( Sizzle( "\t" ).length, 0, "Empty selector returns an empty array" );

	all = Sizzle( "*" );
	assert.ok( all.length >= 30, "Select all" );
	good = true;
	for ( i = 0; i < all.length; i++ ) {
		if ( all[ i ].nodeType === 8 ) {
			good = false;
		}
	}
	assert.ok( good, "Select all elements, no comment nodes" );
	t( "Element Selector", "html", [ "html" ] );
	t( "Element Selector", "body", [ "body" ] );
	t( "Element Selector", "#qunit-fixture p", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );

	t( "Leading space", " #qunit-fixture p", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( "Leading tab", "\t#qunit-fixture p", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( "Leading carriage return", "\r#qunit-fixture p", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( "Leading line feed", "\n#qunit-fixture p", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( "Leading form feed", "\f#qunit-fixture p", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( "Trailing space", "#qunit-fixture p ", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( "Trailing tab", "#qunit-fixture p\t", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( "Trailing carriage return", "#qunit-fixture p\r",
		[ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( "Trailing line feed", "#qunit-fixture p\n", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( "Trailing form feed", "#qunit-fixture p\f", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );

	assert.deepEqual(
		jQuery( Sizzle( "div ol" ) ).filter( "#qunit-fixture *" ).get(),
		q( "empty", "listWithTabIndex" ),
		"Parent Element"
	);
	assert.deepEqual(
		jQuery( Sizzle( "div\tol" ) ).filter( "#qunit-fixture *" ).get(),
		q( "empty", "listWithTabIndex" ),
		"Parent Element (non-space descendant combinator)"
	);

	// Check for unique-ness and sort order
	assert.deepEqual( Sizzle( "p, div p" ), Sizzle( "p" ), "Check for duplicates: p, div p" );

	jQuery( "<h1 id='h1'/><h2 id='h2'/><h2 id='h2-2'/>" ).prependTo( "#qunit-fixture" );
	t( "Checking sort order", "#qunit-fixture h2, #qunit-fixture h1", [ "h1", "h2", "h2-2" ] );
	t( "Checking sort order", "#qunit-fixture h2:first, #qunit-fixture h1:first", [ "h1", "h2" ] );
	t( "Checking sort order", "#qunit-fixture p, #qunit-fixture p a",
		[ "firstp", "simon1", "ap", "google", "groups", "anchor1", "mark", "sndp", "en", "yahoo",
		"sap", "anchor2", "simon", "first" ] );

	// Test Conflict ID
	lengthtest = document.getElementById( "lengthtest" );
	assert.deepEqual( Sizzle( "#idTest", lengthtest ), q( "idTest" ),
		"Finding element with id of ID." );
	assert.deepEqual( Sizzle( "[name='id']", lengthtest ), q( "idTest" ),
		"Finding element with id of ID." );
	assert.deepEqual( Sizzle( "input[id='idTest']", lengthtest ), q( "idTest" ),
		"Finding elements with id of ID." );

	siblingTest = document.getElementById( "siblingTest" );
	assert.deepEqual( Sizzle( "div em", siblingTest ), [],
		"Element-rooted QSA does not select based on document context" );
	assert.deepEqual( Sizzle( "div em, div em, div em:not(div em)", siblingTest ), [],
		"Element-rooted QSA does not select based on document context" );
	assert.deepEqual( Sizzle( "div em, em\\,", siblingTest ), [],
		"Escaped commas do not get treated with an id in element-rooted QSA" );

	html = "";
	for ( i = 0; i < 100; i++ ) {
		html = "<div>" + html + "</div>";
	}
	html = jQuery( html ).appendTo( document.body );
	assert.ok( !!Sizzle( "body div div div" ).length,
		"No stack or performance problems with large amounts of descendants" );
	assert.ok( !!Sizzle( "body>div div div" ).length,
		"No stack or performance problems with large amounts of descendants" );
	html.remove();

	// Real use case would be using .watch in browsers with window.watch (see Issue #157)
	q( "qunit-fixture" )[ 0 ].appendChild( document.createElement( "toString" ) ).id = "toString";
	t( "Element name matches Object.prototype property", "toString#toString", [ "toString" ] );
} );

QUnit.test( "XML Document Selectors", function( assert ) {
	var xml = createWithFriesXML();
	assert.expect( 11 );

	assert.equal( Sizzle( "foo_bar", xml ).length, 1, "Element Selector with underscore" );
	assert.equal( Sizzle( ".component", xml ).length, 1, "Class selector" );
	assert.equal( Sizzle( "[class*=component]", xml ).length, 1, "Attribute selector for class" );
	assert.equal( Sizzle( "property[name=prop2]", xml ).length, 1, "Attribute selector with name" );
	assert.equal( Sizzle( "[name=prop2]", xml ).length, 1, "Attribute selector with name" );
	assert.equal( Sizzle( "#seite1", xml ).length, 1, "Attribute selector with ID" );
	assert.equal( Sizzle( "component#seite1", xml ).length, 1, "Attribute selector with ID" );
	assert.equal( Sizzle.matches( "#seite1", Sizzle( "component", xml ) ).length, 1,
		"Attribute selector filter with ID" );
	assert.equal( Sizzle( "meta property thing", xml ).length, 2,
		"Descendent selector and dir caching" );
	assert.ok( Sizzle.matchesSelector( xml.lastChild, "soap\\:Envelope" ),
		"Check for namespaced element" );

	xml = jQuery.parseXML( "<?xml version='1.0' encoding='UTF-8'?><root><elem id='1'/></root>" );
	assert.equal( Sizzle( "elem:not(:has(*))", xml ).length, 1,
		"Non-qSA path correctly handles numeric ids (jQuery #14142)" );
} );

QUnit.test( "broken", function( assert ) {
	assert.expect( 31 );

	var attrbad,
		broken = function( name, selector ) {
			assert.throws( function() {
				// Setting context to null here somehow avoids QUnit's window.error handling
				// making the e & e.message correct
				// For whatever reason, without this,
				// Sizzle.error will be called but no error will be seen in oldIE
				Sizzle.call( null, selector );
			}, function( e ) {
				return e.message.indexOf( "Syntax error" ) >= 0;
			}, name + ": " + selector );
		};

	broken( "Broken Selector", "[" );
	broken( "Broken Selector", "(" );
	broken( "Broken Selector", "{" );
	broken( "Broken Selector", "<" );
	broken( "Broken Selector", "()" );
	broken( "Broken Selector", "<>" );
	broken( "Broken Selector", "{}" );
	broken( "Broken Selector", "," );
	broken( "Broken Selector", ",a" );
	broken( "Broken Selector", "a," );
	broken( "Post-comma invalid selector", "*,:x" );
	broken( "Identifier with bad escape", "foo\\\fbaz" );
	// Hangs on IE 9 if regular expression is inefficient
	broken( "Broken Selector", "[id=012345678901234567890123456789" );
	broken( "Doesn't exist", ":visble" );
	broken( "Nth-child", ":nth-child" );
	// Sigh again. IE 9 thinks this is also a real selector
	// not super critical that we fix this case
	//broken( "Nth-child", ":nth-child(-)" );
	// Sigh. WebKit thinks this is a real selector in qSA
	// They've already fixed this and it'll be coming into
	// current browsers soon. Currently, Safari 5.0 still has this problem
	// broken( "Nth-child", ":nth-child(asdf)", [] );
	broken( "Nth-child", ":nth-child(2n+-0)" );
	broken( "Nth-child", ":nth-child(2+0)" );
	broken( "Nth-child", ":nth-child(- 1n)" );
	broken( "Nth-child", ":nth-child(-1 n)" );
	broken( "First-child", ":first-child(n)" );
	broken( "Last-child", ":last-child(n)" );
	broken( "Only-child", ":only-child(n)" );
	broken( "Nth-last-last-child", ":nth-last-last-child(1)" );
	broken( "First-last-child", ":first-last-child" );
	broken( "Last-last-child", ":last-last-child" );
	broken( "Only-last-child", ":only-last-child" );

	// Make sure attribute value quoting works correctly. See: #6093
	attrbad = jQuery( "<input type='hidden' value='2' name='foo.baz' id='attrbad1'/><input type='hidden' value='2' name='foo[baz]' id='attrbad2'/>" ).appendTo( "#qunit-fixture" );

	broken( "Attribute equals non-value", "input[name=]" );
	broken( "Attribute equals unquoted non-identifier", "input[name=foo.baz]" );
	broken( "Attribute equals unquoted non-identifier", "input[name=foo[baz]]" );
	broken( "Attribute equals bad string", "input[name=''double-quoted'']" );
	broken( "Attribute equals bad string", "input[name='apostrophe'd']" );
} );

QUnit.test( "id", function( assert ) {
	assert.expect( 34 );

	var fiddle, a;

	t( "ID Selector", "#body", [ "body" ] );
	t( "ID Selector w/ Element", "body#body", [ "body" ] );
	t( "ID Selector w/ Element", "ul#first", [] );
	t( "ID selector with existing ID descendant", "#firstp #simon1", [ "simon1" ] );
	t( "ID selector with non-existant descendant", "#firstp #foobar", [] );
	t( "ID selector using UTF8", "#台北Táiběi", [ "台北Táiběi" ] );
	t( "Multiple ID selectors using UTF8", "#台北Táiběi, #台北", [ "台北Táiběi", "台北" ] );
	t( "Descendant ID selector using UTF8", "div #台北", [ "台北" ] );
	t( "Child ID selector using UTF8", "form > #台北", [ "台北" ] );

	t( "Escaped ID", "#foo\\:bar", [ "foo:bar" ] );
	t( "Escaped ID with descendant", "#foo\\:bar span:not(:input)", [ "foo_descendant" ] );
	t( "Escaped ID", "#test\\.foo\\[5\\]bar", [ "test.foo[5]bar" ] );
	t( "Descendant escaped ID", "div #foo\\:bar", [ "foo:bar" ] );
	t( "Descendant escaped ID", "div #test\\.foo\\[5\\]bar", [ "test.foo[5]bar" ] );
	t( "Child escaped ID", "form > #foo\\:bar", [ "foo:bar" ] );
	t( "Child escaped ID", "form > #test\\.foo\\[5\\]bar", [ "test.foo[5]bar" ] );

	fiddle = jQuery( "<div id='fiddle\\Foo'><span id='fiddleSpan'></span></div>" )
		.appendTo( "#qunit-fixture" );
	assert.deepEqual( Sizzle( "> span", Sizzle( "#fiddle\\\\Foo" )[ 0 ] ), q( [ "fiddleSpan" ] ),
		"Escaped ID as context" );
	fiddle.remove();

	t( "ID Selector, child ID present", "#form > #radio1", [ "radio1" ] ); // bug #267
	t( "ID Selector, not an ancestor ID", "#form #first", [] );
	t( "ID Selector, not a child ID", "#form > #option1a", [] );

	t( "All Children of ID", "#foo > *", [ "sndp", "en", "sap" ] );
	t( "All Children of ID with no children", "#firstUL > *", [] );

	assert.equal( Sizzle( "#tName1" )[ 0 ].id, "tName1",
		"ID selector with same value for a name attribute" );
	t( "ID selector non-existing but name attribute on an A tag",         "#tName2",      [] );
	t( "Leading ID selector non-existing but name attribute on an A tag", "#tName2 span", [] );
	t( "Leading ID selector existing, retrieving the child",              "#tName1 span", [ "tName1-span" ] );
	assert.equal( Sizzle( "div > div #tName1" )[ 0 ].id, Sizzle( "#tName1-span" )[ 0 ].parentNode.id,
		"Ending with ID" );

	a = jQuery( "<a id='backslash\\foo'></a>" ).appendTo( "#qunit-fixture" );
	t( "ID Selector contains backslash", "#backslash\\\\foo", [ "backslash\\foo" ] );

	t( "ID Selector on Form with an input that has a name of 'id'", "#lengthtest", [ "lengthtest" ] );

	t( "ID selector with non-existant ancestor", "#asdfasdf #foobar", [] ); // bug #986

	assert.deepEqual( Sizzle( "div#form", document.body ), [],
		"ID selector within the context of another element" );

	t( "Underscore ID", "#types_all", [ "types_all" ] );
	t( "Dash ID", "#qunit-fixture", [ "qunit-fixture" ] );

	t( "ID with weird characters in it", "#name\\+value", [ "name+value" ] );
} );

QUnit.test( "class", function( assert ) {
	assert.expect( 27 );

	t( "Class Selector", ".blog", [ "mark", "simon" ] );
	t( "Class Selector", ".GROUPS", [ "groups" ] );
	t( "Class Selector", ".blog.link", [ "simon" ] );
	t( "Class Selector w/ Element", "a.blog", [ "mark", "simon" ] );
	t( "Parent Class Selector", "p .blog", [ "mark", "simon" ] );

	t( "Class selector using UTF8", ".台北Táiběi", [ "utf8class1" ] );
	//t( "Class selector using UTF8", ".台北", ["utf8class1","utf8class2"] );
	t( "Class selector using UTF8", ".台北Táiběi.台北", [ "utf8class1" ] );
	t( "Class selector using UTF8", ".台北Táiběi, .台北", [ "utf8class1", "utf8class2" ] );
	t( "Descendant class selector using UTF8", "div .台北Táiběi", [ "utf8class1" ] );
	t( "Child class selector using UTF8", "form > .台北Táiběi", [ "utf8class1" ] );

	t( "Escaped Class", ".foo\\:bar", [ "foo:bar" ] );
	t( "Escaped Class", ".test\\.foo\\[5\\]bar", [ "test.foo[5]bar" ] );
	t( "Descendant escaped Class", "div .foo\\:bar", [ "foo:bar" ] );
	t( "Descendant escaped Class", "div .test\\.foo\\[5\\]bar", [ "test.foo[5]bar" ] );
	t( "Child escaped Class", "form > .foo\\:bar", [ "foo:bar" ] );
	t( "Child escaped Class", "form > .test\\.foo\\[5\\]bar", [ "test.foo[5]bar" ] );

	var div = document.createElement( "div" );
	div.innerHTML = "<div class='test e'></div><div class='test'></div>";
	assert.deepEqual( Sizzle( ".e", div ), [ div.firstChild ], "Finding a second class." );

	div.lastChild.className = "e";

	assert.deepEqual( Sizzle( ".e", div ), [ div.firstChild, div.lastChild ],
		"Finding a modified class." );

	assert.ok( !Sizzle.matchesSelector( div, ".null" ),
		".null does not match an element with no class" );
	assert.ok( !Sizzle.matchesSelector( div.firstChild, ".null div" ),
		".null does not match an element with no class" );
	div.className = "null";
	assert.ok( Sizzle.matchesSelector( div, ".null" ), ".null matches element with class 'null'" );
	assert.ok( Sizzle.matchesSelector( div.firstChild, ".null div" ),
		"caching system respects DOM changes" );
	assert.ok( !Sizzle.matchesSelector( document, ".foo" ),
		"testing class on document doesn't error" );
	assert.ok( !Sizzle.matchesSelector( window, ".foo" ), "testing class on window doesn't error" );

	div.lastChild.className += " hasOwnProperty toString";
	assert.deepEqual( Sizzle( ".e.hasOwnProperty.toString", div ), [ div.lastChild ],
		"Classes match Object.prototype properties" );

	div = jQuery( "<div><svg width='200' height='250' version='1.1'" +
		" xmlns='http://www.w3.org/2000/svg'><rect x='10' y='10' width='30' height='30'" +
		"class='foo'></rect></svg></div>" )[ 0 ];
	assert.equal( Sizzle( ".foo", div ).length, 1, "Class selector against SVG container" );

	// Support: IE <=7
	// Test SVG selection only if SVG works
	if ( div.firstChild.firstChild ) {
		assert.equal( Sizzle( ".foo", div.firstChild ).length, 1,
			"Class selector directly against SVG" );
	} else {
		assert.ok( true, "SVG not supported" );
	}
} );

QUnit.test( "name", function( assert ) {
	assert.expect( 14 );

	var form;

	t( "Name selector", "input[name=action]", [ "text1" ] );
	t( "Name selector with single quotes", "input[name='action']", [ "text1" ] );
	t( "Name selector with double quotes", "input[name=\"action\"]", [ "text1" ] );

	t( "Name selector non-input", "[name=example]", [ "name-is-example" ] );
	t( "Name selector non-input", "[name=div]", [ "name-is-div" ] );
	t( "Name selector non-input", "*[name=iframe]", [ "iframe" ] );

	t( "Name selector for grouped input", "input[name='types[]']", [ "types_all", "types_anime", "types_movie" ] );

	form = document.getElementById( "form" );
	assert.deepEqual( Sizzle( "input[name=action]", form ), q( "text1" ),
		"Name selector within the context of another element" );
	assert.deepEqual( Sizzle( "input[name='foo[bar]']", form ), q( "hidden2" ),
		"Name selector for grouped form element within the context of another element" );

	form = jQuery( "<form><input name='id'/></form>" ).appendTo( "body" );
	assert.equal( Sizzle( "input", form[ 0 ] ).length, 1,
		"Make sure that rooted queries on forms (with possible expandos) work." );

	form.remove();

	t( "Find elements that have similar IDs", "[name=tName1]", [ "tName1ID" ] );
	t( "Find elements that have similar IDs", "[name=tName2]", [ "tName2ID" ] );
	t( "Find elements that have similar IDs", "#tName2ID", [ "tName2ID" ] );

	t( "Case-sensitivity", "[name=tname1]", [] );
} );

QUnit.test( "multiple", function( assert ) {
	assert.expect( 6 );

	jQuery( "#qunit-fixture" ).prepend( "<h2 id='h2'/>" );

	t( "Comma Support", "#qunit-fixture h2, #qunit-fixture p",
		[ "h2", "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( "Comma Support", "#qunit-fixture h2 , #qunit-fixture p",
		[ "h2", "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( "Comma Support", "#qunit-fixture h2 , #qunit-fixture p",
		[ "h2", "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( "Comma Support", "#qunit-fixture h2,#qunit-fixture p",
		[ "h2", "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( "Comma Support", "#qunit-fixture h2,#qunit-fixture p ",
		[ "h2", "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( "Comma Support", "#qunit-fixture h2\t,\r#qunit-fixture p\n",
		[ "h2", "firstp", "ap", "sndp", "en", "sap", "first" ] );
} );

QUnit.test( "child and adjacent", function( assert ) {
	assert.expect( 43 );

	var siblingFirst, en, nothiddendiv;

	t( "Child", "p > a", [ "simon1", "google", "groups", "mark", "yahoo", "simon" ] );
	t( "Child minus whitespace", "p>a", [ "simon1", "google", "groups", "mark", "yahoo", "simon" ] );
	t( "Child minus trailing whitespace", "p> a",
		[ "simon1", "google", "groups", "mark", "yahoo", "simon" ] );
	t( "Child minus leading whitespace", "p >a",
		[ "simon1", "google", "groups", "mark", "yahoo", "simon" ] );
	t( "Child w/ Class", "p > a.blog", [ "mark", "simon" ] );
	t( "All Children", "code > *", [ "anchor1", "anchor2" ] );
	t( "All Grandchildren", "p > * > *", [ "anchor1", "anchor2" ] );
	t( "Rooted tag adjacent", "#qunit-fixture a + a", [ "groups", "tName2ID" ] );
	t( "Rooted tag adjacent minus whitespace", "#qunit-fixture a+a", [ "groups", "tName2ID" ] );
	t( "Rooted tag adjacent minus leading whitespace", "#qunit-fixture a +a",
		[ "groups", "tName2ID" ] );
	t( "Rooted tag adjacent minus trailing whitespace", "#qunit-fixture a+ a",
		[ "groups", "tName2ID" ] );
	t( "Tag adjacent", "p + p", [ "ap", "en", "sap" ] );
	t( "#id adjacent", "#firstp + p", [ "ap" ] );
	t( "Tag#id adjacent", "p#firstp + p", [ "ap" ] );
	t( "Tag[attr] adjacent", "p[lang=en] + p", [ "sap" ] );
	t( "Tag.class adjacent", "a.GROUPS + code + a", [ "mark" ] );
	t( "Comma, Child, and Adjacent", "#qunit-fixture a + a, code > a",
		[ "groups", "anchor1", "anchor2", "tName2ID" ] );
	t( "Element Preceded By", "#qunit-fixture p ~ div",
		[ "foo", "nothiddendiv", "moretests", "tabindex-tests", "liveHandlerOrder", "siblingTest" ] );
	t( "Element Preceded By", "#first ~ div",
		[ "moretests", "tabindex-tests", "liveHandlerOrder", "siblingTest" ] );
	t( "Element Preceded By", "#groups ~ a", [ "mark" ] );
	t( "Element Preceded By", "#length ~ input", [ "idTest" ] );
	t( "Element Preceded By", "#siblingfirst ~ em", [ "siblingnext", "siblingthird" ] );
	t( "Element Preceded By (multiple)", "#siblingTest em ~ em ~ em ~ span", [ "siblingspan" ] );
	t( "Element Preceded By, Containing", "#liveHandlerOrder ~ div em:contains('1')",
		[ "siblingfirst" ] );

	siblingFirst = document.getElementById( "siblingfirst" );

	assert.deepEqual( Sizzle( "~ em", siblingFirst ), q( "siblingnext", "siblingthird" ),
		"Element Preceded By with a context." );
	assert.deepEqual( Sizzle( "+ em", siblingFirst ), q( "siblingnext" ),
		"Element Directly Preceded By with a context." );
	assert.deepEqual( Sizzle( "~ em:first", siblingFirst ), q( "siblingnext" ),
		"Element Preceded By positional with a context." );

	en = document.getElementById( "en" );
	assert.deepEqual( Sizzle( "+ p, a", en ), q( "yahoo", "sap" ),
		"Compound selector with context, beginning with sibling test." );
	assert.deepEqual( Sizzle( "a, + p", en ), q( "yahoo", "sap" ),
		"Compound selector with context, containing sibling test." );

	t( "Multiple combinators selects all levels", "#siblingTest em *",
		[ "siblingchild", "siblinggrandchild", "siblinggreatgrandchild" ] );
	t( "Multiple combinators selects all levels", "#siblingTest > em *",
		[ "siblingchild", "siblinggrandchild", "siblinggreatgrandchild" ] );
	t( "Multiple sibling combinators doesn't miss general siblings",
		"#siblingTest > em:first-child + em ~ span",
		[ "siblingspan" ] );
	t( "Combinators are not skipped when mixing general and specific",
		"#siblingTest > em:contains('x') + em ~ span",
		[] );

	assert.equal( Sizzle( "#listWithTabIndex" ).length, 1,
		"Parent div for next test is found via ID (#8310)" );
	assert.equal( Sizzle( "#listWithTabIndex li:eq(2) ~ li" ).length, 1,
		"Find by general sibling combinator (#8310)" );
	assert.equal( Sizzle( "#__sizzle__" ).length, 0,
		"Make sure the temporary id assigned by sizzle is cleared out (#8310)" );
	assert.equal( Sizzle( "#listWithTabIndex" ).length, 1,
		"Parent div for previous test is still found via ID (#8310)" );

	t( "Verify deep class selector", "div.blah > p > a", [] );

	t( "No element deep selector", "div.foo > span > a", [] );

	nothiddendiv = document.getElementById( "nothiddendiv" );
	assert.deepEqual( Sizzle( "> :first", nothiddendiv ), q( "nothiddendivchild" ),
		"Verify child context positional selector" );
	assert.deepEqual( Sizzle( "> :eq(0)", nothiddendiv ), q( "nothiddendivchild" ),
		"Verify child context positional selector" );
	assert.deepEqual( Sizzle( "> *:first", nothiddendiv ), q( "nothiddendivchild" ),
		"Verify child context positional selector" );

	t( "Non-existant ancestors", ".fototab > .thumbnails > a", [] );
} );

QUnit.test( "attributes - existence", function( assert ) {
	assert.expect( 7 );

	t( "on element", "#qunit-fixture a[title]", [ "google" ] );
	t( "on element (whitespace ignored)", "#qunit-fixture a[ title ]", [ "google" ] );
	t( "on element (case-insensitive)", "#qunit-fixture a[TITLE]", [ "google" ] );
	t( "on any element", "#qunit-fixture *[title]", [ "google" ] );
	t( "on implicit element", "#qunit-fixture [title]", [ "google" ] );
	t( "boolean", "#select2 option[selected]", [ "option2d" ] );
	t( "for attribute on label", "form label[for]", [ "label-for" ] );
} );

QUnit.test( "attributes - equals", function( assert ) {
	assert.expect( 20 );

	t( "identifier", "#qunit-fixture a[rel=bookmark]", [ "simon1" ] );
	t( "identifier containing underscore", "input[id=types_all]", [ "types_all" ] );
	t( "string", "#qunit-fixture a[rel='bookmark']", [ "simon1" ] );
	t( "string (whitespace ignored)", "#qunit-fixture a[ rel = 'bookmark' ]", [ "simon1" ] );
	t( "non-identifier string", "#qunit-fixture a[href='http://www.google.com/']", [ "google" ] );
	t( "empty string", "#select1 option[value='']", [ "option1a" ] );
	t( "number",
		"#qunit-fixture option[value=1]",
		[ "option1b", "option2b", "option3b", "option4b", "option5c" ] );
	t( "negative number", "#qunit-fixture li[tabIndex=-1]", [ "foodWithNegativeTabIndex" ] );
	t( "non-ASCII identifier", "span[lang=中文]", [ "台北" ] );

	t( "input[type=text]", "#form input[type=text]", [ "text1", "text2", "hidden2", "name" ] );
	t( "input[type=search]", "#form input[type=search]", [ "search" ] );
	t( "script[src] (jQuery #13777)", "#moretests script[src]", [ "script-src" ] );
	t( "boolean attribute equals name", "#select2 option[selected='selected']", [ "option2d" ] );
	t( "for attribute in form", "#form [for=action]", [ "label-for" ] );
	t( "name attribute", "input[name='foo[bar]']", [ "hidden2" ] );
	t( "value attribute", "input[value=Test]", [ "text1", "text2" ] );

	assert.deepEqual(
		Sizzle( "input[data-comma='0,1']" ),
		q( "el12087" ),
		"Without context, single-quoted attribute containing ','" );
	assert.deepEqual(
		Sizzle( "input[data-comma=\"0,1\"]" ),
		q( "el12087" ),
		"Without context, double-quoted attribute containing ','" );
	assert.deepEqual(
		Sizzle( "input[data-comma='0,1']", document.getElementById( "t12087" ) ),
		q( "el12087" ),
		"With context, single-quoted attribute containing ','" );
	assert.deepEqual(
		Sizzle( "input[data-comma=\"0,1\"]", document.getElementById( "t12087" ) ),
		q( "el12087" ),
		"With context, double-quoted attribute containing ','" );
} );

QUnit.test( "attributes - does not equal", function( assert ) {
	assert.expect( 2 );

	t( "string", "#ap a[hreflang!='en']", [ "google", "groups", "anchor1" ] );
	t( "empty string", "#select1 option[value!='']", [ "option1b", "option1c", "option1d" ] );
} );

QUnit.test( "attributes - starts with", function( assert ) {
	assert.expect( 4 );

	// Support: IE<8
	// There is apparently no way to bypass interpolation of the *originally-defined* href attribute
	document.getElementById( "anchor2" ).href = "#2";
	t( "string (whitespace ignored)", "a[href ^= 'http://www']", [ "google", "yahoo" ] );
	t( "href starts with hash", "p a[href^='#']", [ "anchor2" ] );
	t( "string containing '['", "input[name^='foo[']", [ "hidden2" ] );
	t( "string containing '[' ... ']'", "input[name^='foo[bar]']", [ "hidden2" ] );
} );

QUnit.test( "attributes - contains", function( assert ) {
	assert.expect( 4 );

	t( "string (whitespace ignored)", "a[href *= 'google']", [ "google", "groups" ] );
	t( "string starting with '[' ... ']'", "input[name*='[bar]']", [ "hidden2" ] );
	t( "string containing '[' ... ']'", "input[name*='foo[bar]']", [ "hidden2" ] );

	t( "href contains hash", "p a[href*='#']", [ "simon1", "anchor2" ] );
} );

QUnit.test( "attributes - ends with", function( assert ) {
	assert.expect( 4 );

	t( "string (whitespace ignored)", "a[href $= 'org/']", [ "mark" ] );
	t( "string ending with ']'", "input[name$='bar]']", [ "hidden2" ] );
	t( "string like '[' ... ']'", "input[name$='[bar]']", [ "hidden2" ] );
	t( "string containing '[' ... ']'", "input[name$='foo[bar]']", [ "hidden2" ] );
} );

QUnit.test( "attributes - whitespace list includes", function( assert ) {
	assert.expect( 3 );

	t( "string found at the beginning",
		"input[data-15233~='foo']",
		[ "t15233-single", "t15233-double", "t15233-double-tab", "t15233-double-nl", "t15233-triple" ] );
	t( "string found in the middle",
		"input[data-15233~='bar']",
		[ "t15233-double", "t15233-double-tab", "t15233-double-nl", "t15233-triple" ] );
	t( "string found at the end", "input[data-15233~='baz']", [ "t15233-triple" ] );
} );

QUnit.test( "attributes - hyphen-prefix matches", function( assert ) {
	assert.expect( 3 );

	t( "string", "#names-group span[id|='name']", [ "name-is-example", "name-is-div" ] );
	t( "string containing hyphen",
		"#names-group span[id|='name-is']",
		[ "name-is-example", "name-is-div" ] );
	t( "string ending with hyphen", "#names-group span[id|='name-is-']", [] );
} );

QUnit.test( "attributes - special characters", function( assert ) {
	assert.expect( 15 );

	var attrbad,
		div = document.createElement( "div" );

	// #3729
	div.innerHTML = "<div id='foo' xml:test='something'></div>";
	assert.deepEqual( Sizzle( "[xml\\:test]", div ),
		[ div.firstChild ],
		"attribute name containing colon" );

	// Make sure attribute value quoting works correctly. See jQuery #6093; #6428; #13894
	// Use seeded results to bypass querySelectorAll optimizations
	attrbad = jQuery(
		"<input type='hidden' id='attrbad_space' name='foo bar'/>" +
		"<input type='hidden' id='attrbad_dot' value='2' name='foo.baz'/>" +
		"<input type='hidden' id='attrbad_brackets' value='2' name='foo[baz]'/>" +
		"<input type='hidden' id='attrbad_leading_digits' name='agent' value='007'/>" +
		"<input type='hidden' id='attrbad_injection' data-attr='foo_baz&#39;]'/>" +
		"<input type='hidden' id='attrbad_quote' data-attr='&#39;'/>" +
		"<input type='hidden' id='attrbad_backslash' data-attr='&#92;'/>" +
		"<input type='hidden' id='attrbad_backslash_quote' data-attr='&#92;&#39;'/>" +
		"<input type='hidden' id='attrbad_backslash_backslash' data-attr='&#92;&#92;'/>" +
		"<input type='hidden' id='attrbad_unicode' data-attr='&#x4e00;'/>"
	).appendTo( "#qunit-fixture" ).get();

	assert.deepEqual( Sizzle( "input[name=foo\\ bar]", null, null, attrbad ),
		q( "attrbad_space" ),
		"identifier containing space" );
	assert.deepEqual( Sizzle( "input[name=foo\\.baz]", null, null, attrbad ),
		q( "attrbad_dot" ),
		"identifier containing dot" );
	assert.deepEqual( Sizzle( "input[name=foo\\[baz\\]]", null, null, attrbad ),
		q( "attrbad_brackets" ),
		"identifier containing brackets" );
	assert.deepEqual( Sizzle( "input[data-attr='foo_baz\\']']", null, null, attrbad ),
		q( "attrbad_injection" ),
		"string containing quote and right bracket" );
	assert.deepEqual( Sizzle( "input[value=\\30 \\30\\37 ]", null, null, attrbad ),
		q( "attrbad_leading_digits" ),
		"identifier containing escaped leading digits with whitespace termination" );
	assert.deepEqual( Sizzle( "input[value=\\00003007]", null, null, attrbad ),
		q( "attrbad_leading_digits" ),
		"identifier containing escaped leading digits without whitespace termination" );

	assert.deepEqual( Sizzle( "input[data-attr='\\'']", null, null, attrbad ),
		q( "attrbad_quote" ),
		"string containing quote" );
	assert.deepEqual( Sizzle( "input[data-attr='\\\\']", null, null, attrbad ),
		q( "attrbad_backslash" ),
		"string containing backslash" );
	assert.deepEqual( Sizzle( "input[data-attr='\\\\\\'']", null, null, attrbad ),
		q( "attrbad_backslash_quote" ),
		"string containing backslash and quote" );
	assert.deepEqual( Sizzle( "input[data-attr='\\\\\\\\']", null, null, attrbad ),
		q( "attrbad_backslash_backslash" ),
		"string containing adjacent backslashes" );

	assert.deepEqual( Sizzle( "input[data-attr='\\5C\\\\']", null, null, attrbad ),
		q( "attrbad_backslash_backslash" ),
		"string containing numeric-escape backslash and backslash" );
	assert.deepEqual( Sizzle( "input[data-attr='\\5C \\\\']", null, null, attrbad ),
		q( "attrbad_backslash_backslash" ),
		"string containing numeric-escape-with-trailing-space backslash and backslash" );
	assert.deepEqual( Sizzle( "input[data-attr='\\5C\t\\\\']", null, null, attrbad ),
		q( "attrbad_backslash_backslash" ),
		"string containing numeric-escape-with-trailing-tab backslash and backslash" );
	assert.deepEqual( Sizzle( "input[data-attr='\\04e00']", null, null, attrbad ),
		q( "attrbad_unicode" ),
		"Long numeric escape (BMP)" );

	document.getElementById( "attrbad_unicode" ).setAttribute( "data-attr", "\uD834\uDF06A" );
	// It was too much code to fix Safari 5.x Supplemental Plane crashes (see ba5f09fa404379a87370ec905ffa47f8ac40aaa3)
	// assert.deepEqual( Sizzle( "input[data-attr='\\01D306A']", null, null, attrbad ),
	// 	q( "attrbad_unicode" ),
	// 	"Long numeric escape (non-BMP)" );
} );

QUnit.test( "attributes - other", function( assert ) {
	assert.expect( 11 );

	var div = document.getElementById( "foo" );

	t( "Selector list with multiple quoted attribute-equals",
		"#form input[type='radio'], #form input[type='hidden']",
		[ "radio1", "radio2", "hidden1" ] );
	t( "Selector list with differently-quoted attribute-equals",
		"#form input[type='radio'], #form input[type=\"hidden\"]",
		[ "radio1", "radio2", "hidden1" ] );
	t( "Selector list with quoted and unquoted attribute-equals",
		"#form input[type='radio'], #form input[type=hidden]",
		[ "radio1", "radio2", "hidden1" ] );

	t( "attribute name is Object.prototype property \"constructor\" (negative)",
		"[constructor]",
		[] );
	t( "attribute name is Gecko Object.prototype property \"watch\" (negative)",
		"[watch]",
		[] );
	div.setAttribute( "constructor", "foo" );
	div.setAttribute( "watch", "bar" );
	t( "attribute name is Object.prototype property \"constructor\"",
		"[constructor='foo']",
		[ "foo" ] );
	t( "attribute name is Gecko Object.prototype property \"watch\"",
		"[watch='bar']",
		[ "foo" ] );
	t( "empty name", "[name='']", [ "name-empty" ] );
	t( "prefixed empty name", "#empty-name-parent [name='']", [ "name-empty" ] );

	var emptyNameContainer = Sizzle( ".empty-name-container" )[ 0 ];
	assert.deepEqual( Sizzle( "[name='']", emptyNameContainer ),
		q( "name-empty" ),
		"empty name with context" );
	assert.deepEqual( Sizzle( "#empty-name-parent [name='']", emptyNameContainer ),
		q( "name-empty" ),
		"prefixed empty name with context" );
} );

QUnit.test( "pseudo - (parent|empty)", function( assert ) {
	assert.expect( 3 );
	t( "Empty", "#qunit-fixture ul:empty", [ "firstUL" ] );
	t( "Empty with comment node", "#qunit-fixture ol:empty", [ "empty" ] );
	t( "Is A Parent", "#qunit-fixture p:parent", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
} );

QUnit.test( "pseudo - (first|last|only)-(child|of-type)", function( assert ) {
	assert.expect( 12 );

	t( "First Child", "#qunit-fixture p:first-child", [ "firstp", "sndp" ] );
	t( "First Child (leading id)", "#qunit-fixture p:first-child", [ "firstp", "sndp" ] );
	t( "First Child (leading class)", ".nothiddendiv div:first-child", [ "nothiddendivchild" ] );
	t( "First Child (case-insensitive)", "#qunit-fixture p:FIRST-CHILD", [ "firstp", "sndp" ] );

	t( "Last Child", "#qunit-fixture p:last-child", [ "sap" ] );
	t( "Last Child (leading id)", "#qunit-fixture a:last-child", [ "simon1", "anchor1", "mark", "yahoo", "anchor2", "simon", "liveLink1", "liveLink2" ] );

	t( "Only Child", "#qunit-fixture a:only-child", [ "simon1", "anchor1", "yahoo", "anchor2", "liveLink1", "liveLink2" ] );

	t( "First-of-type", "#qunit-fixture > p:first-of-type", [ "firstp" ] );
	t( "Last-of-type", "#qunit-fixture > p:last-of-type", [ "first" ] );
	t( "Only-of-type", "#qunit-fixture > :only-of-type", [ "name+value", "firstUL", "empty", "floatTest", "iframe", "table", "last" ] );

	// Verify that the child position isn't being cached improperly
	var secondChildren = jQuery( "p:nth-child(2)" ).before( "<div></div>" );

	t( "No longer second child", "p:nth-child(2)", [] );
	secondChildren.prev().remove();
	t( "Restored second child", "p:nth-child(2)", [ "ap", "en" ] );
} );

QUnit.test( "pseudo - nth-child", function( assert ) {
	assert.expect( 30 );

	t( "Nth-child", "p:nth-child(1)", [ "firstp", "sndp" ] );
	t( "Nth-child (with whitespace)", "p:nth-child( 1 )", [ "firstp", "sndp" ] );
	t( "Nth-child (case-insensitive)", "#form select:first option:NTH-child(3)", [ "option1c" ] );
	t( "Not nth-child", "#qunit-fixture p:not(:nth-child(1))", [ "ap", "en", "sap", "first" ] );

	t( "Nth-child(2)", "#qunit-fixture form#form > *:nth-child(2)", [ "text1" ] );
	t( "Nth-child(2)", "#qunit-fixture form#form > :nth-child(2)", [ "text1" ] );

	t( "Nth-child(-1)", "#form select:first option:nth-child(-1)", [] );
	t( "Nth-child(3)", "#form select:first option:nth-child(3)", [ "option1c" ] );
	t( "Nth-child(0n+3)", "#form select:first option:nth-child(0n+3)", [ "option1c" ] );
	t( "Nth-child(1n+0)", "#form select:first option:nth-child(1n+0)", [ "option1a", "option1b", "option1c", "option1d" ] );
	t( "Nth-child(1n)", "#form select:first option:nth-child(1n)", [ "option1a", "option1b", "option1c", "option1d" ] );
	t( "Nth-child(n)", "#form select:first option:nth-child(n)", [ "option1a", "option1b", "option1c", "option1d" ] );
	t( "Nth-child(even)", "#form select:first option:nth-child(even)", [ "option1b", "option1d" ] );
	t( "Nth-child(odd)", "#form select:first option:nth-child(odd)", [ "option1a", "option1c" ] );
	t( "Nth-child(2n)", "#form select:first option:nth-child(2n)", [ "option1b", "option1d" ] );
	t( "Nth-child(2n+1)", "#form select:first option:nth-child(2n+1)", [ "option1a", "option1c" ] );
	t( "Nth-child(2n + 1)", "#form select:first option:nth-child(2n + 1)", [ "option1a", "option1c" ] );
	t( "Nth-child(+2n + 1)", "#form select:first option:nth-child(+2n + 1)", [ "option1a", "option1c" ] );
	t( "Nth-child(3n)", "#form select:first option:nth-child(3n)", [ "option1c" ] );
	t( "Nth-child(3n+1)", "#form select:first option:nth-child(3n+1)", [ "option1a", "option1d" ] );
	t( "Nth-child(3n+2)", "#form select:first option:nth-child(3n+2)", [ "option1b" ] );
	t( "Nth-child(3n+3)", "#form select:first option:nth-child(3n+3)", [ "option1c" ] );
	t( "Nth-child(3n-1)", "#form select:first option:nth-child(3n-1)", [ "option1b" ] );
	t( "Nth-child(3n-2)", "#form select:first option:nth-child(3n-2)", [ "option1a", "option1d" ] );
	t( "Nth-child(3n-3)", "#form select:first option:nth-child(3n-3)", [ "option1c" ] );
	t( "Nth-child(3n+0)", "#form select:first option:nth-child(3n+0)", [ "option1c" ] );
	t( "Nth-child(-1n+3)", "#form select:first option:nth-child(-1n+3)", [ "option1a", "option1b", "option1c" ] );
	t( "Nth-child(-n+3)", "#form select:first option:nth-child(-n+3)", [ "option1a", "option1b", "option1c" ] );
	t( "Nth-child(-1n + 3)", "#form select:first option:nth-child(-1n + 3)", [ "option1a", "option1b", "option1c" ] );

	assert.deepEqual(
		Sizzle( ":nth-child(n)", null, null, [ document.createElement( "a" ) ].concat( q( "ap" ) ) ),
		q( "ap" ),
		"Seeded nth-child"
	);
} );

QUnit.test( "pseudo - nth-last-child", function( assert ) {
	assert.expect( 30 );

	jQuery( "#qunit-fixture" ).append( "<form id='nth-last-child-form'/><i/><i/><i/><i/>" );
	t( "Nth-last-child", "form:nth-last-child(5)", [ "nth-last-child-form" ] );
	t( "Nth-last-child (with whitespace)", "form:nth-last-child( 5 )", [ "nth-last-child-form" ] );


	t( "Nth-last-child (case-insensitive)", "#form select:first option:NTH-last-child(3)", [ "option1b" ] );
	t( "Not nth-last-child", "#qunit-fixture p:not(:nth-last-child(1))", [ "firstp", "ap", "sndp", "en", "first" ] );

	t( "Nth-last-child(-1)", "#form select:first option:nth-last-child(-1)", [] );
	t( "Nth-last-child(3)", "#form select:first :nth-last-child(3)", [ "option1b" ] );
	t( "Nth-last-child(3)", "#form select:first *:nth-last-child(3)", [ "option1b" ] );
	t( "Nth-last-child(3)", "#form select:first option:nth-last-child(3)", [ "option1b" ] );
	t( "Nth-last-child(0n+3)", "#form select:first option:nth-last-child(0n+3)", [ "option1b" ] );
	t( "Nth-last-child(1n+0)", "#form select:first option:nth-last-child(1n+0)", [ "option1a", "option1b", "option1c", "option1d" ] );
	t( "Nth-last-child(1n)", "#form select:first option:nth-last-child(1n)", [ "option1a", "option1b", "option1c", "option1d" ] );
	t( "Nth-last-child(n)", "#form select:first option:nth-last-child(n)", [ "option1a", "option1b", "option1c", "option1d" ] );
	t( "Nth-last-child(even)", "#form select:first option:nth-last-child(even)", [ "option1a", "option1c" ] );
	t( "Nth-last-child(odd)", "#form select:first option:nth-last-child(odd)", [ "option1b", "option1d" ] );
	t( "Nth-last-child(2n)", "#form select:first option:nth-last-child(2n)", [ "option1a", "option1c" ] );
	t( "Nth-last-child(2n+1)", "#form select:first option:nth-last-child(2n+1)", [ "option1b", "option1d" ] );
	t( "Nth-last-child(2n + 1)", "#form select:first option:nth-last-child(2n + 1)", [ "option1b", "option1d" ] );
	t( "Nth-last-child(+2n + 1)", "#form select:first option:nth-last-child(+2n + 1)", [ "option1b", "option1d" ] );
	t( "Nth-last-child(3n)", "#form select:first option:nth-last-child(3n)", [ "option1b" ] );
	t( "Nth-last-child(3n+1)", "#form select:first option:nth-last-child(3n+1)", [ "option1a", "option1d" ] );
	t( "Nth-last-child(3n+2)", "#form select:first option:nth-last-child(3n+2)", [ "option1c" ] );
	t( "Nth-last-child(3n+3)", "#form select:first option:nth-last-child(3n+3)", [ "option1b" ] );
	t( "Nth-last-child(3n-1)", "#form select:first option:nth-last-child(3n-1)", [ "option1c" ] );
	t( "Nth-last-child(3n-2)", "#form select:first option:nth-last-child(3n-2)", [ "option1a", "option1d" ] );
	t( "Nth-last-child(3n-3)", "#form select:first option:nth-last-child(3n-3)", [ "option1b" ] );
	t( "Nth-last-child(3n+0)", "#form select:first option:nth-last-child(3n+0)", [ "option1b" ] );
	t( "Nth-last-child(-1n+3)", "#form select:first option:nth-last-child(-1n+3)", [ "option1b", "option1c", "option1d" ] );
	t( "Nth-last-child(-n+3)", "#form select:first option:nth-last-child(-n+3)", [ "option1b", "option1c", "option1d" ] );
	t( "Nth-last-child(-1n + 3)", "#form select:first option:nth-last-child(-1n + 3)", [ "option1b", "option1c", "option1d" ] );

	QUnit.deepEqual(
		Sizzle(
			":nth-last-child(n)",
			null,
			null,
			[ document.createElement( "a" ) ].concat( q( "ap" ) )
		),
		q( "ap" ),
		"Seeded nth-last-child"
	);
} );

QUnit.test( "pseudo - nth-of-type", function( assert ) {
	assert.expect( 9 );
	t( "Nth-of-type(-1)", ":nth-of-type(-1)", [] );
	t( "Nth-of-type(3)", "#ap :nth-of-type(3)", [ "mark" ] );
	t( "Nth-of-type(n)", "#ap :nth-of-type(n)", [ "google", "groups", "code1", "anchor1", "mark" ] );
	t( "Nth-of-type(0n+3)", "#ap :nth-of-type(0n+3)", [ "mark" ] );
	t( "Nth-of-type(2n)", "#ap :nth-of-type(2n)", [ "groups" ] );
	t( "Nth-of-type(even)", "#ap :nth-of-type(even)", [ "groups" ] );
	t( "Nth-of-type(2n+1)", "#ap :nth-of-type(2n+1)", [ "google", "code1", "anchor1", "mark" ] );
	t( "Nth-of-type(odd)", "#ap :nth-of-type(odd)", [ "google", "code1", "anchor1", "mark" ] );
	t( "Nth-of-type(-n+2)", "#qunit-fixture > :nth-of-type(-n+2)", [ "firstp", "ap", "foo", "nothiddendiv", "name+value", "firstUL", "empty", "form", "floatTest", "iframe", "lengthtest", "table", "last" ] );
} );

QUnit.test( "pseudo - nth-last-of-type", function( assert ) {
	assert.expect( 9 );
	t( "Nth-last-of-type(-1)", ":nth-last-of-type(-1)", [] );
	t( "Nth-last-of-type(3)", "#ap :nth-last-of-type(3)", [ "google" ] );
	t( "Nth-last-of-type(n)", "#ap :nth-last-of-type(n)", [ "google", "groups", "code1", "anchor1", "mark" ] );
	t( "Nth-last-of-type(0n+3)", "#ap :nth-last-of-type(0n+3)", [ "google" ] );
	t( "Nth-last-of-type(2n)", "#ap :nth-last-of-type(2n)", [ "groups" ] );
	t( "Nth-last-of-type(even)", "#ap :nth-last-of-type(even)", [ "groups" ] );
	t( "Nth-last-of-type(2n+1)", "#ap :nth-last-of-type(2n+1)", [ "google", "code1", "anchor1", "mark" ] );
	t( "Nth-last-of-type(odd)", "#ap :nth-last-of-type(odd)", [ "google", "code1", "anchor1", "mark" ] );
	t( "Nth-last-of-type(-n+2)", "#qunit-fixture > :nth-last-of-type(-n+2)", [ "ap", "name+value", "first", "firstUL", "empty", "floatTest", "iframe", "table", "testForm", "liveHandlerOrder", "disabled-tests", "siblingTest", "last" ] );
} );

QUnit.test( "pseudo - has", function( assert ) {
	assert.expect( 4 );

	t( "Basic test", "p:has(a)", [ "firstp", "ap", "en", "sap" ] );
	t( "Basic test (irrelevant whitespace)", "p:has( a )", [ "firstp", "ap", "en", "sap" ] );
	t( "Nested with overlapping candidates", "#qunit-fixture div:has(div:has(div:not([id])))", [ "moretests", "t2037" ] );

	// Support: Safari 15.4+, Chrome 107+?
	// `qSA` in Safari throws for `:has()` with only unsupported arguments
	// but if you add a supported arg to the list, it will run and just potentially
	// return no results. Make sure this is accounted for.
	t( "Nested with list arguments",
		"#qunit-fixture div:has(faketag, div:has(faketag, div:not([id])))",
		[ "moretests", "t2037" ] );
} );

QUnit.test( "pseudo - contains", function( assert ) {
	assert.expect( 9 );

	var gh335 = document.getElementById( "qunit-fixture" ).appendChild(
			document.createElement( "mark" ) );
	gh335.id = "gh-335";
	gh335.appendChild( document.createTextNode( "raw line 1\nline 2" ) );

	assert.ok( Sizzle( "a:contains('')" ).length, "empty string" );
	t( "unquoted argument", "a:contains(Google)", [ "google", "groups" ] );
	t( "unquoted argument with whitespace", "a:contains(Google Groups)", [ "groups" ] );
	t( "quoted argument with whitespace and parentheses",
		"a:contains('Google Groups (Link)')", [ "groups" ] );
	t( "quoted argument with double quotes and parentheses",
		"a:contains(\"(Link)\")", [ "groups" ] );
	t( "unquoted argument with whitespace and paired parentheses",
		"a:contains(Google Groups (Link))", [ "groups" ] );
	t( "unquoted argument with paired parentheses", "a:contains((Link))", [ "groups" ] );
	t( "quoted argument with CSS escapes",
		"span:contains(\"\\\"'\\53F0 \\5317 Ta\\301 ibe\\30C i\")",
		[ "utf8class1" ] );

	t( "collapsed whitespace", "mark:contains('line 1\\A line')", [ "gh-335" ] );
} );

QUnit.test( "pseudo - misc", function( assert ) {
	assert.expect( 32 );

	var select, tmp, input;

	jQuery( "<h1 id='h1'/><h2 id='h2'/><h2 id='h2-2'/>" ).prependTo( "#qunit-fixture" );
	t( "Headers", "#qunit-fixture :header", [ "h1", "h2", "h2-2" ] );
	t( "Headers(case-insensitive)", "#qunit-fixture :Header", [ "h1", "h2", "h2-2" ] );
	t( "Multiple matches with the same context (cache check)", "#form select:has(option:first-child:contains('o'))", [ "select1", "select2", "select3", "select4" ] );

	assert.ok( Sizzle( "#qunit-fixture :not(:has(:has(*)))" ).length, "All not grandparents" );

	select = document.getElementById( "select1" );
	assert.ok( Sizzle.matchesSelector( select, ":has(option)" ), "Has Option Matches" );

	tmp = document.createElement( "div" );
	tmp.id = "tmp_input";
	document.body.appendChild( tmp );

	jQuery.each( [ "button", "submit", "reset" ], function( i, type ) {
		var els = jQuery(
			"<input id='input_%' type='%'/><button id='button_%' type='%'>test</button>"
			.replace( /%/g, type )
		).appendTo( tmp );

		t( "Input Buttons :" + type, "#tmp_input :" + type, [ "input_" + type, "button_" + type ] );

		assert.ok( Sizzle.matchesSelector( els[ 0 ], ":" + type ), "Input Matches :" + type );
		assert.ok( Sizzle.matchesSelector( els[ 1 ], ":" + type ), "Button Matches :" + type );
	} );

	document.body.removeChild( tmp );

	// Recreate tmp
	tmp = document.createElement( "div" );
	tmp.id = "tmp_input";
	tmp.innerHTML = "<span>Hello I am focusable.</span>";
	// Setting tabIndex should make the element focusable
	// http://dev.w3.org/html5/spec/single-page.html#focus-management
	document.body.appendChild( tmp );
	tmp.tabIndex = 0;
	tmp.focus();
	if ( document.activeElement !== tmp || ( document.hasFocus && !document.hasFocus() ) ||
		( document.querySelectorAll && !document.querySelectorAll( "div:focus" ).length ) ) {
		assert.ok( true, "The div was not focused. Skip checking the :focus match." );
		assert.ok( true, "The div was not focused. Skip checking the :focus match." );
	} else {
		t( "tabIndex element focused", ":focus", [ "tmp_input" ] );
		assert.ok( Sizzle.matchesSelector( tmp, ":focus" ), ":focus matches tabIndex div" );
	}

	// Blur tmp
	tmp.blur();
	document.body.focus();
	assert.ok( !Sizzle.matchesSelector( tmp, ":focus" ), ":focus doesn't match tabIndex div" );
	document.body.removeChild( tmp );

	// Input focus/active
	input = document.createElement( "input" );
	input.type = "text";
	input.id = "focus-input";

	document.body.appendChild( input );
	input.focus();

	// Inputs can't be focused unless the document has focus
	if ( document.activeElement !== input || ( document.hasFocus && !document.hasFocus() ) ||
		( document.querySelectorAll && !document.querySelectorAll( "input:focus" ).length ) ) {
		assert.ok( true, "The input was not focused. Skip checking the :focus match." );
		assert.ok( true, "The input was not focused. Skip checking the :focus match." );
	} else {
		t( "Element focused", "input:focus", [ "focus-input" ] );
		assert.ok( Sizzle.matchesSelector( input, ":focus" ), ":focus matches" );
	}

	input.blur();

	// When IE is out of focus, blur does not work. Force it here.
	if ( document.activeElement === input ) {
		document.body.focus();
	}

	assert.ok( !Sizzle.matchesSelector( input, ":focus" ), ":focus doesn't match" );
	document.body.removeChild( input );


	assert.deepEqual(
		Sizzle( "[id='select1'] *:not(:last-child), [id='select2'] *:not(:last-child)", q( "qunit-fixture" )[ 0 ] ),
		q( "option1a", "option1b", "option1c", "option2a", "option2b", "option2c" ),
		"caching system tolerates recursive selection"
	);

	// Tokenization edge cases
	t( "Sequential pseudos", "#qunit-fixture p:has(:contains(mark)):has(code)", [ "ap" ] );
	t( "Sequential pseudos", "#qunit-fixture p:has(:contains(mark)):has(code):contains(This link)", [ "ap" ] );

	t( "Pseudo argument containing ')'", "p:has(>a.GROUPS[src!=')'])", [ "ap" ] );
	t( "Pseudo argument containing ')'", "p:has(>a.GROUPS[src!=')'])", [ "ap" ] );
	t( "Pseudo followed by token containing ')'", "p:contains(id=\"foo\")[id!=\\)]", [ "sndp" ] );
	t( "Pseudo followed by token containing ')'", "p:contains(id=\"foo\")[id!=')']", [ "sndp" ] );

	t( "Multi-pseudo", "#ap:has(*), #ap:has(*)", [ "ap" ] );
	t( "Multi-positional", "#ap:gt(0), #ap:lt(1)", [ "ap" ] );
	t( "Multi-pseudo with leading nonexistent id", "#nonexistent:has(*), #ap:has(*)", [ "ap" ] );
	t( "Multi-positional with leading nonexistent id", "#nonexistent:gt(0), #ap:lt(1)", [ "ap" ] );

	t( "Tokenization stressor", "a[class*=blog]:not(:has(*, :contains(!)), :contains(!)), br:contains(]), p:contains(]), :not(:empty):not(:parent)", [ "ap", "mark", "yahoo", "simon" ] );
} );


QUnit.test( "pseudo - :not", function( assert ) {
	assert.expect( 43 );

	t( "Not", "a.blog:not(.link)", [ "mark" ] );
	t( ":not() with :first", "#foo p:not(:first) .link", [ "simon" ] );

	t( "Not - multiple", "#form option:not(:contains(Nothing),#option1b,:selected)", [ "option1c", "option1d", "option2b", "option2c", "option3d", "option3e", "option4e", "option5b", "option5c" ] );
	t( "Not - recursive", "#form option:not(:not(:selected))[id^='option3']", [ "option3b", "option3c" ] );

	t( ":not() failing interior", "#qunit-fixture p:not(.foo)", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( ":not() failing interior", "#qunit-fixture p:not(div.foo)", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( ":not() failing interior", "#qunit-fixture p:not(p.foo)", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( ":not() failing interior", "#qunit-fixture p:not(#blargh)", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( ":not() failing interior", "#qunit-fixture p:not(div#blargh)", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( ":not() failing interior", "#qunit-fixture p:not(p#blargh)", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );

	t( ":not Multiple", "#qunit-fixture p:not(a)", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( ":not Multiple", "#qunit-fixture p:not( a )", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( ":not Multiple", "#qunit-fixture p:not( p )", [] );
	t( ":not Multiple", "#qunit-fixture p:not(a, b)", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( ":not Multiple", "#qunit-fixture p:not(a, b, div)", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );
	t( ":not Multiple", "p:not(p)", [] );
	t( ":not Multiple", "p:not(a,p)", [] );
	t( ":not Multiple", "p:not(p,a)", [] );
	t( ":not Multiple", "p:not(a,p,b)", [] );
	t( ":not Multiple", ":input:not(:image,:input,:submit)", [] );
	t( ":not Multiple", "#qunit-fixture p:not(:has(a), :nth-child(1))", [ "first" ] );

	t( "No element not selector", ".container div:not(.excluded) div", [] );

	t( ":not() Existing attribute", "#form select:not([multiple])", [ "select1", "select2", "select5" ] );
	t( ":not() Equals attribute", "#form select:not([name=select1])", [ "select2", "select3", "select4", "select5" ] );
	t( ":not() Equals quoted attribute", "#form select:not([name='select1'])", [ "select2", "select3", "select4", "select5" ] );

	t( ":not() Multiple Class", "#foo a:not(.blog)", [ "yahoo", "anchor2" ] );
	t( ":not() Multiple Class", "#foo a:not(.link)", [ "yahoo", "anchor2" ] );
	t( ":not() Multiple Class", "#foo a:not(.blog.link)", [ "yahoo", "anchor2" ] );

	t( ":not chaining (compound)", "#qunit-fixture div[id]:not(:has(div, span)):not(:has(*))", [ "nothiddendivchild", "divWithNoTabIndex" ] );
	t( ":not chaining (with attribute)", "#qunit-fixture form[id]:not([action$='formaction']):not(:button)", [ "lengthtest", "name-tests", "testForm", "disabled-tests" ] );
	t( ":not chaining (colon in attribute)", "#qunit-fixture form[id]:not([action='form:action']):not(:button)", [ "form", "lengthtest", "name-tests", "testForm", "disabled-tests" ] );
	t( ":not chaining (colon in attribute and nested chaining)", "#qunit-fixture form[id]:not([action='form:action']:button):not(:input)", [ "form", "lengthtest", "name-tests", "testForm", "disabled-tests" ] );
	t( ":not chaining", "#form select:not(.select1):contains(Nothing) > option:not(option)", [] );

	t( "positional :not()", "#foo p:not(:last)", [ "sndp", "en" ] );
	t( "positional :not() prefix", "#foo p:not(:last) a", [ "yahoo" ] );
	t( "compound positional :not()", "#foo p:not(:first, :last)", [ "en" ] );
	t( "compound positional :not()", "#foo p:not(:first, :even)", [ "en" ] );
	t( "compound positional :not()", "#foo p:not(:first, :odd)", [ "sap" ] );
	t( "reordered compound positional :not()", "#foo p:not(:odd, :first)", [ "sap" ] );

	t( "positional :not() with pre-filter", "#foo p:not([id]:first)", [ "en", "sap" ] );
	t( "positional :not() with post-filter", "#foo p:not(:first[id])", [ "en", "sap" ] );
	t( "positional :not() with pre-filter", "#foo p:not([lang]:first)", [ "sndp", "sap" ] );
	t( "positional :not() with post-filter", "#foo p:not(:first[lang])", [ "sndp", "en", "sap" ] );
} );

QUnit.test( "pseudo - position", function( assert ) {
	assert.expect( 34 );

	t( "First element", "#qunit-fixture p:first", [ "firstp" ] );
	t( "First element(case-insensitive)", "#qunit-fixture p:fiRst", [ "firstp" ] );
	t( "nth Element", "#qunit-fixture p:nth(1)", [ "ap" ] );
	t( "First Element", "#qunit-fixture p:first", [ "firstp" ] );
	t( "Last Element", "p:last", [ "first" ] );
	t( "Even Elements", "#qunit-fixture p:even", [ "firstp", "sndp", "sap" ] );
	t( "Odd Elements", "#qunit-fixture p:odd", [ "ap", "en", "first" ] );
	t( "Position Equals", "#qunit-fixture p:eq(1)", [ "ap" ] );
	t( "Position Equals (negative)", "#qunit-fixture p:eq(-1)", [ "first" ] );
	t( "Position Greater Than", "#qunit-fixture p:gt(0)", [ "ap", "sndp", "en", "sap", "first" ] );
	t( "Position Less Than", "#qunit-fixture p:lt(3)", [ "firstp", "ap", "sndp" ] );
	t( "Position Less Than Big Number", "#qunit-fixture p:lt(9007199254740991)", [ "firstp", "ap", "sndp", "en", "sap", "first" ] );

	t( "Check position filtering", "div#nothiddendiv:eq(0)", [ "nothiddendiv" ] );
	t( "Check position filtering", "div#nothiddendiv:last", [ "nothiddendiv" ] );
	t( "Check position filtering", "div#nothiddendiv:not(:gt(0))", [ "nothiddendiv" ] );
	t( "Check position filtering", "#foo > :not(:first)", [ "en", "sap" ] );
	t( "Check position filtering", "#qunit-fixture select > :not(:gt(2))", [ "option1a", "option1b", "option1c" ] );
	t( "Check position filtering", "#qunit-fixture select:lt(2) :not(:first)", [ "option1b", "option1c", "option1d", "option2a", "option2b", "option2c", "option2d" ] );
	t( "Check position filtering", "div.nothiddendiv:eq(0)", [ "nothiddendiv" ] );
	t( "Check position filtering", "div.nothiddendiv:last", [ "nothiddendiv" ] );
	t( "Check position filtering", "div.nothiddendiv:not(:lt(0))", [ "nothiddendiv" ] );

	t( "Check element position", "#qunit-fixture div div:eq(0)", [ "nothiddendivchild" ] );
	t( "Check element position", "#select1 option:eq(3)", [ "option1d" ] );
	t( "Check element position", "#qunit-fixture div div:eq(10)", [ "no-clone-exception" ] );
	t( "Check element position", "#qunit-fixture div div:first", [ "nothiddendivchild" ] );
	t( "Check element position", "#qunit-fixture div > div:first", [ "nothiddendivchild" ] );
	t( "Check element position", "#qunit-fixture div:first a:first", [ "yahoo" ] );
	t( "Check element position", "#qunit-fixture div:first > p:first", [ "sndp" ] );
	t( "Check element position", "div#nothiddendiv:first > div:first", [ "nothiddendivchild" ] );
	t( "Chained pseudo after a pos pseudo", "#listWithTabIndex li:eq(0):contains(Rice)", [ "foodWithNegativeTabIndex" ] );

	t( "Check sort order with POS and comma", "#qunit-fixture em>em>em>em:first-child,div>em:first", [ "siblingfirst", "siblinggreatgrandchild" ] );

	t( "Isolated position", "#qunit-fixture :last", [ "last" ] );

	assert.deepEqual( Sizzle( "*:lt(2) + *", null, [], Sizzle( "#qunit-fixture > p" ) ), q( "ap" ),
		"Seeded pos with trailing relative" );

	// jQuery #12526
	var context = jQuery( "#qunit-fixture" ).append( "<div id='jquery12526'></div>" )[ 0 ];
	assert.deepEqual( Sizzle( ":last", context ), q( "jquery12526" ),
		"Post-manipulation positional" );
} );

QUnit.test( "pseudo - form", function( assert ) {
	assert.expect( 10 );

	var extraTexts = jQuery( "<input id=\"impliedText\"/><input id=\"capitalText\" type=\"TEXT\">" ).appendTo( "#form" );

	t( "Form element :input", "#form :input", [ "text1", "text2", "radio1", "radio2", "check1", "check2", "hidden1", "hidden2", "name", "search", "button", "area1", "select1", "select2", "select3", "select4", "select5", "impliedText", "capitalText" ] );
	t( "Form element :radio", "#form :radio", [ "radio1", "radio2" ] );
	t( "Form element :checkbox", "#form :checkbox", [ "check1", "check2" ] );
	t( "Form element :text", "#form :text", [ "text1", "text2", "hidden2", "name", "impliedText", "capitalText" ] );
	t( "Form element :radio:checked", "#form :radio:checked", [ "radio2" ] );
	t( "Form element :checkbox:checked", "#form :checkbox:checked", [ "check1" ] );
	t( "Form element :radio:checked, :checkbox:checked", "#form :radio:checked, #form :checkbox:checked", [ "radio2", "check1" ] );

	t( "Selected option element",
		"#form option:selected",
		[ "option1a", "option2d", "option3b", "option3c", "option4b", "option4c", "option4d",
			"option5a" ] );
	t( "Selected option elements are also :checked", "#form option:checked",
		[ "option1a", "option2d", "option3b", "option3c", "option4b", "option4c", "option4d",
			"option5a" ] );
	t( "Hidden inputs are still :enabled",
		"#hidden1:enabled",
		[ "hidden1" ] );

	extraTexts.remove();
} );

QUnit.test( "pseudo - :(dis|en)abled, explicitly disabled", function( assert ) {
	assert.expect( 2 );

	// Set a meaningless disabled property on a common ancestor
	var container = document.getElementById( "disabled-tests" );
	container.disabled = true;

	// Support: IE 6 - 11
	// Unset the property where it is not meaningless
	if ( document.getElementById( "enabled-input" ).isDisabled ) {
		container.disabled = undefined;
	}

	t(
		"Explicitly disabled elements",
		"#enabled-fieldset :disabled",
		[ "disabled-input", "disabled-textarea", "disabled-button",
			"disabled-select", "disabled-optgroup", "disabled-option" ]
	);

	t(
		"Enabled elements",
		"#enabled-fieldset :enabled",
		[ "enabled-input", "enabled-textarea", "enabled-button",
			"enabled-select", "enabled-optgroup", "enabled-option" ]
	);
} );

QUnit.test( "pseudo - :(dis|en)abled, optgroup and option", function( assert ) {
	assert.expect( 2 );

	t(
		":disabled",
		"#disabled-select-inherit :disabled, #enabled-select-inherit :disabled",
		[ "disabled-optgroup-inherit", "disabled-optgroup-option", "en_disabled-optgroup-inherit",
			"en_disabled-optgroup-option" ]
	);

	t(
		":enabled",
		"#disabled-select-inherit :enabled, #enabled-select-inherit :enabled",
		[ "enabled-optgroup-inherit", "enabled-optgroup-option", "enabled-select-option" ]
	);
} );

// Support: PhantomJS
// fieldsetElement.disabled is undefined
if ( jQuery( "<fieldset disabled='disabled'/>" )[ 0 ].disabled ) {
	QUnit.test( "pseudo - fieldset:(dis|en)abled", function() {
		t( "Disabled fieldset", "fieldset:disabled", [ "disabled-fieldset" ] );
		t( "Enabled fieldset", "fieldset:enabled", [ "enabled-fieldset" ] );
	} );

	QUnit.test( "pseudo - :disabled by ancestry", function( assert ) {
		assert.expect( 1 );

		// Don't test for presence of select
		// IE6 doesn't visibly or functionally disable them when the fieldset is disabled
		t(
			"Inputs inherit disabled from fieldset",
			"#disabled-fieldset :disabled",
			[ "disabled-fieldset-input", "disabled-fieldset-textarea",
				"disabled-fieldset-button" ]
		);
	} );
}

QUnit.test( "pseudo - :target and :root", function( assert ) {
	assert.expect( 2 );

	// Target
	var oldHash,
	$link = jQuery( "<a/>" ).attr( {
		href: "#",
		id: "new-link"
	} ).appendTo( "#qunit-fixture" );

	oldHash = window.location.hash;
	window.location.hash = "new-link";

	t( ":target", ":target", [ "new-link" ] );

	$link.remove();
	window.location.hash = oldHash;

	// Root
	assert.equal( Sizzle( ":root" )[ 0 ], document.documentElement, ":root selector" );
} );

QUnit.test( "pseudo - :lang", function( assert ) {
	assert.expect( 105 );

	var docElem = document.documentElement,
		docXmlLang = docElem.getAttribute( "xml:lang" ),
		docLang = docElem.lang,
		foo = document.getElementById( "foo" ),
		anchor = document.getElementById( "anchor2" ),
		xml = createWithFriesXML(),
		testLang = function( text, elem, container, lang, extra ) {
			var message,
				full = lang + "-" + extra;

			message = "lang=" + lang + " " + text;
			container.setAttribute( container.ownerDocument.documentElement.nodeName === "HTML" ? "lang" : "xml:lang", lang );
			assertMatch( message, elem, ":lang(" + lang + ")" );
			assertMatch( message, elem, ":lang(" + mixCase( lang ) + ")" );
			assertNoMatch( message, elem, ":lang(" + full + ")" );
			assertNoMatch( message, elem, ":lang(" + mixCase( full ) + ")" );
			assertNoMatch( message, elem, ":lang(" + lang + "-)" );
			assertNoMatch( message, elem, ":lang(" + full + "-)" );
			assertNoMatch( message, elem, ":lang(" + lang + "glish)" );
			assertNoMatch( message, elem, ":lang(" + full + "glish)" );

			message = "lang=" + full + " " + text;
			container.setAttribute( container.ownerDocument.documentElement.nodeName === "HTML" ? "lang" : "xml:lang", full );
			assertMatch( message, elem, ":lang(" + lang + ")" );
			assertMatch( message, elem, ":lang(" + mixCase( lang ) + ")" );
			assertMatch( message, elem, ":lang(" + full + ")" );
			assertMatch( message, elem, ":lang(" + mixCase( full ) + ")" );
			assertNoMatch( message, elem, ":lang(" + lang + "-)" );
			assertNoMatch( message, elem, ":lang(" + full + "-)" );
			assertNoMatch( message, elem, ":lang(" + lang + "glish)" );
			assertNoMatch( message, elem, ":lang(" + full + "glish)" );
		},
		mixCase = function( str ) {
			var ret = str.split( "" ),
				i = ret.length;
			while ( i-- ) {
				if ( i & 1 ) {
					ret[ i ] = ret[ i ].toUpperCase();
				}
			}
			return ret.join( "" );
		},
		assertMatch = function( text, elem, selector ) {
			assert.ok( Sizzle.matchesSelector( elem, selector ), text + " match " + selector );
		},
		assertNoMatch = function( text, elem, selector ) {
			assert.ok( !Sizzle.matchesSelector( elem, selector ), text + " fail " + selector );
		};

	// Prefixing and inheritance
	assert.ok( Sizzle.matchesSelector( docElem, ":lang(" + docElem.lang + ")" ), "starting :lang" );
	testLang( "document", anchor, docElem, "en", "us" );
	testLang( "grandparent", anchor, anchor.parentNode.parentNode, "yue", "hk" );
	assert.ok( !Sizzle.matchesSelector( anchor, ":lang(en), :lang(en-us)" ),
		":lang does not look above an ancestor with specified lang" );
	testLang( "self", anchor, anchor, "es", "419" );
	assert.ok(
		!Sizzle.matchesSelector( anchor, ":lang(en), :lang(en-us), :lang(yue), :lang(yue-hk)" ),
		":lang does not look above self with specified lang"
	);

	// Searching by language tag
	anchor.parentNode.parentNode.lang = "arab";
	anchor.parentNode.lang = anchor.parentNode.id = "ara-sa";
	anchor.lang = "ara";
	assert.deepEqual( Sizzle( ":lang(ara)", foo ), [ anchor.parentNode, anchor ], "Find by :lang" );

	// Selector validity
	anchor.parentNode.lang = "ara";
	anchor.lang = "ara\\b";
	assert.deepEqual( Sizzle( ":lang(ara\\b)", foo ), [], ":lang respects backslashes" );
	assert.deepEqual( Sizzle( ":lang(ara\\\\b)", foo ), [ anchor ],
		":lang respects escaped backslashes" );
	assert.throws( function() {
		Sizzle.call( null, "#qunit-fixture:lang(c++)" );
	}, function( e ) {
		return e.message.indexOf( "Syntax error" ) >= 0;
	}, ":lang value must be a valid identifier" );

	// XML
	foo = jQuery( "response", xml )[ 0 ];
	anchor = jQuery( "#seite1", xml )[ 0 ];
	testLang( "XML document", anchor, xml.documentElement, "en", "us" );
	testLang( "XML grandparent", anchor, foo, "yue", "hk" );
	assert.ok( !Sizzle.matchesSelector( anchor, ":lang(en), :lang(en-us)" ),
		"XML :lang does not look above an ancestor with specified lang" );
	testLang( "XML self", anchor, anchor, "es", "419" );
	assert.ok(
		!Sizzle.matchesSelector( anchor, ":lang(en), :lang(en-us), :lang(yue), :lang(yue-hk)" ),
		"XML :lang does not look above self with specified lang" );

	// Cleanup
	if ( docXmlLang == null ) {
		docElem.removeAttribute( "xml:lang" );
	} else {
		docElem.setAttribute( "xml:lang", docXmlLang );
	}
	docElem.lang = docLang;
} );

QUnit.test( "context", function( assert ) {
	assert.expect( 21 );

	var context,
		selector = ".blog",
		expected = q( "mark", "simon" ),
		iframe = document.getElementById( "iframe" ),
		iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

	assert.deepEqual( Sizzle( selector, document ), expected, "explicit document context" );
	assert.deepEqual( Sizzle( selector ), expected, "unspecified context becomes document" );
	assert.deepEqual( Sizzle( selector, undefined ), expected,
		"undefined context becomes document" );
	assert.deepEqual( Sizzle( selector, null ), expected, "null context becomes document" );

	iframeDoc.open();
	iframeDoc.write( "<body><p id='foo'>bar</p></body>" );
	iframeDoc.close();
	expected = [ iframeDoc.getElementById( "foo" ) ];
	assert.deepEqual( Sizzle( "p", iframeDoc ), expected, "Other document context (simple)" );
	assert.deepEqual( Sizzle( "p:contains(ar)", iframeDoc ), expected,
		"Other document context (complex)" );
	assert.deepEqual( Sizzle( "span", iframeDoc ), [],
		"Other document context (simple, no results)" );
	assert.deepEqual( Sizzle( "* span", iframeDoc ), [],
		"Other document context (complex, no results)" );

	context = document.getElementById( "nothiddendiv" );
	assert.deepEqual( Sizzle( "*", context ), q( "nothiddendivchild" ), "<div> context" );
	assert.deepEqual( Sizzle( "* > *", context ), [], "<div> context (no results)" );

	context.removeAttribute( "id" );
	assert.deepEqual( Sizzle( "*", context ), q( "nothiddendivchild" ), "no-id element context" );
	assert.deepEqual( Sizzle( "* > *", context ), [], "no-id element context (no results)" );

	// Support: IE<8 only
	// ID attroperty is never really gone
	assert.strictEqual( context.getAttribute( "id" ) || "", "", "id not added by no-id selection" );

	context = document.getElementById( "lengthtest" );
	assert.deepEqual( Sizzle( "input", context ), q( "length", "idTest" ), "<form> context" );
	assert.deepEqual( Sizzle( "select", context ), [], "<form> context (no results)" );

	context = document.getElementById( "台北Táiběi" );
	expected = q( "台北Táiběi-child" );
	assert.deepEqual( Sizzle( "span[id]", context ), expected, "context with non-ASCII id" );
	assert.deepEqual( Sizzle( "#台北Táiběi span[id]", context.parentNode ), expected,
		"context with non-ASCII id selector prefix" );

	context = document.createDocumentFragment();
	// Capture *independent* expected nodes before they're detached from the page
	expected = q( "siblingnext", "siblingspan" );
	context.appendChild( document.getElementById( "siblingTest" ) );
	assert.deepEqual(
		Sizzle( "em:nth-child(2)", context ),
		expected.slice( 0, 1 ),
		"DocumentFragment context"
	);
	assert.deepEqual( Sizzle( "span", context ), expected.slice( 1 ),
		"DocumentFragment context by tag name" );
	assert.deepEqual( Sizzle( "p", context ), [], "DocumentFragment context (no results)" );

	assert.deepEqual(
		Sizzle( "em + :not(:has(*)):not(:empty), foo", context.firstChild ),
		expected.slice( 0, 1 ),
		"Non-qSA path correctly sets detached context for sibling selectors (jQuery #14351)"
	);
} );

( function() {
    var scopeSupport;
	try {
		document.querySelectorAll( ":scope" );
		scopeSupport = true;
	} catch ( e ) {
		scopeSupport = false;
	}

	// Support: IE 6 - 11+, Edge 12 - 18+, Chrome <=25 only, Safari <=6 only, Firefox <=13 only, Opera <=12 only
	// Older browsers don't support the :scope pseudo-class so they may trigger MutationObservers.
	// The test is skipped there.
	QUnit[ scopeSupport && window.MutationObserver ? "test" : "skip" ](
		"selectors maintaining context don't trigger mutation observers", function( assert ) {
		assert.expect( 1 );

		var timeout,
			done = assert.async(),
			elem = document.createElement( "div" );

		elem.innerHTML = "<div></div>";

		var observer = new MutationObserver(  function() {
			clearTimeout( timeout );
			observer.disconnect();
			assert.ok( false, "Mutation observer fired during selection" );
			done();
		} );
		observer.observe( elem, { attributes: true } );

		Sizzle( "div div", elem );

		timeout = setTimeout( function() {
			observer.disconnect();
			assert.ok( true, "Mutation observer didn't fire during selection" );
			done();
		} );
	} );
} )();

QUnit.test( "caching", function( assert ) {
	assert.expect( 3 );

	var sap = document.getElementById( "sap" );

	Sizzle( ":not(code)", document.getElementById( "ap" ) );
	assert.deepEqual(
		Sizzle( ":not(code)", document.getElementById( "foo" ) ),
		q( "sndp", "en", "yahoo", "sap", "anchor2", "simon" ),
		"Reusing selector with new context"
	);

	t( "Deep ancestry caching in post-positional element matcher (jQuery #14657)",
		"#qunit-fixture a:lt(3):parent",
		[ "simon1", "google", "groups" ] );

	sap.className = "original";
	Sizzle( "#qunit-fixture:noQSA .original" );
	document.getElementById( "nothiddendiv" ).appendChild(
		sap.cloneNode( true ) ).className = "clone";
	assert.equal( Sizzle( "#qunit-fixture:noQSA .clone [href*='2']" ).length, 1,
		"Cloning does not poison caches" );
} );

QUnit.test( "Iframe dispatch should not affect Sizzle, see jQuery #13936", 1, function( assert ) {
	var done = assert.async(),
		loaded = false,
		thrown = false,
		iframe = document.getElementById( "iframe" ),
		iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

	jQuery( iframe ).on( "load", function() {
		var form;

		try {
			iframeDoc = this.contentDocument || this.contentWindow.document;
			form = Sizzle( "#navigate", iframeDoc )[ 0 ];
		} catch ( e ) {
			thrown = e;
		}

		if ( loaded ) {
			assert.strictEqual( thrown, false, "No error thrown from post-reload Sizzle call" );
			done();
		} else {
			loaded = true;
			form.submit();
		}
	} );

	iframeDoc.open();
	iframeDoc.write( "<body><form id='navigate' action='?'></form></body>" );
	iframeDoc.close();
} );

QUnit.test( "matchesSelector", function( assert ) {
	assert.expect( 15 );

	var link = document.getElementById( "simon1" ),
		input = document.getElementById( "text1" ),
		option = document.getElementById( "option1a" ),
		disconnected = document.createElement( "div" );

	link.title = "Don't click me";
	assert.ok( Sizzle.matchesSelector( link, "[rel='bookmark']" ), "attribute-equals string" );
	assert.ok( Sizzle.matchesSelector( link, "[rel=bookmark]" ), "attribute-equals identifier" );
	assert.ok( Sizzle.matchesSelector( link, "[\nrel = bookmark\t]" ),
		"attribute-equals identifier (whitespace ignored)" );
	assert.ok( Sizzle.matchesSelector( link, "a[title=\"Don't click me\"]" ),
		"attribute-equals string containing single quote" );

	// jQuery #12303
	input.setAttribute( "data-pos", ":first" );
	assert.ok( Sizzle.matchesSelector( input, "input[data-pos=\\:first]" ),
		"attribute-equals POS in identifier" );
	assert.ok( Sizzle.matchesSelector( input, "input[data-pos=':first']" ),
		"attribute-equals POS in string" );
	assert.ok( Sizzle.matchesSelector( input, ":input[data-pos=':first']" ),
		"attribute-equals POS in string after pseudo" );

	option.setAttribute( "test", "" );
	assert.ok( Sizzle.matchesSelector( option, "[id=option1a]" ),
		"id attribute-equals identifier" );
	assert.ok( Sizzle.matchesSelector( option, "[id*=option1][type!=checkbox]" ),
		"attribute-not-equals identifier" );
	assert.ok( Sizzle.matchesSelector( option, "[id*=option1]" ), "attribute-contains identifier" );
	assert.ok( !Sizzle.matchesSelector( option, "[test^='']" ),
		"attribute-starts-with empty string (negative)" );

	option.className = "=]";
	assert.ok( Sizzle.matchesSelector( option, ".\\=\\]" ),
		"class selector with attribute-equals confusable" );

	assert.ok( Sizzle.matchesSelector( disconnected, "div" ), "disconnected element" );
	assert.ok( Sizzle.matchesSelector( link, "* > *" ), "child combinator matches in document" );
	assert.ok( !Sizzle.matchesSelector( disconnected, "* > *" ), "child combinator fails in fragment" );
} );

QUnit.test( "matches", function( assert ) {
	assert.expect( 4 );

	var iframeChild,
		input = document.getElementById( "text1" ),
		div = document.createElement( "div" ),
		iframe = document.getElementById( "iframe" ),
		iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

	assert.deepEqual( Sizzle.matches( "input", [ input ] ), [ input ],
		"Sizzle.matches with seed of input element" );
	assert.deepEqual( Sizzle.matches( "div", [ div ] ), [ div ],
		"Sizzle.matches with disconnected element" );

	iframeDoc.open();
	iframeDoc.write( "<body><div id='foo'><div id='bar'></div></div></body>" );
	iframeDoc.close();

	iframeChild = iframeDoc.getElementById( "bar" );

	assert.deepEqual(
		Sizzle.matches( ":root > body > #foo > #bar", [ iframeChild ] ),
		[ iframeChild ],
		"Sizzle.matches infers context from element"
	);

	assert.deepEqual(
		Sizzle.matches( ":root *", [ div, iframeChild, input ] ),
		[ iframeChild, input ],
		"Sizzle.matches infers context from each seed element"
	);
} );

QUnit.test( "select() with pre-compiled function", function( assert ) {
	assert.expect( 6 );

	jQuery.each( [ "#qunit-fixture #first", "ol#listWithTabIndex > li[tabindex]", "#liveSpan1" ],
	function( i, selector ) {
		var compiled = Sizzle.compile( selector );
		assert.equal( Sizzle.select( compiled, document ).length, 1,
			"Should match using a compiled selector function" );
		assert.equal( Sizzle.select( compiled, Sizzle( "#first" )[ 0 ] ).length, 0,
			"Should not match with different context" );
	} );
} );

QUnit[ document.body.attachShadow && document.body.getRootNode ? "test" : "skip" ](
	"Sizzle supports shadow DOM nodes as root", function( assert ) {
	assert.expect( 2 );

	var shadowHost = jQuery( "<div/>" ).appendTo( "#qunit-fixture" )[ 0 ],
		shadowRoot = shadowHost.attachShadow( { mode: "open" } );

	shadowRoot.innerHTML = "<div class='vagabond'><p></p></div>";
	assert.equal( Sizzle( ".vagabond", shadowRoot ).length, 1,
		"Selection by class with shadow root" );
	assert.equal( Sizzle( "p", shadowRoot ).length, 1,
		"Paragraph element selected from shadow root" );
} );
