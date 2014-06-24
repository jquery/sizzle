/*!
  * qwery.js - copyright @dedfat
  * https://github.com/ded/qwery
  * Follow our software http://twitter.com/dedfat
  * MIT License
  */
!function (context, doc) {

  function array(ar) {
    var i, len, r = [];
    for (i = 0, len = ar.length; i < len; i++) {
      r[i] = ar[i];
    }
    return r;
  }

  function iter(obj) {
    this.obj = array(obj);
  }

  iter.prototype = {
    each: function (fn) {
      for (var i = 0; i  < this.obj.length; i ++) {
        fn.call(this.obj[i], this.obj[i], i, this.obj);
      }
      return this;
    },

    map: function (fn) {
      var collection = [], i;
      for (i = 0; i  < this.obj.length; i ++) {
        collection[i] = fn.call(this.obj[i], this.obj[i], i, this.obj);
      }
      return collection;
    }
  };

  function _(obj) {
    return new iter(obj);
  }

  var id = /#([\w\-]+)/,
      clas = /\.[\w\-]+/g,
      idOnly = /^#([\w\-]+$)/,
      html = document.getElementsByTagName('html')[0],
      simple = /^([a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/,
      attr = /\[([\w\-]+)(?:([\^\$\*]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/;
  function q(query) {
    return query.match(new RegExp(simple.source + '(' + attr.source + ')?'));
  }

  function interpret(token, el) {
    var whole = token[0],
        tag = token[1],
        idsAndClasses = token[2],
        wholeAttribute = token[3],
        attribute = token[4],
        qualifier = token[5],
        value = token[6],
        v, c, i, m, classes;
    if (tag && el.tagName.toLowerCase() !== tag) {
      return false;
    }
    if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== el.id) {
      return false;
    }
    if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
      for (i = 0; i < classes.length; i++) {
        if (!(new RegExp('(^|\\s+)' + classes[i].slice(1) + '(\\s+|$)')).test(el.className)) {
          return false;
        }
      }
    }
    if (wholeAttribute && !value) {
      var o = el.attributes, k;
      for (k in o) {
        if (o.hasOwnProperty(k) && o[k].name == attribute) {
          return el;
        }
      }
    }

    if (wholeAttribute && !checkAttr(qualifier, el.getAttribute(attribute) || '', value)) {
      return false;
    }
    return el;
  }

  function loopAll(token) {
    var i, item, r = [], intr = q(token), tag = intr[1] || '*',
        els = document.getElementsByTagName(tag);
    for (i = 0; i < els.length; i++) {
      el = els[i];
      if (item = interpret(intr, el)) {
        r.push(item);
      }
    }
    return r;
  }

  function getTokens(input) {
    var r = [],
        temp = [],
        catting = false;
    _(input.split(/\s+/)).each(function (m) {
      if (catting) {
        temp.push(m);
        if (/\]/.test(m)) {
          catting = false;
          r = r.concat(temp.join(' '));
        }
      } else if (/\[[^\]]*$/.test(m)) {
        catting = true;
        temp = [];
        temp.push(m);
      } else {
        r.push(m);
      }

    });
    return r;
  }

  function clean(s) {
    return s.replace(/([\.\*\+\?\^\$\{\}\(\)\|\[\]\/\\])/g, '\\$1');
  }

  function checkAttr(qualify, actual, val) {
    switch (qualify) {
    case '=':
      return actual == val;
    case '^=':
      return actual.match(new RegExp('^' + clean(val)));
    case '$=':
      return actual.match(new RegExp(clean(val) + '$'));
    case '*=':
      return actual.match(new RegExp(clean(val)));
    }
    return false;
  }

  function _qwery(selector) {
    var r = [], context, token, i, j, k, p, ret = [],
        el, node, found = true;
    var tokens = getTokens(selector);
    if (!tokens.length) {
      return r;
    }
    r = loopAll(tokens.pop());
    if (!tokens.length) {
      return r;
    }
    // loop through all found base elements
    for (j = r.length; j--;) {
      node = r[j];
      p = node;
      // loop through each token
      for (i = tokens.length; i--;) {
        found = false;
        parents:
        while (p !== html && (p = p.parentNode)) { // loop through parent nodes
          if (interpret(q(tokens[i]), p)) {
            found = true;
            break parents;
          }
        }
      }
      found && ret.push(node);
    }
    return ret;
  }

  function isAncestor(child, parent) {
    if (!parent || !child || parent == child) {
      return false;
    }
    if (parent.contains && child.nodeType) {
      return parent.contains(child);
    }
    else if (parent.compareDocumentPosition && child.nodeType) {
      return !!(parent.compareDocumentPosition(child) & 16);
    }
    return false;
  }

  var qwery = function () {
    // exception for pure classname selectors (it's faster)
    var clas = /^\.([\w\-]+)$/, m;
    function qsa(selector, root) {
      var root = (typeof root == 'string') ? document.querySelector(root) : root, i;
      if (i = selector.match(idOnly)) {
        return [document.getElementById(i[1])];
      }
      // taking for granted that every browser that supports qsa, also supports getElsByClsName
      if (m = selector.match(clas)) {
        return array((root || document).getElementsByClassName(m[1]), 0);
      }
      return array((root || document).querySelectorAll(selector), 0);
    }

    // return fast
    if (document.querySelector && document.querySelectorAll) {
      return qsa;
    }

    return function (selector, root) {
      var root = (typeof root == 'string') ? qwery(root)[0] : (root || document), i;
      if (i = selector.match(idOnly)) {
        return [document.getElementById(i[1])];
      }
      var result = [],
          // here we allow combinator selectors: $('div,span');
          collections = _(selector.split(',')).map(function (selector) {
            return _qwery(selector);
          });

      _(collections).each(function (collection) {
        var ret = collection;
        // allow contexts
        if (root !== document) {
          ret = [];
          _(collection).each(function (element) {
            // make sure element is a descendent of root
            isAncestor(element, root) && ret.push(element);
          });
        }
        result = result.concat(ret);
      });
      return result;
    };
  }();

  // being nice
  var oldQwery = context.qwery;
  qwery.noConflict = function () {
    context.qwery = oldQwery;
    return this;
  };
  context.qwery = qwery;

}(this, document);
