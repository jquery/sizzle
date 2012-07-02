/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2012, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function( window, undefined ) {

var tokenize,

	document = window.document,
	docElem = document.documentElement,

	expando = ( "sizcache" + Math.random() ).replace( ".", "" ),
	done = 0,

	push = Array.prototype.push,
	strundefined = "undefined",
	hasDuplicate = false,
	baseHasDuplicate = true,

	// Regex
	rquickExpr = /^#([\w\-]+$)|^(\w+$)|^\.([\w\-]+$)/,
	rcomma = /^\s*,\s*/,
	rcombinators = /^\s*([\s>~+])\s*/,
	rbackslash = /\\(?!\\)/g,
	rsibling = /^\s*[+~]\s*$/,

	rnonDigit = /\D/,
	rnth = /(-?)(\d*)(?:n([+\-]?\d*))?/,
	radjacent = /^\+|\s*/g,
	rheader = /h\d/i,
	rinputs = /input|select|textarea|button/i,
	rtnfr = /[\t\n\f\r]/g,

	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:[-\\w]|[^\\x00-\\xa0]|\\\\.)",
	// Javascript identifier syntax (with added # for unquoted hash)
	identifier = "(?:-?[#_a-zA-Z]{1}[-\\w]*|[^\\x00-\\xa0]+|\\\\.+)",
	// Acceptable operators
	operators = "([~*^$|!]?={1})",
	attributes = "\\[\\s*(" + characterEncoding + "+)\\s*(?:" + operators + "\\s*(?:(['\"])(.*?)\\3|(" + identifier + "+)|)|)\\s*\\]",
	pseudos = ":(" + characterEncoding + "+)(?:\\((['\"]?)((?:\\([^\\)]+\\)|[^\\(\\)]*)+)\\2\\))?",
	pos = ":(nth|eq|gt|lt|first|last|even|odd)(?:\\((\\d*)\\))?(?=[^\\-]|$)",

	matchExpr = {
		ID: new RegExp( "^#(" + characterEncoding + "+)" ),
		CLASS: new RegExp( "^\\.(" + characterEncoding + "+)" ),
		NAME: new RegExp( "^\\[name=['\"]?(" + characterEncoding + "+)['\"]?\\]" ),
		TAG: new RegExp( "^(" + characterEncoding.replace( "[-", "[-\\*" ) + "+)" ),
		ATTR: new RegExp( "^" + attributes ),
		PSEUDO: new RegExp( "^" + pseudos ),
		CHILD: /^\s*:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: new RegExp( "^" + pos ),
		// For use in libraries implementing .is(), an unanchored POS
		globalPOS: new RegExp( pos )
	},

	rtokens = new RegExp( "(" +
		attributes + "|" +
		pseudos +
		"|\\\\[>+~]|[^\\s>+~]|\\\\.)+|" +
		rcombinators.source.replace("^", ""), "g" ),

	// Split on commas not within brackets/parens/quotes
	rgroups = new RegExp( "(" +
		"[^,\\\\\\[\\]]+" +
		"|" + (/\[[^\[]*\]/).source +
		"|" + (/\([^\(]*\)/).source +
		"|\\\\.)+", "g"),

	rpos = new RegExp( pos, "g" ),
	rposgroups = new RegExp( "^" + rpos.source + "(?!\\s)" ),
	rendsWithNot = /:not\($/,

	maxCacheLength = 50,
	classCache = {},
	cachedClasses = [],
	compilerCache = {},
	cachedSelectors = [],

	// Mark a function for use in filtering
	markFunction = function( fn ) {
		fn.sizzleFilter = true;
		return fn;
	},

	// Utility for creating a function that returns the given value
	createFunction = function( x ) {
		return markFunction(function() {
			return x;
		});
	},

	// Returns a function to use in pseudos for input types
	createInputFunction = markFunction(function( type ) {
		return function( elem ) {
			// Check the input's nodeName and type
			return elem.nodeName.toLowerCase() === "input" && elem.type === type;
		};
	}),

	// Returns a function to use in pseudos for buttons
	createButtonFunction = markFunction(function( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && elem.type === type;
		};
	}),

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
	var match, elem, xml, m,
		nodeType = context.nodeType;

	if ( nodeType !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	xml = isXML( context );

	if ( !xml && !seed ) {
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
	return select( selector, context, results, seed, xml );
};

var Expr = Sizzle.selectors = {

	match: matchExpr,

	order: [ "ID", "TAG", "NAME" ],

	attrHandle: {},

	find: {
		ID: assertGetIdNotName ?
			function( id, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( id );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					return m && m.parentNode ? [m] : [];
				}
			} :
			function( id, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( id );

					return m ?
						m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
							[m] :
							undefined :
						[];
				}
			},

		NAME: function( name, context ) {
			if ( typeof context.getElementsByName !== strundefined ) {
				var ret = [],
					results = context.getElementsByName( name ),
					i = 0,
					len = results.length;
				for ( ; i < len; i++ ) {
					if ( results[i].getAttribute("name") === name ) {
						ret.push( results[i] );
					}
				}

				return !ret.length ? null : ret;
			}
		},

		TAG: assertTagNameNoComments ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== strundefined ) {
					return context.getElementsByTagName( tag );
				}
			} :
			function( tag, context ) {
				var results = context.getElementsByTagName( tag );

				// Filter out possible comments
				if ( tag === "*" ) {
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

	relative: {
		">": { dir: "parentNode", firstMatch: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", firstMatch: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		ID: function( match ) {
			match[1] = match[1].replace( rbackslash, "" );
			return match;
		},

		TAG: function( match ) {
			match[1] = match[1].replace( rbackslash, "" ).toLowerCase();
			return match;
		},

		ATTR: function( match ) {
			match[1] = match[1].replace( rbackslash, "" );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( rbackslash, "" );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
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

			return match;
		},

		PSEUDO: function( match ) {
			if ( matchExpr.POS.test( match[0] ) || matchExpr.CHILD.test( match[0] ) ) {
				return null;
			}
			return match;
		}
	},

	filter: {
		ID: assertGetIdNotName ?
			function( id ) {
				return function( elem ) {
					return elem.getAttribute("id") === id;
				};
			} :
			function( id ) {
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
					return node && node.value === id;
				};
			},

		TAG: function( nodeName ) {
			if ( nodeName === "*" ) {
				return createFunction( true );
			}
			return function( elem ) {
				return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
			};
		},

		CLASS: function( className ) {
			var pattern = classCache[ className ] || ( classCache[ className ] = new RegExp("(^|\\s)" + className + "(\\s|$)") );
			cachedClasses.push( className );
			if ( cachedClasses.length > maxCacheLength ) {
				delete classCache[ cachedClasses.shift() ];
			}
			return function( elem ) {
				return pattern.test( elem.className || elem.getAttribute("class") );
			};
		},

		ATTR: function( name, operator, check ) {
			if ( !operator ) {
				return function( elem ) {
					return Sizzle.attr( elem, name ) != null;
				};
			}

			return function( elem ) {
				var result = Sizzle.attr( elem, name ),
					value = result + "";

				if ( result == null ) {
					return operator === "!=";
				}

				switch ( operator ) {
					case "=":
						return value === check;
					case "!=":
						return value !== check;
					case "^=":
						return check && value.indexOf( check ) === 0;
					case "*=":
						return check && value.indexOf( check ) > -1;
					case "$=":
						return check && value.substr( value.length - check.length ) === check;
					case "~=":
						return ( " " + value + " " ).indexOf( check ) > -1;
					case "|=":
						return value === check || value.substr( 0, check.length + 1 ) === check + "-";
				}
			};
		},

		CHILD: function( type, first, last ) {

			if ( type === "nth" ) {
				var doneName = ++done;

				return function( elem ) {
					var parent, count, diff,
						node = elem;

					if ( first === 1 && last === 0 ) {
						return true;
					}

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
				};
			}

			return function( elem ) {
				var node = elem;

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
				}
			};
		},

		PSEUDO: function( pseudo, possibleQuote, argument, context, xml ) {
			var fn = Expr.pseudos[ pseudo ];

			if ( !fn ) {
				Sizzle.error( "unsupported pseudo: " + pseudo );
			}

			// If the function does not return a function
			// This is for back-compat
			// The user may also set fn.sizzleFilter to indicate
			// that they know a function should be returned when creating a pseudo
			if ( !fn.sizzleFilter ) {
				return fn;
			}

			return fn( argument, context, xml );
		}
	},

	pseudos: {
		not: markFunction(function( selector, context, xml ) {
			var matcher = compile( selector, context, xml );
			return function( elem ) {
				return !matcher( elem );
			};
		}),

		enabled: createFunction(function( elem ) {
			return elem.disabled === false;
		}),

		disabled: createFunction(function( elem ) {
			return elem.disabled === true;
		}),

		checked: createFunction(function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !! elem.checked) || (nodeName === "option" && !!elem.selected);
		}),

		selected: createFunction(function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		}),

		parent: createFunction(function( elem ) {
			return !!elem.firstChild;
		}),

		empty: createFunction(function( elem ) {
			return !elem.firstChild;
		}),

		contains: markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		has: markFunction(function( selector ) {
			return function( elem ) {
				return !!Sizzle( selector, elem ).length;
			};
		}),

		header: createFunction(function( elem ) {
			return rheader.test( elem.nodeName );
		}),

		text: createFunction(function( elem ) {
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === null || attr.toLowerCase() === type );
		}),

		// Input types
		radio: createInputFunction("radio"),
		checkbox: createInputFunction("checkbox"),
		file: createInputFunction("file"),
		password: createInputFunction("password"),
		image: createInputFunction("image"),

		submit: createButtonFunction("submit"),
		reset: createButtonFunction("reset"),

		button: createFunction(function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		}),

		input: createFunction(function( elem ) {
			return rinputs.test( elem.nodeName );
		}),

		focus: createFunction(function( elem ) {
			var doc = elem.ownerDocument;
			return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href);
		}),

		active: createFunction(function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		})
	},

	setFilters: {
		first: function( elements, argument, not ) {
			return not ? elements.slice( 1 ) : [ elements[0] ];
		},

		last: function( elements, argument, not ) {
			var elem = elements.pop();
			return not ? elements : [ elem ];
		},

		even: function( elements, argument, not ) {
			var results = [],
				i = not ? 1 : 0,
				len = elements.length;
			for ( ; i < len; i = i + 2 ) {
				results.push( elements[i] );
			}
			return results;
		},

		odd: function( elements, argument, not ) {
			var results = [],
				i = not ? 0 : 1,
				len = elements.length;
			for ( ; i < len; i = i + 2 ) {
				results.push( elements[i] );
			}
			return results;
		},

		lt: function( elements, argument, not ) {
			return not ? elements.slice( +argument ) : elements.slice( 0, +argument );
		},

		gt: function( elements, argument, not ) {
			return not ? elements.slice( 0, +argument + 1 ) : elements.slice( +argument + 1 );
		},

		eq: function( elements, argument, not ) {
			var elem = elements.splice( +argument, 1 );
			return not ? elements : elem;
		}
	}
};

// Deprecated
Expr.setFilters.nth = Expr.setFilters.eq;

// Back-compat
Expr.filters = Expr.pseudos;

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
	Expr.find.CLASS = function( className, context, xml ) {
		if ( typeof context.getElementsByClassName !== strundefined && !xml ) {
			return context.getElementsByClassName( className );
		}
	};
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
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
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
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

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
		// Do not include comment or processing instruction nodes
	} else {

		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	}
	return ret;
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
Sizzle.uniqueSort = function( results ) {
	var i = 1;

	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( ; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

function multipleContexts( selector, contexts, results, seed ) {
	for ( var i = 0, len = contexts.length; i < len; i++ ) {
		Sizzle( selector, contexts[i], results, seed );
	}
}

function handlePOSGroup( selector, posfilter, argument, contexts, seed, not ) {
	var results = [],
		fn = Expr.setFilters[ posfilter ];

	if ( !fn ) {
		Sizzle.error( selector + posfilter );
	}

	if ( selector ) {
		multipleContexts( selector, contexts, results, seed );
	} else {
		results = seed;
	}
	return fn( results, argument, not );
}

function handlePOS( selector, context, results, seed, isSingle ) {
	var match, m, not,
		currentContexts, part, lastIndex,
		elements = seed || null,
		ret = [],
		anchor = 0,
		setUndefined = function() {
			for ( var i = 1, len = arguments.length - 2; i < len; i++ ) {
				if ( arguments[i] === undefined ) {
					match[i] = undefined;
				}
			}
		};

	// Make sure the regex index is reset to 0
	rpos.exec("");

	while ( (match = rpos.exec( selector )) ) {
		lastIndex = match.index + match[0].length;
		if ( lastIndex > anchor ) {
			part = selector.slice( anchor, match.index );
			if ( match.length > 1 ) {
				match[0].replace( rposgroups, setUndefined );
			}
			anchor = lastIndex;

			currentContexts = [ context ];
			if ( rendsWithNot.test( part ) ) {
				part = part.replace( rendsWithNot, "" ).replace( rcombinators, "$&*" );
				not = true;
			} else {
				not = false;
			}
			if ( (m = part.match( rgroups )) && m[0] !== part ) {
				part = part.replace( rcomma, "" );
				ret = ret.concat( elements );
				elements = seed;
			}

			if ( rcombinators.test(part) ) {
				currentContexts = elements || [ context ];
				elements = seed;
			}

			elements = handlePOSGroup( part, match[1], match[2], currentContexts, elements, not );
		}

		if ( rpos.lastIndex === match.index ) {
			rpos.lastIndex++;
		}
	}

	ret = ret.concat( elements );

	if ( (part = selector.slice( anchor )) && part !== ")" ) {
		elements = ret;
		ret = [];
		multipleContexts( part, elements, ret, seed );
	}

	// Do not sort if this is a single filter
	return makeArray( (seed && isSingle ? ret : Sizzle.uniqueSort(ret)), results );
}

(function () {
	var soFar, match, tokens,
		advance = function( pattern, type, xml ) {
			if ( (match = pattern.exec( soFar )) &&
					( !type || !Expr.preFilter[ type ] || (match = Expr.preFilter[ type ]( match, xml )) ) ) {
				soFar = soFar.slice( match[0].length );
			}
			return match;
		};

	tokenize = function( selector, context, xml ) {
		soFar = selector;
		tokens = [];

		var type, matched,
			checkContext = !xml && context !== document,
			groups = [ tokens ];

		// Need to make sure we're within a narrower context if necessary
		// Adding a descendent combinator will generate what is needed automatically
		if ( checkContext ) {
			soFar = " " + soFar;
		}

		while ( soFar ) {
			matched = false;
			if ( advance(rcomma) ) {
				groups.push(tokens = []);
				if ( checkContext ) {
					soFar = " " + soFar;
				}
			}
			if ( advance(rcombinators) ) {
				tokens.push({ part: match.pop(), captures: match });
				matched = true;
			}
			for ( type in Expr.filter ) {
				if ( advance(matchExpr[ type ], type, xml) ) {
					match.shift();
					tokens.push({ part: type, captures: match });
					matched = true;
				}
			}

			if ( !matched ) {
				Sizzle.error( selector );
			}
		}

		return groups;
	};
})();

function addCombinator( matcher, combinator, context ) {
	var dir = combinator.dir,
		firstMatch = combinator.firstMatch;

	if ( !matcher ) {
		// If there is no matcher to check, check against the context
		matcher = function( elem ) {
			return elem === context;
		};
	}
	return function( elem, context ) {
		while ( (elem = elem[ dir ]) ) {
			if ( elem.nodeType === 1 ) {
				if ( matcher( elem, context ) ) {
					return elem;
				}
				if ( firstMatch ) {
					break;
				}
			}
		}
	};
}

function addMatcher( higher, deeper ) {
	if ( !higher ) {
		return deeper;
	}
	return function( elem, context ) {
		var result = deeper( elem, context );
		return result && higher( result === true ? elem : result, context );
	};
}

// ["TAG", ">", "ID", " ", "CLASS"]
function matcherFromTokens( tokens, context, xml ) {
	var token, matcher,
		i = 0;

	for ( ; (token = tokens[i]); i++ ) {
		if ( Expr.relative[ token.part ] ) {
			matcher = addCombinator( matcher, Expr.relative[ token.part ], context );
		} else {
			token.captures.push( context, xml );
			matcher = addMatcher( matcher, Expr.filter[ token.part ].apply( null, token.captures ) );
		}
	}

	return matcher;
}

function matcherFromGroupMatchers( matchers ) {
	return function( elem, context ) {
		var matcher,
			j = 0;
		for ( ; (matcher = matchers[j]); j++ ) {
			if ( matcher(elem, context) ) {
				return true;
			}
		}
		return false;
	};
}

function compile( selector, context, xml ) {
	var tokens, group, i,
		cached = compilerCache[ selector ];

	// Return a cached group function if already generated (context dependent)
	if ( cached && cached.context === context ) {
		return cached;
	}

	// Generate a function of recursive functions that can be used to check each element
	group = tokenize( selector, context, xml );
	for ( i = 0; (tokens = group[i]); i++ ) {
		group[i] = matcherFromTokens( tokens, context, xml );
	}

	// Cache the compiled function
	cached = compilerCache[ selector ] = matcherFromGroupMatchers( group );
	cached.context = context;
	cachedSelectors.push( selector );
	// Ensure only the most recent are cached
	if ( cachedSelectors.length > maxCacheLength ) {
		delete compilerCache[ cachedSelectors.shift() ];
	}
	return cached;
}

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	return Sizzle( expr, null, null, [ elem ] ).length > 0;
};

var select = function( selector, context, results, seed, xml ) {
	var elements, matcher, i, len, elem, token, position,
		type, match, findContext, notTokens,
		tokens = selector.match( rtokens ),
		isSingle = (match = selector.match( rgroups )) && match.length === 1,
		contextNodeType = context.nodeType;

	// POS handling
	if ( rpos.test(selector) ) {
		return handlePOS( selector, context, results, seed, isSingle );
	}

	// Take a shortcut and set the context if the root selector is an ID
	if ( !seed && isSingle && tokens.length > 1 && contextNodeType === 9 && !xml &&
			(match = matchExpr.ID.exec( tokens[0] )) ) {

		context = Expr.find.ID( match[1], context, xml )[0];
		selector = selector.slice( tokens.shift().length );
	}

	if ( context ) {
		if ( seed ) {
			elements = makeArray( seed );

		} else {

			// Maintain document order by not limiting the set
			if ( isSingle ) {
				findContext = (tokens.length >= 1 && rsibling.test( tokens[0] ) && context.parentNode) || context;

				// Get the last token, excluding :not
				notTokens = tokens.pop().split(":not");
				token = notTokens[0];

				for ( i = 0, len = Expr.order.length; i < len; i++ ) {
					type = Expr.order[i];

					if ( (match = matchExpr[ type ].exec( token )) ) {
						elements = Expr.find[ type ]( (match[1] || "").replace( rbackslash, "" ), findContext, xml );

						if ( elements != null ) {
							break;
						}
					}
				}

				if ( elements && !notTokens[1] ) {
					position = selector.length - token.length;
					selector = selector.slice( 0, position ) +
						selector.slice( position ).replace( matchExpr[ type ], "" );

					if ( !selector ) {
						return makeArray( elements, results );
					}
				}
			}

			if ( !elements ) {
				elements = Expr.find.TAG( "*", context );
			}
		}

		// Only loop over the given elements once
		// If selector is empty, we're already done
		if ( selector && (matcher = compile( selector, context, xml )) ) {
			for ( i = 0; (elem = elements[i]); i++ ) {
				if ( matcher(elem, context) ) {
					results.push( elem );
				}
			}
		}
	}

	return results;
};

if ( document.querySelectorAll ) {
	(function() {
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

		select = function( selector, context, results, seed, xml ) {
			// Only use querySelectorAll when not filtering,
			// when this is not xml,
			// and when no QSA bugs apply
			if ( !seed && !xml && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
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

			return oldSelect( selector, context, results, seed, xml );
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

// EXPOSE
window.Sizzle = Sizzle;

})( window );
