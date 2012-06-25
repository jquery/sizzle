module("utilities", { teardown: moduleTeardown });

test("contains", function() {
	expect(15);
	QUnit.reset();

	var container = document.getElementById("nonnodes"),
		element = container.firstChild,
		text = element.nextSibling,
		nonContained = container.nextSibling,
		detached = document.createElement("a");
	ok( element && element.nodeType === 1, "preliminary: found element" );
	ok( text && text.nodeType === 3, "preliminary: found text" );
	ok( nonContained, "preliminary: found non-descendant" );
	ok( window.Sizzle.contains(container, element), "child" );
	ok( window.Sizzle.contains(container.parentNode, element), "grandchild" );
	ok( window.Sizzle.contains(container, text), "text child" );
	ok( window.Sizzle.contains(container.parentNode, text), "text grandchild" );
	ok( !window.Sizzle.contains(container, container), "self" );
	ok( !window.Sizzle.contains(element, container), "parent" );
	ok( !window.Sizzle.contains(container, nonContained), "non-descendant" );
	ok( !window.Sizzle.contains(container, document), "document" );
	ok( !window.Sizzle.contains(container, document.documentElement), "documentElement (negative)" );
	ok( window.Sizzle.contains(document, document.documentElement), "documentElement (positive)" );
	ok( window.Sizzle.contains(document, element), "document container (positive)" );
	ok( !window.Sizzle.contains(document, detached), "document container (negative)" );
});
