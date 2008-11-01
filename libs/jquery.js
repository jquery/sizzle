jQuery.find = Sizzle;
jQuery.filter = Sizzle.filter;

Sizzle.selectors.filters.hidden = function(elem){
	return "hidden" === elem.type ||
		jQuery.css(elem, "display") === "none" ||
		jQuery.css(elem, "visibility") === "hidden";
};

Sizzle.selectors.filters.visible = function(elem){
	return "hidden" !== elem.type &&
		jQuery.css(elem, "display") !== "none" &&
		jQuery.css(elem, "visibility") !== "hidden";
};

jQuery.multiFilter = function( expr, elems, not ) {
	if ( not ) {
		return jQuery.multiFilter( ":not(" + expr + ")", elems );
	}

	var exprs = expr.split(/\s*,\s*/), cur = [];

	for ( var i = 0; i < exprs.length; i++ ) {
		cur = jQuery.merge( cur, jQuery.filter( exprs[i], elems ) );
	}

	return cur;
};

jQuery.dir = function( elem, dir ){
	var matched = [], cur = elem[dir];
	while ( cur && cur != document ) {
		if ( cur.nodeType == 1 )
			matched.push( cur );
		cur = cur[dir];
	}
	return matched;
};

jQuery.nth = function(cur, result, dir, elem){
	result = result || 1;
	var num = 0;

	for ( ; cur; cur = cur[dir] )
		if ( cur.nodeType == 1 && ++num == result )
			break;

	return cur;
};

jQuery.sibling = function(n, elem){
	var r = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType == 1 && n != elem )
			r.push( n );
	}

	return r;
};

return;
