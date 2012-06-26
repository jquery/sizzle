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

module("selector", { teardown: moduleTeardown });

test("Sizzle.contains", function() {
	expect(15);

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
	ok( Sizzle.contains(document, document.documentElement), "documentElement (positive)" );
	ok( Sizzle.contains(document, element), "document container (positive)" );
	ok( !Sizzle.contains(document, detached), "document container (negative)" );
});
