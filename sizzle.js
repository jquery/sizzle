/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2012, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function( window, undefined ) {

var document = window.document,
	docElem = document.documentElement,

	expando = "sizcache" + (Math.random() + "").replace(".", ""),
	done = 0,

	toString = Object.prototype.toString,
	concat = Array.prototype.concat,
	strundefined = "undefined",

	hasDuplicate = false,
	baseHasDuplicate = true,

	// Regex
	rquickExpr = /^#([\w\-]+$)|^(\w+$)|^\.([\w\-]+$)/,
	rquickMatch = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,
	chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,

	rsibling = /^[+~]$/,
	rbackslash = /\\(?!\\)/g,
	rnonWord = /\W/,
	rstartsWithWord = /^\w/,
	rnonDigit = /\D/,
	rnth = /(-?)(\d*)(?:n([+\-]?\d*))?/,
	radjacent = /^\+|\s*/g,
	rheader = /h\d/i,
	rinputs = /input|select|textarea|button/i,
	rtnfr = /[\t\n\f\r]/g,

	characterEncoding = "(?:[-\\w]|[^\\x00-\\xa0]|\\\\.)",
	matchExpr = {
		ID: new RegExp("#(" + characterEncoding + "+)"),
		CLASS: new RegExp("\\.(" + characterEncoding + "+)"),
		NAME: new RegExp("\\[name=['\"]*(" + characterEncoding + "+)['\"]*\\]"),
		TAG: new RegExp("^(" + characterEncoding.replace( "[-", "[-\\*" ) + "+)"),
		ATTR: new RegExp("\\[\\s*(" + characterEncoding + "+)\\s*(?:(\\S?=)\\s*(?:(['\"])(.*?)\\3|(#?" + characterEncoding + "*)|)|)\\s*\\]"),
		PSEUDO: new RegExp(":(" + characterEncoding + "+)(?:\\((['\"]?)((?:\\([^\\)]+\\)|[^\\(\\)]*)+)\\2\\))?"),
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/
	},

	origPOS = matchExpr.POS,

	leftMatchExpr = (function() {
		var type,
			// Increments parenthetical references
			// for leftMatch creation
			fescape = function( all, num ) {
				return "\\" + ( num - 0 + 1 );
			},
			leftMatch = {};

		for ( type in matchExpr ) {
			// Modify the regexes ensuring the matches do not end in brackets/parens
			matchExpr[ type ] = new RegExp( matchExpr[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
			// Adds a capture group for characters left of the match
			leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + matchExpr[ type ].source.replace( /\\(\d+)/g, fescape ) );
		}

		// Expose origPOS
		// "global" as in regardless of relation to brackets/parens
		matchExpr.globalPOS = origPOS;

		return leftMatch;
	})(),

	// Cache for quick matching
	filterCache = {},

	// Used for testing something on an element
	assert = function( fn ) {
		var pass = false,
			div = document.createElement("div");
		try {
			pass = fn( div );
		} catch (e) {}
		// release memory in IE
		div = null;
		return pass;
	},

	// Check if attributes should be retrieved by attribute nodes
	assertAttributes = assert(function( div ) {
		div.innerHTML = "<select></select>";
		var type = typeof div.lastChild.getAttribute("multiple");
		// IE8 returns a string for some attributes even when not present
		return type !== "boolean" && type !== "string";
	}),

	// Check to see if the browser returns elements by name when
	// querying by getElementById (and provide a workaround)
	assertGetIdNotName = assert(function( div ) {
		var pass = true,
			id = "script" + (new Date()).getTime();
		div.innerHTML = "<a name ='" + id + "'/>";

		// Inject it into the root element, check its status, and remove it quickly
		docElem.insertBefore( div, docElem.firstChild );

		if ( document.getElementById( id ) ) {
			pass = false;
		}
		docElem.removeChild( div );
		return pass;
	}),

	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")
	assertTagNameNoComments = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return div.getElementsByTagName("*").length === 0;
	}),

	// Check to see if an attribute returns normalized href attributes
	assertHrefNotNormalized = assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
			div.firstChild.getAttribute("href") === "#";
	}),

	// Determines a buggy getElementsByClassName
	assertUsableClassName = assert(function( div ) {
		// Opera can't find a second classname (in 9.6)
		div.innerHTML = "<div class='test e'></div><div class='test'></div>";
		if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
			return false;
		}

		// Safari caches class attributes, doesn't catch changes (in 3.2)
		div.lastChild.className = "e";
		return div.getElementsByClassName("e").length !== 1;
	});


var Sizzle = function( selector, context, results, seed ) {
	results = results || [];
	context = context || document;
	var match, elem, contextXML, m,
		nodeType = context.nodeType;

	if ( nodeType !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	contextXML = isXML( context );

	if ( !contextXML && !seed ) {
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							return makeArray( [ elem ], results );
						}
					} else {
						return makeArray( [], results );
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						return makeArray( [ elem ], results );
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				return makeArray( context.getElementsByTagName( selector ), results );

			// Speed-up: Sizzle(".CLASS")
			} else if ( assertUsableClassName && (m = match[3]) && context.getElementsByClassName ) {
				return makeArray( context.getElementsByClassName( m ), results );
			}
		}
	}

	// All others
	return select( selector, context, results, seed, contextXML );
};

var select = function( selector, context, results, seed, contextXML ) {
	var m, set, checkSet, extra, ret, cur, pop, parts,
		i, len, elem, contextNodeType, checkIndexes, setIndex,
		origContext = context,
		prune = true,
		soFar = selector;

	// Split the selector into parts
	parts = [];
	do {
		// Reset the position of the chunker regexp (start from head)
		chunker.exec( "" );
		m = chunker.exec( soFar );

		if ( m ) {
			soFar = m[3];

			parts.push( m[1] );

			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {

		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context, seed, contextXML );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}

				set = posProcess( selector, set, seed, contextXML );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				matchExpr.ID.test( parts[0] ) && !matchExpr.ID.test( parts[parts.length - 1] ) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray( seed ) } :
				Sizzle.find( parts.pop(), (parts.length >= 1 && rsibling.test( parts[0] ) && context.parentNode) || context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );
				i = 0;
				len = checkSet.length;
				checkIndexes = [];
				for ( ; i < len; i++ ) {
					checkIndexes[i] = i;
				}

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();

				if ( Expr.relative[ cur ] ) {
					pop = parts.pop();
				} else {
					pop = cur;
					cur = "";
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, checkIndexes, pop, contextXML );
				checkSet = concat.apply( [], checkSet );
				checkIndexes = concat.apply( [], checkIndexes );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call( checkSet ) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else {
			contextNodeType = context && context.nodeType === 1;
			set = makeArray( set );
			for ( i = 0; (elem = checkSet[i]) != null; i++ ) {
				if ( elem === true || (elem.nodeType === 1 && ( !contextNodeType || contains(context, elem) )) ) {
					setIndex = checkIndexes ? checkIndexes[i] : i;
					if ( set[ setIndex ] ) {
						results.push( set[ setIndex ] );
						set[ setIndex ] = false;
					}
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		select( extra, origContext, results, seed, contextXML );
		uniqueSort( results );
	}

	return results;
};

Sizzle.matches = function( expr, set ) {
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( elem, expr ) {
	return Sizzle( expr, null, null, [ elem ] ).length > 0;
};

Sizzle.find = function( expr, context, contextXML ) {
	var set, i, len, match, type, left;

	if ( !expr ) {
		return [];
	}

	for ( i = 0, len = Expr.order.length; i < len; i++ ) {
		type = Expr.order[i];

		if ( (match = leftMatchExpr[ type ].exec( expr )) ) {
			left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace( rbackslash, "" );
				set = Expr.find[ type ]( match, context, contextXML );

				if ( set != null ) {
					expr = expr.replace( matchExpr[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = Expr.find.TAG( [ 0, "*" ], context );
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var anyFound,
		type, found, elem, filter, left, attrs,
		i, pass,
		match = filterCache[ expr ],
		old = expr,
		result = [],
		isXMLFilter = set && set[0] && isXML( set[0] );

	// Quick match => tag#id.class
	//   0  1    2   3
	// [ _, tag, id, class ]
	if ( !match ) {
		match = rquickMatch.exec( expr );
		if ( match ) {
			match[1] = ( match[1] || "" ).toLowerCase();
			match[3] = match[3] && (" " + match[3] + " ");
			filterCache[ expr ] = match;
		}
	}
	if ( match && !isXMLFilter ) {
		for ( i = 0; (elem = set[i]) != null; i++ ) {
			if ( elem ) {
				attrs = elem.attributes || {};
				found = (!match[1] || (elem.nodeName && elem.nodeName.toLowerCase() === match[1])) &&
						(!match[2] || (attrs.id || {}).value === match[2]) &&
						(!match[3] || ~(" " + ((attrs["class"] || {}).value || "").replace( rtnfr, " " ) + " ").indexOf( match[3] ));
				pass = not ^ found;
				if ( inplace && !pass ) {
					set[i] = false;
				} else if ( pass ) {
					result.push( elem );
				}
			}
		}
		if ( !inplace ) {
			set = result;
		}
		return set;
	}

	// Regular matching
	while ( expr && set.length ) {
		for ( type in Expr.filter ) {
			if ( (match = leftMatchExpr[ type ].exec( expr )) && match[2] ) {
				filter = Expr.filter[ type ];
				left = match[1];

				anyFound = false;

				match.splice( 1, 1 );

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( set === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, set, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( i = 0; (elem = set[i]) != null; i++ ) {
						if ( elem ) {
							found = filter( elem, match, i, set );
							pass = not ^ found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									set[i] = false;
								}

							} else if ( pass ) {
								result.push( elem );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						set = result;
					}

					expr = expr.replace( matchExpr[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return set;
};

Sizzle.attr = function( elem, name ) {
	if ( Expr.attrHandle[ name ] ) {
		return Expr.attrHandle[ name ]( elem );
	}
	if ( assertAttributes || isXML( elem ) ) {
		return elem.getAttribute( name );
	}
	var attr = (elem.attributes || {})[ name ];
	return attr && attr.specified ? attr.value : null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

if ( document.querySelectorAll ) {
	(function(){
		var disconnectedMatch,
			oldSelect = select,
			id = "__sizzle__",
			rdivision = /[^\\],/g,
			rrelativeHierarchy = /^\s*[+~]/,
			rapostrophe = /'/g,
			rattributeQuotes = /\=\s*([^'"\]]*)\s*\]/g,
			rbuggyQSA = [],
			rbuggyMatches = [],
			matches = docElem.matchesSelector ||
				docElem.mozMatchesSelector ||
				docElem.webkitMatchesSelector ||
				docElem.oMatchesSelector ||
				docElem.msMatchesSelector;

		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			div.innerHTML = "<select><option selected></option></select>";

			// IE8 - Some boolean attributes are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push("\\[[\\x20\\t\\n\\r\\f]*(?:checked|disabled|ismap|multiple|readonly|selected|value)");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here (do not put tests after this one)
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Opera 10-12/IE9 - ^= $= *= and empty values
			// Should not select anything
			div.innerHTML = "<p test=''></p>";
			if ( div.querySelectorAll("[test^='']").length ) {
				rbuggyQSA.push("[*^$]=[\\x20\\t\\n\\r\\f]*(?:\"\"|'')");
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here (do not put tests after this one)
			div.innerHTML = "<input type='hidden'>";
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push(":enabled", ":disabled");
			}
		});

		rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );

		select = function( selector, context, results, seed, contextXML ) {
			// Only use querySelectorAll when not filtering,
			// when this is not xml,
			// and when no QSA bugs apply
			if ( !seed && !contextXML && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
				if ( context.nodeType === 9 ) {
					try {
						return makeArray( context.querySelectorAll( selector ), results );
					} catch(qsaError) {}
				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var newSelector,
						oldContext = context,
						old = context.getAttribute( "id" ),
						nid = old || id,
						parent = context.parentNode,
						relativeHierarchySelector = rrelativeHierarchy.test( selector );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( rapostrophe, "\\$&" );
					}

					if ( relativeHierarchySelector && parent ) {
						context = parent;
					}

					try {
						if ( !relativeHierarchySelector || parent ) {
							nid = "[id='" + nid + "'] ";
							newSelector = nid + selector.replace( rdivision, "$&" + nid );
							return makeArray( context.querySelectorAll( newSelector ), results );
						}
					} catch(qsaError) {
					} finally {
						if ( !old ) {
							oldContext.removeAttribute( "id" );
						}
					}
				}
			}

			return oldSelect( selector, context, results, seed, contextXML );
		};

		if ( matches ) {
			assert(function( div ) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				disconnectedMatch = matches.call( div, "div" );

				// This should fail with an exception
				// Gecko does not error, returns false instead
				try {
					matches.call( div, "[test!='']:sizzle" );
					rbuggyMatches.push( Expr.match.PSEUDO );
				} catch ( e ) {}
			});

			// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
			// A support test would require too much code (would include document ready)
			// just skip matchesSelector for :active
			rbuggyMatches.push(":active");

			rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

			Sizzle.matchesSelector = function( elem, expr ) {
				// Make sure that attribute selectors are quoted
				expr = expr.replace( rattributeQuotes, "='$1']" );

				if ( !isXML( elem ) && (!rbuggyMatches || !rbuggyMatches.test( expr )) && (!rbuggyQSA || !rbuggyQSA.test( expr )) ) {
					try {
						var ret = matches.call( elem, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9
								elem.document && elem.document.nodeType !== 11 ) {
							return ret;
						}
					} catch(e) {}
				}

				return Sizzle( expr, null, null, [ elem ] ).length > 0;
			};
		}
	})();
}

// Slice is no longer used
// Results is expected to be an array or undefined
function makeArray( array, results ) {
	var elem, i = 0;
	if ( !results ) {
		results = [];
	}
	for ( i = 0; (elem = array[i]); i++ ) {
		results.push( elem );
	}
	return results;
}

var isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// Element contains another
var contains = Sizzle.contains = docElem.compareDocumentPosition ?
	function( a, b ) {
		return !!( a.compareDocumentPosition( b ) & 16 );
	} :
	docElem.contains ?
	function( a, b ) {
		var adown = a.nodeType === 9 ? a.documentElement : a,
			bup = b.parentNode;
		return a === bup || !!( bup && bup.nodeType === 1 && adown.contains && adown.contains(bup) );
	} :
	function( a, b ) {
		while ( (b = b.parentNode) ) {
			if ( b === a ) {
				return true;
			}
		}
		return false;
	};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
var getText = Sizzle.getText = function( elem ) {
	var i, node,
		nodeType = elem.nodeType,
		ret = "";

	if ( nodeType ) {
		if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (see #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse it's children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
	} else {

		// If no nodeType, this is expected to be an array
		for ( i = 0; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			if ( node.nodeType !== 8 ) {
				ret += getText( node );
			}
		}
	}
	return ret;
};

function posProcess( selector, context, seed, contextXML ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [ context ] : context,
		i = 0,
		len = root.length;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = matchExpr.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( matchExpr.PSEUDO, "" );
	}

	if ( Expr.relative[ selector ] ) {
		selector += "*";
	}

	for ( ; i < len; i++ ) {
		select( selector, root[i], tmpSet, seed, contextXML );
	}

	return Sizzle.filter( later, tmpSet );
}

// Avoids another call on the stack
function relativeFunction( dir, firstMatch ) {
	return function( checkSet, checkIndexes, part, xml ) {
		var elem, nodeCheck, isElem, match,
			j, matchLen,
			i = 0,
			len = checkSet.length,
			isPartStr = typeof part === "string";

		if ( isPartStr && !rnonWord.test( part ) ) {
			part = part.toLowerCase();
			nodeCheck = true;
		}

		for ( ; i < len; i++ ) {
			if ( (elem = checkSet[i]) ) {
				match = [];

				elem = elem[ dir ];

				while ( elem ) {
					isElem = elem.nodeType === 1;

					if ( nodeCheck ) {
						if ( elem.nodeName.toLowerCase() === part ) {
							match.push( elem );
						}
					} else if ( isElem ) {
						if ( !isPartStr ) {
							if ( elem === part ) {
								// We can stop here
								match = true;
								break;
							}

						} else if ( Sizzle.filter( part, [elem] ).length > 0 ) {
							match.push( elem );
						}
					}

					if ( firstMatch && isElem ) {
						break;
					}
					elem = elem[ dir ];
				}

				if ( (matchLen = match.length) ) {
					checkSet[i] = match;
					if ( matchLen > 1 ) {
						checkIndexes[i] = [];
						j = 0;
						for ( ; j < matchLen; j++ ) {
							checkIndexes[i].push( i );
						}
					}
				} else {
					checkSet[i] = typeof match === "boolean" ? match : false;
				}
			}
		}
	};
}

// Returns a function for use in filters to save space
function iFun( type ) {
	return function( elem ) {
		// Check the input's nodeName and type
		return elem.nodeName.toLowerCase() === "input" && elem.type === type;
	};
}

var Expr = Sizzle.selectors = {

	match: matchExpr,
	leftMatch: leftMatchExpr,

	order: [ "ID", "NAME", "TAG" ],

	attrHandle: {},

	relative: {
		">": relativeFunction( "parentNode", true ),
		"": relativeFunction( "parentNode" ),
		"+": relativeFunction( "previousSibling", true ),
		"~": relativeFunction( "previousSibling" )
	},

	find: {
		ID: assertGetIdNotName ?
			function( match, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( match[1] );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					return m && m.parentNode ? [m] : [];
				}
			} :
			function( match, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( match[1] );

					return m ?
						m.id === match[1] || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === match[1] ?
							[m] :
							undefined :
						[];
				}
			},

		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== strundefined ) {
				var ret = [],
					results = context.getElementsByName( match[1] ),
					i = 0,
					len = results.length;

				for ( ; i < len; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},

		TAG: assertTagNameNoComments ?
			function( match, context ) {
				if ( typeof context.getElementsByTagName !== strundefined ) {
					return context.getElementsByTagName( match[1] );
				}
			} :
			function( match, context ) {
				var results = context.getElementsByTagName( match[1] );

				// Filter out possible comments
				if ( match[1] === "*" ) {
					var tmp = [],
						i = 0;

					for ( ; results[i]; i++ ) {
						if ( results[i].nodeType === 1 ) {
							tmp.push( results[i] );
						}
					}

					results = tmp;
				}
				return results;
			}
	},

	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, xml ) {
			var elem,
				i = 0;

			match = " " + match[1].replace( rbackslash, "" ) + " ";

			if ( xml ) {
				return match;
			}

			for ( ; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && ~(" " + elem.className + " ").replace( rtnfr, " " ).indexOf( match )) ) {
						if ( !inplace ) {
							result.push( elem );
						}
					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace( rbackslash, "" );
		},

		TAG: function( match ) {
			return match[1].replace( rbackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace( radjacent, "" );

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = rnth.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!rnonDigit.test( match[2] ) && "0n+" + match[2] || match[2] );

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			} else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = ++done;

			return match;
		},

		ATTR: function( match ) {
			match[1] = match[1].replace( rbackslash, "" );

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rbackslash, "" );

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not, xml ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec( match[3] ) || "" ).length > 1 || rstartsWithWord.test( match[3] ) ) {
					match[3] = select( match[3], document, [], curLoop, xml );

				} else {
					var ret = Sizzle.filter( match[3], curLoop, inplace, !not );

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( matchExpr.POS.test( match[0] ) || matchExpr.CHILD.test( match[0] ) ) {
				return true;
			}

			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},

	filters: {
		enabled: function( elem ) {
			return elem.disabled === false;
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !! elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return rheader.test( elem.nodeName );
		},

		text: function( elem ) {
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === null || attr.toLowerCase() === type );
		},

		// Input types
		radio: iFun("radio"),
		checkbox: iFun("checkbox"),
		file: iFun("file"),
		password: iFun("password"),
		image: iFun("image"),

		submit: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "submit" === elem.type;
		},

		reset: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "reset" === elem.type;
		},

		button: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		},

		input: function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		focus: function( elem ) {
			var doc = elem.ownerDocument;
			return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href);
		},

		active: function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		},

		contains: function( elem, i, match ) {
			return ~( elem.textContent || elem.innerText || getText( elem ) ).indexOf( match[3] );
		}
	},

	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},

	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "not" ) {
				var not = match[3],
					j = 0,
					len = not.length;

				for ( ; j < len; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var first, last,
				doneName, parent,
				count, diff,
				type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) ) {
						if ( node.nodeType === 1 ) {
							return false;
						}
					}

					if ( type === "first" ) {
						return true;
					}

					node = elem;

					/* falls through */
				case "last":
					while ( (node = node.nextSibling) ) {
						if ( node.nodeType === 1 ) {
							return false;
						}
					}

					return true;

				case "nth":
					first = match[2];
					last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}

					doneName = match[0];
					parent = elem.parentNode;

					if ( parent && (parent[ expando ] !== doneName || !elem.sizset) ) {

						count = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.sizset = ++count;
								if ( node === elem ) {
									break;
								}
							}
						}

						parent[ expando ] = doneName;
					}

					diff = elem.sizset - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: assertGetIdNotName ?
			function( elem, match ) {
				return elem.nodeType === 1 && elem.getAttribute("id") === match;
			} :
			function( elem, match ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return elem.nodeType === 1 && node && node.value === match;
			},

		TAG: function( elem, match ) {
			return ( match === "*" && elem.nodeType === 1 ) || elem.nodeName && elem.nodeName.toLowerCase() === match;
		},

		CLASS: function( elem, match ) {
			return ~( " " + ( elem.className || elem.getAttribute("class") ) + " " ).indexOf( match );
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Sizzle.attr( elem, name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				!type ?
				result != null :
				type === "=" ?
				value === check :
				type === "*=" ?
				~value.indexOf( check ) :
				type === "~=" ?
				~( " " + value + " " ).indexOf( check ) :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf( check ) === 0 :
				type === "$=" ?
				value.substr( value.length - check.length ) === check :
				type === "|=" ?
				value === check || value.substr( 0, check.length + 1 ) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

// IE6/7 return a modified href
if ( !assertHrefNotNormalized ) {
	Expr.attrHandle = {
		href: function( elem ) {
			return elem.getAttribute( "href", 2 );
		},
		type: function( elem ) {
			return elem.getAttribute("type");
		}
	};
}

// Add getElementsByClassName if usable
if ( assertUsableClassName ) {
	Expr.order.splice( 1, 0, "CLASS" );
	Expr.find.CLASS = function( match, context, xml ) {
		if ( typeof context.getElementsByClassName !== strundefined && !xml ) {
			return context.getElementsByClassName( match[1] );
		}
	};
}

// Check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});


var sortOrder, siblingCheck;
if ( docElem.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Document sorting and removing duplicates
var uniqueSort = Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

// EXPOSE

window.Sizzle = Sizzle;

})( window );
