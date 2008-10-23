// Developed by Robert Nyman/DOMAssistant team, code/licensing: http://code.google.com/p/domassistant/, documentation: http://www.domassistant.com/documentation, version 2.7.2
var DOMAssistant = function () {
	var HTMLArray = function () {
		// Constructor
	};
	var isIE = /*@cc_on!@*/false;
	var cachedElms = [];
	var camel = {
		"accesskey": "accessKey",
		"class": "className",
		"colspan": "colSpan",
		"for": "htmlFor",
		"maxlength": "maxLength",
		"readonly": "readOnly",
		"rowspan": "rowSpan",
		"tabindex": "tabIndex",
		"valign": "vAlign",
		"cellspacing": "cellSpacing",
		"cellpadding": "cellPadding"
	};
	var pushAll = function (set1, set2) {
		for (var j=0, jL=set2.length; j<jL; j++) {
			set1.push(set2[j]);
		}
		return set1;
	};
	if (isIE) {
		pushAll = function (set1, set2) {
			if (set2.slice) {
				return set1.concat(set2);
			}
			for (var i=0, iL=set2.length; i<iL; i++) {
				set1[set1.length] = set2[i];
			}
			return set1;
		};
	}
	return {
		isIE : isIE,
		camel : camel,
		allMethods : [],
		publicMethods : [
			"cssSelect",
			"elmsByClass",
			"elmsByAttribute",
			"elmsByTag"
		],
		
		initCore : function () {
			this.applyMethod.call(window, "$", this.$);
			this.applyMethod.call(window, "$$", this.$$);
			window.DOMAssistant = this;
			if (isIE) {
				HTMLArray = Array;
			}
			HTMLArray.prototype = [];
			HTMLArray.prototype.each = function (functionCall) {
				for (var i=0, il=this.length; i<il; i++) {
					functionCall.call(this[i]);
				}
				return this;
			};
			HTMLArray.prototype.first = function () {
				return (typeof this[0] !== "undefined")? DOMAssistant.addMethodsToElm(this[0]) : null;
			};
			HTMLArray.prototype.end = function () {
				return this.previousSet;
			};
			this.attach(this);
		},
		
		addMethods : function (name, method) {
			if (typeof this.allMethods[name] === "undefined") {
				this.allMethods[name] = method;
				this.addHTMLArrayPrototype(name, method);
			}
		},
		
		addMethodsToElm : function (elm) {
			for (var method in this.allMethods) {
				if (typeof this.allMethods[method] !== "undefined") {
					this.applyMethod.call(elm, method, this.allMethods[method]);
				}
			}
			return elm;
		},
		
		applyMethod : function (method, func) {
			if (typeof this[method] !== "function") {
				this[method] = func;
			}
		},
		
		attach : function (plugin) {
			var publicMethods = plugin.publicMethods;
			if (typeof publicMethods === "undefined") {
				for (var method in plugin) {
					if (method !== "init" && typeof plugin[method] !== "undefined") {
						this.addMethods(method, plugin[method]);
					}
				}
			}
			else if (publicMethods.constructor === Array) {
				for (var i=0, current; (current=publicMethods[i]); i++) {
					this.addMethods(current, plugin[current]);
				}
			}
			if (typeof plugin.init === "function") {
				plugin.init();
			}
		},
		
		addHTMLArrayPrototype : function (name, method) {
			HTMLArray.prototype[name] = function () {
				var elmsToReturn = new HTMLArray();
				elmsToReturn.previousSet = this;
				var elms;
				for (var i=0, il=this.length; i<il; i++) {
					elms = method.apply(this[i], arguments);
					if (typeof elms !== "undefined" && elms !== null && elms.constructor === Array) {
						elmsToReturn = pushAll(elmsToReturn, elms);
					}
					else {
						elmsToReturn.push(elms);
					}
				}
				return elmsToReturn;
			};
		},
		
		$ : function () {
			var obj = arguments[0];
			if (arguments.length === 1 && (typeof obj === "object" || (typeof obj === "function" && typeof obj.nodeName !== "undefined"))) {
				return DOMAssistant.$$(obj);
			}
			var elm = new HTMLArray();
			for (var i=0, arg; (arg=arguments[i]); i++) {
				if (typeof arg === "string") {
					arg = arg.replace(/^[^#]*(#)/, "$1");
					if (/^#[\w\u00C0-\uFFFF\-\_]+$/.test(arg)) {
						var idMatch = DOMAssistant.$$(arg.substr(1), false);
						if (idMatch) {
							elm.push(idMatch);
						}
					}
					else {
						elm = pushAll(elm, DOMAssistant.cssSelection.call(document, arg));
					}
				}
			}
			return elm;
		},
		
		$$ : function (id, addMethods) {
			var elm = (typeof id === "object" || (typeof id === "function" && typeof id.nodeName !== "undefined"))? id : document.getElementById(id);
			var applyMethods = addMethods || true;
			if (typeof id === "string" && elm && elm.id !== id) {
				elm = null;
				for (var i=0, item; (item=document.all[i]); i++) {
					if (item.id === id) {
						elm = item;
						break;
					}
				}
			}
			if (elm && applyMethods) {
				DOMAssistant.addMethodsToElm(elm);
			}
			return elm;
		},
		
		getSequence : function (expression) {
			var start, add = 2, max = -1, modVal = -1;
			var expressionRegExp = /^((odd|even)|([1-9]\d*)|((([1-9]\d*)?)n([\+\-]\d+)?)|(\-(([1-9]\d*)?)n\+(\d+)))$/;
			var pseudoValue = expressionRegExp.exec(expression);
			if (!pseudoValue) {
				return null;
			}
			else {
				if (pseudoValue[2]) {	// odd or even
					start = (pseudoValue[2] === "odd")? 1 : 2;
					modVal = (start === 1)? 1 : 0;
				}
				else if (pseudoValue[3]) {	// single digit
					start = parseInt(pseudoValue[3], 10);
					add = 0;
					max = start;
				}
				else if (pseudoValue[4]) {	// an+b
					add = pseudoValue[6]? parseInt(pseudoValue[6], 10) : 1;
					start = pseudoValue[7]? parseInt(pseudoValue[7], 10) : 0;
					while (start < 1) {
						start += add;
					}
					modVal = (start > add)? (start - add) % add : ((start === add)? 0 : start);
				}
				else if (pseudoValue[8]) {	// -an+b
					add = pseudoValue[10]? parseInt(pseudoValue[10], 10) : 1;
					start = max = parseInt(pseudoValue[11], 10);
					while (start > add) {
						start -= add;
					}
					modVal = (max > add)? (max - add) % add : ((max === add)? 0 : max);
				}
			}
			return { start: start, add: add, max: max, modVal: modVal };
		},
		
		cssByDOM : function (cssRule) {
			var cssRules = cssRule.replace(/\s*(,)\s*/g, "$1").split(",");
			var elm = new HTMLArray();
			var prevElm = [], matchingElms = [];
			var prevParents, currentRule, identical, cssSelectors, childOrSiblingRef, nextTag, nextRegExp, regExpClassNames, matchingClassElms, regExpAttributes, matchingAttributeElms, attributeMatchRegExp, current, previous, prevParent, addElm, iteratorNext, childCount, childElm, sequence;
			var childOrSiblingRefRegExp = /^(>|\+|~)$/;
			var cssSelectorRegExp = /^(\w+)?(#[\w\u00C0-\uFFFF\-\_]+|(\*))?((\.[\w\u00C0-\uFFFF\-_]+)*)?((\[\w+(\^|\$|\*|\||~)?(=([\w\u00C0-\uFFFF\s\-\_\.]+|"[^"]*"|'[^']*'))?\]+)*)?(((:\w+[\w\-]*)(\((odd|even|\-?\d*n?((\+|\-)\d+)?|[\w\u00C0-\uFFFF\-_]+|"[^"]*"|'[^']*'|((\w*\.[\w\u00C0-\uFFFF\-_]+)*)?|(\[#?\w+(\^|\$|\*|\||~)?=?[\w\u00C0-\uFFFF\s\-\_\.]+\]+)|(:\w+[\w\-]*))\))?)*)?/;
			var selectorSplitRegExp;
			try {
				selectorSplitRegExp = new RegExp("(?:\\[[^\\[]*\\]|\\(.*\\)|[^\\s\\+>~\\[\\(])+|[\\+>~]", "g");
			}
			catch (e) {
				selectorSplitRegExp = /[^\s]+/g;
			}
			function clearAdded (elm) {
				elm = elm || prevElm;
				for (var n=0, nl=elm.length; n<nl; n++) {
					elm[n].added = null;
				}
			}
			function clearChildElms () {
				for (var n=0, nl=prevParents.length; n<nl; n++) {
					prevParents[n].childElms = null;
				}
			}
			function subtractArray (arr1, arr2) {
				for (var i=0, src1; (src1=arr1[i]); i++) {
					var found = false;
					for (var j=0, src2; (src2=arr2[j]); j++) {
						if (src2 === src1) {
							found = true;
							break;
						}
					}
					if (found) {
						arr1.splice(i--, 1);
					}
				}
				return arr1;
			}
			function getAttr (elm, attr) {
				return isIE? elm[camel[attr.toLowerCase()] || attr] : elm.getAttribute(attr, 2);
			}
			function attrToRegExp (attrVal, substrOperator) {
				attrVal = attrVal? attrVal.replace(/^["'](.*)["']$/, "$1").replace(/\./g, "\\.") : null;
				switch (substrOperator) {
					case "^": return "^" + attrVal;
					case "$": return attrVal + "$";
					case "*": return attrVal;
					case "|": return "(^" + attrVal + "(\\-\\w+)*$)";
					case "~": return "\\b" + attrVal + "\\b";
					default: return attrVal? "^" + attrVal + "$" : null;
				}
			}
			function getElementsByTagName (tag, parent) {
				tag = tag || "*";
				parent = parent || document;
				if (parent === document || parent.lastModified) {
					if (!cachedElms[tag]) {
						cachedElms[tag] = isIE? ((tag === "*")? document.all : document.all.tags(tag)) : document.getElementsByTagName(tag);
					}
					return cachedElms[tag];
				}
				return isIE? ((tag === "*")? parent.all : parent.all.tags(tag)) : parent.getElementsByTagName(tag);
			}
			function getElementsByPseudo (previousMatch, pseudoClass, pseudoValue) {
				prevParents = [];
				var pseudo = pseudoClass.split("-"), matchingElms = [], checkNodeName;
				var prop = (checkNodeName = /\-of\-type$/.test(pseudoClass))? "nodeName" : "nodeType";
				function getPrevElm(elm) {
					var val = checkNodeName? elm.nodeName : 1;
					while ((elm = elm.previousSibling) && elm[prop] !== val) {}
					return elm;
				}
				function getNextElm(elm) {
					var val = checkNodeName? elm.nodeName : 1;
					while ((elm = elm.nextSibling) && elm[prop] !== val) {}
					return elm;
				}
				switch (pseudo[0]) {
					case "first":
						for (var i=0; (previous=previousMatch[i]); i++) {
							if (!getPrevElm(previous)) {
								matchingElms[matchingElms.length] = previous;
							}
						}
						break;
					case "last":
						for (var j=0; (previous=previousMatch[j]); j++) {
							if (!getNextElm(previous)) {
								matchingElms[matchingElms.length] = previous;
							}
						}
						break;
					case "only":
						for (var k=0, kParent; (previous=previousMatch[k]); k++) {
							prevParent = previous.parentNode;
							if (prevParent !== kParent) {
								if (!getPrevElm(previous) && !getNextElm(previous)) {
									matchingElms[matchingElms.length] = previous;
								}
								kParent = prevParent;
							}
						}
						break;
					case "nth":
						if (/^n$/.test(pseudoValue)) {
							matchingElms = previousMatch;
						}
						else {
							var direction = (pseudo[1] === "last")? ["lastChild", "previousSibling"] : ["firstChild", "nextSibling"];
							sequence = DOMAssistant.getSequence.call(this, pseudoValue);
							if (sequence) {
								for (var l=0; (previous=previousMatch[l]); l++) {
									prevParent = previous.parentNode;
									if (!prevParent.childElms) {
										iteratorNext = sequence.start;
										childCount = 0;
										childElm = prevParent[direction[0]];
										while (childElm && (sequence.max < 0 || iteratorNext <= sequence.max)) {
											if (checkNodeName) {
												if (childElm.nodeName === previous.nodeName) {
													if (++childCount === iteratorNext) {
														matchingElms[matchingElms.length] = childElm;
														iteratorNext += sequence.add;
													}
												}
											}
											else {
												if (childElm.nodeType === 1) {
													if (++childCount === iteratorNext) {
														if (childElm.nodeName === previous.nodeName) {
															matchingElms[matchingElms.length] = childElm;
														}
														iteratorNext += sequence.add;
													}
												}
											}
											childElm = childElm[direction[1]];
										}
										prevParent.childElms = true;
										prevParents[prevParents.length] = prevParent;
									}
								}
								clearChildElms();
							}
						}
						break;
					case "empty":
						for (var m=0; (previous=previousMatch[m]); m++) {
							if (!previous.childNodes.length) {
								matchingElms[matchingElms.length] = previous;
							}
						}
						break;
					case "enabled":
						for (var n=0; (previous=previousMatch[n]); n++) {
							if (!previous.disabled) {
								matchingElms[matchingElms.length] = previous;
							}
						}
						break;
					case "disabled":
						for (var o=0; (previous=previousMatch[o]); o++) {
							if (previous.disabled) {
								matchingElms[matchingElms.length] = previous;
							}
						}
						break;
					case "checked":
						for (var p=0; (previous=previousMatch[p]); p++) {
							if (previous.checked) {
								matchingElms[matchingElms.length] = previous;
							}
						}
						break;
					case "contains":
						pseudoValue = pseudoValue.replace(/^["'](.*)["']$/, "$1");
						for (var q=0; (previous=previousMatch[q]); q++) {
							if (!previous.added) {
								if (previous.innerText.indexOf(pseudoValue) !== -1) {
									previous.added = true;
									matchingElms[matchingElms.length] = previous;
								}
							}
						}
						break;
					case "target":
						var hash = document.location.hash.slice(1);
						if (hash) {
							for (var r=0; (previous=previousMatch[r]); r++) {
								if (getAttr(previous, "name") === hash || getAttr(previous, "id") === hash) {
									matchingElms[matchingElms.length] = previous;
									break;
								}
							}
						}
						break;
					case "not":
						if (/^(:\w+[\w\-]*)$/.test(pseudoValue)) {
							matchingElms = subtractArray(previousMatch, getElementsByPseudo(previousMatch, pseudoValue.slice(1)));
						}
						else {
							pseudoValue = pseudoValue.replace(/^\[#([\w\u00C0-\uFFFF\-\_]+)\]$/, "[id=$1]");
							var notTag = /^(\w+)/.exec(pseudoValue);
							var notClass = /^\.([\w\u00C0-\uFFFF\-_]+)/.exec(pseudoValue);
							var notAttr = /\[(\w+)(\^|\$|\*|\||~)?=?([\w\u00C0-\uFFFF\s\-_\.]+)?\]/.exec(pseudoValue);
							var notRegExp = new RegExp("(^|\\s)" + (notTag? notTag[1] : notClass? notClass[1] : "") + "(\\s|$)", "i");
							if (notAttr) {
								var notMatchingAttrVal = attrToRegExp(notAttr[3], notAttr[2]);
								notRegExp = new RegExp(notMatchingAttrVal, "i");
							}
							for (var s=0, notElm; (notElm=previousMatch[s]); s++) {
								addElm = null;
								if (notTag && !notRegExp.test(notElm.nodeName)) {
									addElm = notElm;
								}
								else if (notClass && !notRegExp.test(notElm.className)) {
									addElm = notElm;
								}
								else if (notAttr) {
									var att = getAttr(notElm, notAttr[1]);
									if (!att || !notRegExp.test(att)) {
										addElm = notElm;
									}
								}
								if (addElm && !addElm.added) {
									addElm.added = true;
									matchingElms[matchingElms.length] = addElm;
								}
							}
						}
						break;
					default:
						for (var t=0; (previous=previousMatch[t]); t++) {
							if (getAttr(previous, pseudoClass) === pseudoValue) {
								matchingElms[matchingElms.length] = previous;
							}
						}
						break;
				}
				return matchingElms;
			}
			for (var a=0; (currentRule=cssRules[a]); a++) {
				if (a > 0) {
					identical = false;
					for (var b=0, bl=a; b<bl; b++) {
						if (cssRules[a] === cssRules[b]) {
							identical = true;
							break;
						}
					}
					if (identical) {
						continue;
					}
				}
				cssSelectors = currentRule.match(selectorSplitRegExp);
				prevElm = [this];
				for (var i=0, rule; (rule=cssSelectors[i]); i++) {
					matchingElms = [];
					if (i > 0 && childOrSiblingRefRegExp.test(rule)) {
						childOrSiblingRef = childOrSiblingRefRegExp.exec(rule);
						if (childOrSiblingRef) {
							nextTag = /^\w+/.exec(cssSelectors[i+1]);
							if (nextTag) {
								nextTag = nextTag[0];
								nextRegExp = new RegExp("(^|\\s)" + nextTag + "(\\s|$)", "i");
							}
							for (var j=0, prevRef; (prevRef=prevElm[j]); j++) {
								switch (childOrSiblingRef[0]) {
									case ">":
										var children = getElementsByTagName(nextTag, prevRef);
										for (var k=0, child; (child=children[k]); k++) {
											if (child.parentNode === prevRef) {
												matchingElms[matchingElms.length] = child;
											}
										}
										break;
									case "+":
										while ((prevRef = prevRef.nextSibling) && prevRef.nodeType !== 1) {}
										if (prevRef) {
											if (!nextTag || nextRegExp.test(prevRef.nodeName)) {
												matchingElms[matchingElms.length] = prevRef;
											}
										}
										break;
									case "~":
										while ((prevRef = prevRef.nextSibling) && !prevRef.added) {
											if (!nextTag || nextRegExp.test(prevRef.nodeName)) {
												prevRef.added = true;
												matchingElms[matchingElms.length] = prevRef;
											}
										}
										break;
								}
							}
							prevElm = matchingElms;
							clearAdded();
							rule = cssSelectors[++i];
							if (/^\w+$/.test(rule)) {
								continue;
							}
							prevElm.skipTag = true;
						}
					}
					var cssSelector = cssSelectorRegExp.exec(rule);
					var splitRule = {
						tag : (!cssSelector[1] || cssSelector[3] === "*")? "*" : cssSelector[1],
						id : (cssSelector[3] !== "*")? cssSelector[2] : null,
						allClasses : cssSelector[4],
						allAttr : cssSelector[6],
						allPseudos : cssSelector[11]
					};
					if (splitRule.id) {
						var DOMElm = document.getElementById(splitRule.id.replace(/#/, ""));
						if (DOMElm) {
							matchingElms = [DOMElm];
						}
						prevElm = matchingElms;
					}
					else if (splitRule.tag && !prevElm.skipTag) {
						if (i===0 && !matchingElms.length && prevElm.length === 1) {
							prevElm = matchingElms = pushAll([], getElementsByTagName(splitRule.tag, prevElm[0]));
						}
						else {
							for (var l=0, ll=prevElm.length, tagCollectionMatches, tagMatch; l<ll; l++) {
								tagCollectionMatches = getElementsByTagName(splitRule.tag, prevElm[l]);
								for (var m=0; (tagMatch=tagCollectionMatches[m]); m++) {
									if (!tagMatch.added) {
										tagMatch.added = true;
										matchingElms[matchingElms.length] = tagMatch;
									}
								}
							}
							prevElm = matchingElms;
							clearAdded();
						}
					}
					if (!matchingElms.length) {
						break;
					}
					prevElm.skipTag = false;
					if (splitRule.allClasses) {
						var allClasses = splitRule.allClasses.replace(/^\./, "").split(".");
						regExpClassNames = [];
						for (var n=0, nl=allClasses.length; n<nl; n++) {
							regExpClassNames[n] = new RegExp("(^|\\s)" + allClasses[n] + "(\\s|$)");
						}
						matchingClassElms = [];
						for (var o=0, elmClass; (current=prevElm[o]); o++) {
							elmClass = current.className;
							if (elmClass && !current.added) {
								addElm = false;
								for (var p=0, pl=regExpClassNames.length; p<pl; p++) {
									addElm = regExpClassNames[p].test(elmClass);
									if (!addElm) {
										break;
									}
								}
								if (addElm) {
									current.added = true;
									matchingClassElms[matchingClassElms.length] = current;
								}
							}
						}
						clearAdded();
						prevElm = matchingElms = matchingClassElms;
					}
					if (splitRule.allAttr) {
						var allAttr = splitRule.allAttr.match(/\[[^\]]+\]/g);
						regExpAttributes = [];
						attributeMatchRegExp = /(\w+)(\^|\$|\*|\||~)?=?([\w\u00C0-\uFFFF\s\-_\.]+|"[^"]*"|'[^']*')?/;
						for (var q=0, ql=allAttr.length, attributeMatch, attrVal; q<ql; q++) {
							attributeMatch = attributeMatchRegExp.exec(allAttr[q]);
							attrVal = attrToRegExp(attributeMatch[3], (attributeMatch[2] || null));
							regExpAttributes[q] = [(attrVal? new RegExp(attrVal) : null), attributeMatch[1]];
						}
						matchingAttributeElms = [];
						for (var r=0, currentAttr; (current=matchingElms[r]); r++) {
							for (var s=0, sl=regExpAttributes.length, attributeRegExp; s<sl; s++) {
								addElm = false;
								attributeRegExp = regExpAttributes[s][0];
								currentAttr = getAttr(current, regExpAttributes[s][1]);
								if (typeof currentAttr === "string" && currentAttr.length) {
									if (!attributeRegExp || typeof attributeRegExp === "undefined" || (attributeRegExp && attributeRegExp.test(currentAttr))) {
										addElm = true;
									}
								}
								if (!addElm) {
									break;
								}
							}
							if (addElm) {
								matchingAttributeElms[matchingAttributeElms.length] = current;
							}
						}
						prevElm = matchingElms = matchingAttributeElms;
					}
					if (splitRule.allPseudos) {
						var pseudoSplitRegExp = /:(\w[\w\-]*)(\(([^\)]+)\))?/;
						var allPseudos = splitRule.allPseudos.match(/(:\w+[\w\-]*)(\([^\)]+\))?/g);
						for (var t=0, tl=allPseudos.length; t<tl; t++) {
							var pseudo = allPseudos[t].match(pseudoSplitRegExp);
							var pseudoClass = pseudo[1]? pseudo[1].toLowerCase() : null;
							var pseudoValue = pseudo[3]? pseudo[3] : null;
							matchingElms = getElementsByPseudo(matchingElms, pseudoClass, pseudoValue);
							clearAdded(matchingElms);
						}
						prevElm = matchingElms;
					}
				}
				elm = pushAll(elm, prevElm);
			}
			return elm;
		},
		
		cssByXpath : function (cssRule) {
			var ns = { xhtml: "http://www.w3.org/1999/xhtml" };
			var prefix = (document.documentElement.namespaceURI === ns.xhtml)? "xhtml:" : "";
			var nsResolver = function lookupNamespaceURI (prefix) {
				return ns[prefix] || null;
			};
			DOMAssistant.cssByXpath = function (cssRule) {
				if (/:checked/.test(cssRule)) {
					return DOMAssistant.cssByDOM.call(this, cssRule);
				}
				var cssRules = cssRule.replace(/\s*(,)\s*/g, "$1").split(",");
				var elm = new HTMLArray();
				var currentRule, identical, cssSelectors, xPathExpression, cssSelector, splitRule, sequence;
				var cssSelectorRegExp = /^(\w+)?(#[\w\u00C0-\uFFFF\-\_]+|(\*))?((\.[\w\u00C0-\uFFFF\-_]+)*)?((\[\w+(\^|\$|\*|\||~)?(=([\w\u00C0-\uFFFF\s\-\_\.]+|"[^"]*"|'[^']*'))?\]+)*)?(((:\w+[\w\-]*)(\((odd|even|\-?\d*n?((\+|\-)\d+)?|[\w\u00C0-\uFFFF\-_\.]+|"[^"]*"|'[^']*'|((\w*\.[\w\u00C0-\uFFFF\-_]+)*)?|(\[#?\w+(\^|\$|\*|\||~)?=?[\w\u00C0-\uFFFF\s\-\_\.]+\]+)|(:\w+[\w\-]*))\))?)*)?(>|\+|~)?/;
				var selectorSplitRegExp = new RegExp("(?:\\[[^\\[]*\\]|\\(.*\\)|[^\\s\\+>~\\[\\(])+|[\\+>~]", "g");
				function attrToXPath (match, p1, p2, p3) {
					p3 = p3? p3.replace(/^["'](.*)["']$/, "$1") : p3;
					switch (p2) {
						case "^": return "starts-with(@" + p1 + ", \"" + p3 + "\")";
						case "$": return "substring(@" + p1 + ", (string-length(@" + p1 + ") - " + (p3.length - 1) + "), " + p3.length + ") = \"" + p3 + "\"";
						case "*": return "contains(concat(\" \", @" + p1 + ", \" \"), \"" + p3 + "\")";
						case "|": return "(@" + p1 + "=\"" + p3 + "\" or starts-with(@" + p1 + ", \"" + p3 + "-\"))";
						case "~": return "contains(concat(\" \", @" + p1 + ", \" \"), \" " + p3 + " \")";
						default: return "@" + p1 + (p3? "=\"" + p3 + "\"" : "");
					}
				}
				function pseudoToXPath (tag, pseudoClass, pseudoValue) {
					tag = /\-child$/.test(pseudoClass)? "*" : tag;
					var xpath = "", pseudo = pseudoClass.split("-");
					switch (pseudo[0]) {
						case "first":
							xpath = "not(preceding-sibling::" + tag + ")";
							break;
						case "last":
							xpath = "not(following-sibling::" + tag + ")";
							break;
						case "only":
							xpath = "not(preceding-sibling::" + tag + " or following-sibling::" + tag + ")";
							break;
						case "nth":
							if (!/^n$/.test(pseudoValue)) {
								var position = ((pseudo[1] === "last")? "(count(following-sibling::" : "(count(preceding-sibling::") + tag + ") + 1)";
								sequence = DOMAssistant.getSequence.call(this, pseudoValue);
								if (sequence) {
									if (sequence.start === sequence.max) {
										xpath = position + " = " + sequence.start;
									}
									else {
										xpath = position + " mod " + sequence.add + " = " + sequence.modVal + ((sequence.start > 1)? " and " + position + " >= " + sequence.start : "") + ((sequence.max > 0)? " and " + position + " <= " + sequence.max: "");
									}
								}
							}
							break;
						case "empty":
							xpath = "count(child::*) = 0 and string-length(text()) = 0";
							break;
						case "contains":
							xpath = "contains(., \"" + pseudoValue.replace(/^["'](.*)["']$/, "$1") + "\")";
							break;
						case "enabled":
							xpath = "not(@disabled)";
							break;
						case "disabled":
							xpath = "@disabled";
							break;
						case "target":
							var hash = document.location.hash.slice(1);
							xpath = "@name=\"" + hash + "\" or @id=\"" + hash + "\"";
							break;
						case "not":
							if (/^(:\w+[\w\-]*)$/.test(pseudoValue)) {
								xpath = "not(" + pseudoToXPath(tag, pseudoValue.slice(1)) + ")";
							}
							else {
								pseudoValue = pseudoValue.replace(/^\[#([\w\u00C0-\uFFFF\-\_]+)\]$/, "[id=$1]");
								var notSelector = pseudoValue.replace(/^(\w+)/, "self::$1");
								notSelector = notSelector.replace(/^\.([\w\u00C0-\uFFFF\-_]+)/g, "contains(concat(\" \", @class, \" \"), \" $1 \")");
								notSelector = notSelector.replace(/\[(\w+)(\^|\$|\*|\||~)?=?([\w\u00C0-\uFFFF\s\-_\.]+)?\]/g, attrToXPath);
								xpath = "not(" + notSelector + ")";
							}
							break;
						default:
							xpath = "@" + pseudoClass + "=\"" + pseudoValue + "\"";
							break;
					}
					return xpath;
				}
				for (var i=0; (currentRule=cssRules[i]); i++) {
					if (i > 0) {
						identical = false;
						for (var x=0, xl=i; x<xl; x++) {
							if (cssRules[i] === cssRules[x]) {
								identical = true;
								break;
							}
						}
						if (identical) {
							continue;
						}
					}
					cssSelectors = currentRule.match(selectorSplitRegExp);
					xPathExpression = ".";
					for (var j=0, jl=cssSelectors.length; j<jl; j++) {
						cssSelector = cssSelectorRegExp.exec(cssSelectors[j]);
						splitRule = {
							tag : prefix + ((!cssSelector[1] || cssSelector[3] === "*")? "*" : cssSelector[1]),
							id : (cssSelector[3] !== "*")? cssSelector[2] : null,
							allClasses : cssSelector[4],
							allAttr : cssSelector[6],
							allPseudos : cssSelector[11],
							tagRelation : cssSelector[23]
						};
						if (splitRule.tagRelation) {
							switch (splitRule.tagRelation) {
								case ">":
									xPathExpression += "/child::";
									break;
								case "+":
									xPathExpression += "/following-sibling::*[1]/self::";
									break;
								case "~":
									xPathExpression += "/following-sibling::";
									break;
							}
						}
						else {
							xPathExpression += (j > 0 && /(>|\+|~)/.test(cssSelectors[j-1]))? splitRule.tag : ("/descendant::" + splitRule.tag);
						}
						if (splitRule.id) {
							xPathExpression += "[@id = \"" + splitRule.id.replace(/^#/, "") + "\"]";
						}
						if (splitRule.allClasses) {
							xPathExpression += splitRule.allClasses.replace(/\.([\w\u00C0-\uFFFF\-_]+)/g, "[contains(concat(\" \", @class, \" \"), \" $1 \")]");
						}
						if (splitRule.allAttr) {
							xPathExpression += splitRule.allAttr.replace(/(\w+)(\^|\$|\*|\||~)?=?([\w\u00C0-\uFFFF\s\-_\.]+|"[^"]*"|'[^']*')?/g, attrToXPath);
						}
						if (splitRule.allPseudos) {
							var pseudoSplitRegExp = /:(\w[\w\-]*)(\(([^\)]+)\))?/;
							var allPseudos = splitRule.allPseudos.match(/(:\w+[\w\-]*)(\([^\)]+\))?/g);
							for (var k=0, kl=allPseudos.length; k<kl; k++) {
								var pseudo = allPseudos[k].match(pseudoSplitRegExp);
								var pseudoClass = pseudo[1]? pseudo[1].toLowerCase() : null;
								var pseudoValue = pseudo[3]? pseudo[3] : null;
								var xpath = pseudoToXPath(splitRule.tag, pseudoClass, pseudoValue);
								if (xpath.length) {
									xPathExpression += "[" + xpath + "]";
								}
							}
						}
					}
					var xPathNodes = document.evaluate(xPathExpression, this, nsResolver, 0, null), node;
					while ((node = xPathNodes.iterateNext())) {
						elm.push(node);
					}
				}
				return elm;
			};
			return DOMAssistant.cssByXpath.call(this, cssRule);
		},
		
		cssSelection : function (cssRule) {
			DOMAssistant.cssSelection = document.evaluate? DOMAssistant.cssByXpath : DOMAssistant.cssByDOM;
			if (document.querySelectorAll) {
				var cssSelectionBackup = DOMAssistant.cssSelection;
				DOMAssistant.cssSelection = function (cssRule) {
					try {
						var elm = new HTMLArray();
						return pushAll(elm, this.querySelectorAll(cssRule));
					}
					catch (e) {
						return cssSelectionBackup.call(this, cssRule);
					}
				};
			}
			return DOMAssistant.cssSelection.call(this, cssRule);
		},
		
		cssSelect : function (cssRule) {
			return DOMAssistant.cssSelection.call(this, cssRule);
		},
		
		elmsByClass : function (className, tag) {
			var cssRule = (tag || "") + "." + className;
			return DOMAssistant.cssSelection.call(this, cssRule);
		},
		
		elmsByAttribute : function (attr, attrVal, tag, substrMatchSelector) {
			var cssRule = (tag || "") + "[" + attr + ((attrVal && attrVal !== "*")? ((substrMatchSelector || "") + "=" + attrVal + "]") : "]");
			return DOMAssistant.cssSelection.call(this, cssRule);
		},
		
		elmsByTag : function (tag) {
			return DOMAssistant.cssSelection.call(this, tag);
		}
	};
}();
DOMAssistant.initCore();
DOMAssistant.AJAX = function () {
	var globalXMLHttp = null;
	var readyState = 0;
	var status = -1;
	var statusText = "";
	var createAjaxObj = function (url, method, callback, addToContent) {
		var params = null;
		if (/POST/i.test(method)) {
			url = url.split("?");
			params = url[1];
			url = url[0];
		}
		return {
			url : url,
			method : method,
			callback : callback,
			params : params,
			headers : {},
			responseType : "text",
			addToContent : addToContent || false
		};
	};
	return {
		publicMethods : [
			"ajax",
			"get",
			"post",
			"load",
			"replaceWithAJAXContent"
		],
		
		initRequest : function () {
			var XMLHttp = null;
			if (typeof XMLHttpRequest !== "undefined") {
				XMLHttp = new XMLHttpRequest();
				DOMAssistant.AJAX.initRequest = function () {
					return new XMLHttpRequest();
				};
			}
			else if (typeof window.ActiveXObject !== "undefined") {
				var XMLHttpMS = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
				for (var i=0; i<XMLHttpMS.length; i++) {
					try {
						XMLHttp = new window.ActiveXObject(XMLHttpMS[i]);
						DOMAssistant.AJAX.initRequest = function () {
							return new window.ActiveXObject(XMLHttpMS[i]);
						};
						break;
					}
					catch (e) {
						XMLHttp = null;
					}
				}
			}
			return XMLHttp;
		},
		
		ajax : function (ajaxObj) {
			if (!ajaxObj.noParse && ajaxObj.url && /\?/.test(ajaxObj.url) && ajaxObj.method && /POST/i.test(ajaxObj.method)) {
				var url = ajaxObj.url.split("?");
				ajaxObj.url = url[0];
				ajaxObj.params = url[1] + ((url[1].length > 0 && ajaxObj.params)? ("&" + ajaxObj.params) : "");
			}
			return DOMAssistant.AJAX.makeCall.call(this, ajaxObj);
		},
	
		get : function (url, callback, addToContent) {
			var ajaxObj = createAjaxObj(url, "GET", callback, addToContent);
			return DOMAssistant.AJAX.makeCall.call(this, ajaxObj);
		},
		
		post : function (url, callback) {
			var ajaxObj = createAjaxObj(url, "POST", callback);
			return DOMAssistant.AJAX.makeCall.call(this, ajaxObj);
		},
		
		load : function (url, addToContent) {
			DOMAssistant.AJAX.get.call(this, url, DOMAssistant.AJAX.replaceWithAJAXContent, addToContent);
		},
		
		makeCall : function (ajaxObj) {
			var XMLHttp = DOMAssistant.AJAX.initRequest();
			if (XMLHttp) {
				globalXMLHttp = XMLHttp;
				var ajaxCall = function (elm) {
					var url = ajaxObj.url;
					var method = ajaxObj.method || "GET";
					var callback = ajaxObj.callback;
					var params = ajaxObj.params;
					var headers = ajaxObj.headers;
					var responseType = ajaxObj.responseType || "text";
					var addToContent = ajaxObj.addToContent;
					XMLHttp.open(method, url, true);
					XMLHttp.setRequestHeader("AJAX", "true");
					XMLHttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
					if (method === "POST") {
						var contentLength = params? params.length : 0;
						XMLHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
						XMLHttp.setRequestHeader("Content-length", contentLength);
						if (XMLHttp.overrideMimeType) {
							XMLHttp.setRequestHeader("Connection", "close");
						}
					}
					for (var i in headers) {
						if (typeof i === "string") {
							XMLHttp.setRequestHeader(i, headers[i]);
						}
					}
					if (typeof callback === "function") {
						XMLHttp.onreadystatechange = function () {
							if (XMLHttp.readyState === 4) {
								var response = /xml/i.test(responseType)? XMLHttp.responseXML : XMLHttp.responseText;
								callback.call(elm, response, addToContent);
								readyState = 4;
								status = XMLHttp.status;
								statusText = XMLHttp.statusText;
								globalXMLHttp = null;
								XMLHttp = null;
							}
						};
					}
					XMLHttp.send(params);
				}(this);
			}
			return this;
		},
		
		replaceWithAJAXContent : function (content, add) {
			if (add) {
				this.innerHTML += content;
			}
			else {
				var elms = this.all || this.getElementsByTagName("*");
				for (var i=0, elm, attr; (elm=elms[i]); i++) {
					attr = elm.attributes;
					if (attr) {
						for (var j=0, jl=attr.length, att; j<jl; j++) {
							att = attr[j].nodeName.toLowerCase();
							if (typeof elm[att] === "function") {
								elm[att] = null;
							}
						}
					}
				}
				this.innerHTML = content;
			}
		},
		
		getReadyState : function () {
			return (globalXMLHttp && typeof globalXMLHttp.readyState !== "undefined")? globalXMLHttp.readyState : readyState;
		},
		
		getStatus : function () {
			return status;
		},
		
		getStatusText : function () {
			return statusText;
		}
	};
}();
DOMAssistant.attach(DOMAssistant.AJAX);
DOMAssistant.CSS = function () {
	return {
		addClass : function (className) {
			var currentClass = this.className;
			if (!new RegExp(("(^|\\s)" + className + "(\\s|$)"), "i").test(currentClass)) {
				this.className = currentClass + (currentClass.length? " " : "") + className;
			}
			return this;
		},

		removeClass : function (className) {
			var classToRemove = new RegExp(("(^|\\s)" + className + "(\\s|$)"), "i");
			this.className = this.className.replace(classToRemove, function (match) {
				var retVal = "";
				if (new RegExp("^\\s+.*\\s+$").test(match)) {
					retVal = match.replace(/(\s+).+/, "$1");
				}
				return retVal;
			}).replace(/^\s+|\s+$/g, "");
			return this;
		},
		
		replaceClass : function (className, newClass) {
			var classToRemove = new RegExp(("(^|\\s)" + className + "(\\s|$)"), "i");
			this.className = this.className.replace(classToRemove, function (match, p1, p2) {
				var retVal = p1 + newClass + p2;
				if (new RegExp("^\\s+.*\\s+$").test(match)) {
					retVal = match.replace(/(\s+).+/, "$1");
				}
				return retVal;
			}).replace(/^\s+|\s+$/g, "");
			return this;
		},

		hasClass : function (className) {
			return new RegExp(("(^|\\s)" + className + "(\\s|$)"), "i").test(this.className);
		},
		
		setStyle : function (style, value) {
			if (typeof this.style.cssText !== "undefined") {
				var styleToSet = this.style.cssText;
				if (typeof style === "object") {
					for (var i in style) {
						if (typeof i === "string") {
							styleToSet += ";" + i + ":" + style[i];
						}
					}
				}
				else {
					styleToSet += ";" + style + ":" + value;
				}
				this.style.cssText = styleToSet;
			}
			return this;
		},

		getStyle : function (cssRule) {
			var cssVal = "";
			if (document.defaultView && document.defaultView.getComputedStyle) {
				cssVal = document.defaultView.getComputedStyle(this, "").getPropertyValue(cssRule);
			}
			else if (this.currentStyle) {
				cssVal = cssRule.replace(/\-(\w)/g, function (match, p1) {
					return p1.toUpperCase();
				});
				cssVal = this.currentStyle[cssVal];
			}
			return cssVal;
		}
	};
}();
DOMAssistant.attach(DOMAssistant.CSS);
DOMAssistant.Content = function () {
	return {
		prev : function () {
			var prevSib = this;
			while ((prevSib = prevSib.previousSibling) && prevSib.nodeType !== 1) {}
			return DOMAssistant.$(prevSib);
		},

		next : function () {
			var nextSib = this;
			while ((nextSib = nextSib.nextSibling) && nextSib.nodeType !== 1) {}
			return DOMAssistant.$(nextSib);
		},

		create : function (name, attr, append, content) {
			var elm = DOMAssistant.$(document.createElement(name));
			if (attr) {
				elm = elm.setAttributes(attr);
			}
			if (typeof content !== "undefined") {
				elm.addContent(content);
			}
			if (append) {
				DOMAssistant.Content.addContent.call(this, elm);
			}
			return elm;
		},

		setAttributes : function (attr) {
			if (DOMAssistant.isIE) {
				var setAttr = function (elm, att, val) {
					var attLower = att.toLowerCase();
					switch (attLower) {
						case "name":
						case "type":
							return document.createElement(elm.outerHTML.replace(new RegExp(attLower + "=[a-zA-Z]+"), " ").replace(">", " " + attLower + "=" + val + ">"));
						case "style":
							elm.style.cssText = val;
							return elm;
						default:
							elm[DOMAssistant.camel[attLower] || att] = val;
							return elm;
					}
				};
				DOMAssistant.Content.setAttributes = function (attr) {
					var elem = this;
					var parent = this.parentNode;
					for (var i in attr) {
						if (typeof attr[i] === "string" || typeof attr[i] === "number") {
							var newElem = setAttr(elem, i, attr[i]);
							if (parent && /(name|type)/i.test(i)) {
								if (elem.innerHTML) {
									newElem.innerHTML = elem.innerHTML;
								}
								parent.replaceChild(newElem, elem);
							}
							elem = newElem;
						}
					}
					return DOMAssistant.$(elem);
				};
			}
			else {
				DOMAssistant.Content.setAttributes = function (attr) {
					for (var i in attr) {
						if (/class/i.test(i)) {
							this.className = attr[i];
						}
						else {
							this.setAttribute(i, attr[i]);
						}
					}
					return this;
				};
			}
			return DOMAssistant.Content.setAttributes.call(this, attr); 
		},

		addContent : function (content) {
			var type = typeof content;
			if (type === "string" || type === "number") {
				this.innerHTML += content;
			}
			else if (type === "object" || (type === "function" && typeof content.nodeName !== "undefined")) {
				this.appendChild(content);
			}
			return this;
		},

		replaceContent : function (content) {
			var children = this.all || this.getElementsByTagName("*");
			for (var i=0, child, attr; (child=children[i]); i++) {
				attr = child.attributes;
				if (attr) {
					for (var j=0, jl=attr.length, att; j<jl; j++) {
						att = attr[j].nodeName.toLowerCase();
						if (typeof child[att] === "function") {
							child[att] = null;
						}
					}
				}
			}
			while (this.hasChildNodes()) {
				this.removeChild(this.firstChild);
			}
			DOMAssistant.$(this).addContent(content);
			return this;
		},

		replace : function (content, returnNew) {
			var type = typeof content;
			if (type === "string" || type === "number") {
				var parent = this.parentNode;
				var tmp = DOMAssistant.$(parent).create("div", null, false, content);
				for (var i=tmp.childNodes.length-1; i>=0; i--) {
					parent.insertBefore(tmp.childNodes[i], this.nextSibling);
				}
				content = this.nextSibling;
				parent.removeChild(this);
			}
			else if (type === "object" || (type === "function" && typeof content.nodeName !== "undefined")) {
				this.parentNode.replaceChild(content, this);
			}
			return returnNew? content : this;
		},

		remove : function () {
			this.parentNode.removeChild(this);
			return null;
		}
	};
}();
DOMAssistant.attach(DOMAssistant.Content);
DOMAssistant.Events = function () {
	var uniqueHandlerId = 1;
	return {
		publicMethods : [
			"triggerEvent",
			"addEvent",
			"removeEvent",
			"preventDefault",
			"cancelBubble"
		],
		
		init : function () {
			window.addEvent = this.addEvent;
			window.removeEvent = this.removeEvent;
			DOMAssistant.preventDefault = this.preventDefault;
			DOMAssistant.cancelBubble = this.cancelBubble;
		},

		triggerEvent : function (evt, target) {
			if (this.events && this.events[evt]) {
				// Create synthetic event
				var event = {
					type: evt,
					target: target || this,
					currentTarget: this,
					bubbles: false,
					cancelable: false,
					preventDefault: function(){},
					stopPropagation: function(){},
					timeStamp: +new Date()
				};
				for (var i=0, iL=this.events[evt].length; i<iL; i++) {
					this.events[evt][i].call(this, event);
				}
			}
			return this;
		},

		addEvent : function (evt, func) {
			var XULEvent = /^DOM/.test(evt);
			if (XULEvent) {
				if (this.addEventListener) {
					this.addEventListener(evt, func, false);
				}
			}
			else {
				if (!this.uniqueHandlerId) {
					this.uniqueHandlerId = uniqueHandlerId++;
				}
				if (!(func.attachedElements && func.attachedElements[evt + this.uniqueHandlerId])) {
					if (!this.events) {
						this.events = {};
					}
					if (!this.events[evt]) {
						this.events[evt] = [];
						var existingEvent = this["on" + evt];
						if (existingEvent) {
							this.events[evt].push(existingEvent);
						}
					}
					this.events[evt].push(func);
					this["on" + evt] = DOMAssistant.Events.handleEvent;
					if (typeof this.window === "object") {
						this.window["on" + evt] = DOMAssistant.Events.handleEvent;
					}
					if (!func.attachedElements) {
						func.attachedElements = {};
					}
					func.attachedElements[evt + this.uniqueHandlerId] = true;
				}
			}
			return this;
		},

		handleEvent : function (evt) {
			var currentEvt = evt || event;
			var currentTarget = currentEvt.target || currentEvt.srcElement || document;
			while (currentTarget.nodeType !== 1 && currentTarget.parentNode) {
				currentTarget = currentTarget.parentNode;
			}
			currentEvt.eventTarget = currentTarget;
			var eventColl = this.events[currentEvt.type].slice(0);
			var eventCollLength = eventColl.length - 1;
			if (eventCollLength !== -1) {
				for (var i=0; i<eventCollLength; i++) {
					eventColl[i].call(this, currentEvt);
				}
				return eventColl[i].call(this, currentEvt);
			}
		},

		removeEvent : function (evt, func) {
			if (this.events) {
				var eventColl = this.events[evt];
				for (var i=0; i<eventColl.length; i++) {
					if (eventColl[i] === func) {
						delete eventColl[i];
						eventColl.splice(i, 1);
					}
				}
				func.attachedElements[evt + this.uniqueHandlerId] = null;
			}
			return this;
		},

		preventDefault : function (evt) {
			if (evt && evt.preventDefault) {
				DOMAssistant.Events.preventDefault = function (evt) {
					evt.preventDefault();
				};
			}
			else {
				DOMAssistant.Events.preventDefault = function (evt) {
					event.returnValue = false;
				};
			}
			return DOMAssistant.Events.preventDefault(evt);
		},

		cancelBubble : function (evt) {
			if (evt && evt.stopPropagation) {
				DOMAssistant.Events.cancelBubble = function (evt) {
					evt.stopPropagation();
				};
			}
			else {
				DOMAssistant.Events.cancelBubble = function (evt) {
					event.cancelBubble = true;
				};
			}
			return DOMAssistant.Events.cancelBubble(evt);
		}
	};
}();
DOMAssistant.attach(DOMAssistant.Events);
DOMAssistant.DOMLoad = function () {
	var DOMLoaded = false;
	var DOMLoadTimer = null;
	var functionsToCall = [];
	var addedStrings = {};
	var errorHandling = null;
	var execFunctions = function () {
		for (var i=0, il=functionsToCall.length; i<il; i++) {
			try {
				functionsToCall[i]();
			}
			catch (e) {
				if (errorHandling && typeof errorHandling === "function") {
					errorHandling(e);
				}
			}
		}
		functionsToCall = [];
	};
	var DOMHasLoaded = function () {
		if (DOMLoaded) {
			return;
		}
		DOMLoaded = true;
		execFunctions();
	};
	/* Internet Explorer */
	/*@cc_on
	@if (@_win32 || @_win64)
		if (document.getElementById) {
			document.write("<script id=\"ieScriptLoad\" defer src=\"//:\"><\/script>");
			document.getElementById("ieScriptLoad").onreadystatechange = function() {
				if (this.readyState === "complete") {
					DOMHasLoaded();
				}
			};
		}
	@end @*/
	/* Mozilla/Opera 9 */
	if (document.addEventListener) {
		document.addEventListener("DOMContentLoaded", DOMHasLoaded, false);
	}
	/* Safari, iCab, Konqueror */
	if (/KHTML|WebKit|iCab/i.test(navigator.userAgent)) {
		DOMLoadTimer = setInterval(function () {
			if (/loaded|complete/i.test(document.readyState)) {
				DOMHasLoaded();
				clearInterval(DOMLoadTimer);
			}
		}, 10);
	}
	/* Other web browsers */
	window.onload = DOMHasLoaded;
	
	return {
		DOMReady : function () {
			for (var i=0, il=arguments.length, funcRef; i<il; i++) {
				funcRef = arguments[i];
				if (!funcRef.DOMReady && !addedStrings[funcRef]) {
					if (typeof funcRef === "string") {
						addedStrings[funcRef] = true;
						funcRef = new Function(funcRef);
					}
					funcRef.DOMReady = true;
					functionsToCall.push(funcRef);
				}
			}
			if (DOMLoaded) {
				execFunctions();
			}
		},
		
		setErrorHandling : function (funcRef) {
			errorHandling = funcRef;
		}
	};
}();
DOMAssistant.DOMReady = DOMAssistant.DOMLoad.DOMReady;