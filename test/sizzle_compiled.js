var n = !0, o = null, p = !1;
(function() {
  function d(b, c, e) {
    for(var f, g = [], h = "", c = c.nodeType ? [c] : c;f = k.match.PSEUDO.exec(b);) {
      h += f[0], b = b.replace(k.match.PSEUDO, "")
    }
    b = k.c[b] ? b + "*" : b;
    f = 0;
    for(var d = c.length;f < d;f++) {
      j(b, c[f], g, e)
    }
    return j.filter(h, g)
  }
  function l(b, c) {
    b = Array.prototype.slice.call(b, 0);
    return c ? (c.push.apply(c, b), c) : b
  }
  function r(b, c) {
    return"\\" + (c - 0 + 1)
  }
  function j(b, c, e, f) {
    var e = e || [], g = c = c || document;
    if(1 !== c.nodeType && 9 !== c.nodeType) {
      return[]
    }
    if(!b || "string" !== typeof b) {
      return e
    }
    var h, u, i, G, r, s = n, v = j.d(c), m = [], w = b;
    do {
      if(H.exec(""), h = H.exec(w)) {
        if(w = h[3], m.push(h[1]), h[2]) {
          G = h[3];
          break
        }
      }
    }while(h);
    if(1 < m.length && K.exec(b)) {
      if(2 === m.length && k.c[m[0]]) {
        u = d(m[0] + m[1], c, f)
      }else {
        for(u = k.c[m[0]] ? [c] : j(m.shift(), c);m.length;) {
          b = m.shift(), k.c[b] && (b += m.shift()), u = d(b, u, f)
        }
      }
    }else {
      if(!f && 1 < m.length && 9 === c.nodeType && !v && k.match.ID.test(m[0]) && !k.match.ID.test(m[m.length - 1]) && (h = j.find(m.shift(), c, v), c = h.b ? j.filter(h.b, h.set)[0] : h.set[0]), c) {
        h = f ? {b:m.pop(), set:l(f)} : j.find(m.pop(), 1 === m.length && ("~" === m[0] || "+" === m[0]) && c.parentNode ? c.parentNode : c, v);
        u = h.b ? j.filter(h.b, h.set) : h.set;
        for(0 < m.length ? i = l(u) : s = p;m.length;) {
          h = r = m.pop(), k.c[r] ? h = m.pop() : r = "", h == o && (h = c), k.c[r](i, h, v)
        }
      }else {
        i = []
      }
    }
    i || (i = u);
    i || j.error(r || b);
    if("[object Array]" === L.call(i)) {
      if(s) {
        if(c && 1 === c.nodeType) {
          for(b = 0;i[b] != o;b++) {
            i[b] && (i[b] === n || 1 === i[b].nodeType && j.contains(c, i[b])) && e.push(u[b])
          }
        }else {
          for(b = 0;i[b] != o;b++) {
            i[b] && 1 === i[b].nodeType && e.push(u[b])
          }
        }
      }else {
        e.push.apply(e, i)
      }
    }else {
      l(i, e)
    }
    G && (j(G, g, e, f), j.n(e));
    return e
  }
  function M(b, c, e, f, g, h) {
    for(var g = 0, d = f.length;g < d;g++) {
      var i = f[g];
      if(i) {
        for(var j = p, i = i[b];i;) {
          if(i[x] === e) {
            j = f[i.i];
            break
          }
          1 === i.nodeType && !h && (i[x] = e, i.i = g);
          if(i.nodeName.toLowerCase() === c) {
            j = i;
            break
          }
          i = i[b]
        }
        f[g] = j
      }
    }
  }
  function N(b, c, e, f, g, h) {
    for(var g = 0, d = f.length;g < d;g++) {
      var i = f[g];
      if(i) {
        for(var k = p, i = i[b];i;) {
          if(i[x] === e) {
            k = f[i.i];
            break
          }
          if(1 === i.nodeType) {
            if(h || (i[x] = e, i.i = g), "string" !== typeof c) {
              if(i === c) {
                k = n;
                break
              }
            }else {
              if(0 < j.filter(c, [i]).length) {
                k = i;
                break
              }
            }
          }
          i = i[b]
        }
        f[g] = k
      }
    }
  }
  var H = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g, x = "sizcache" + (Math.random() + "").replace(".", ""), I = 0, L = Object.prototype.toString, D = p, O = n, z = /\\/g, P = /\r\n/g, E = /\W/;
  [0, 0].sort(function() {
    O = p;
    return 0
  });
  j.n = function(b) {
    if(F && (D = O, b.sort(F), D)) {
      for(var c = 1;c < b.length;c++) {
        b[c] === b[c - 1] && b.splice(c--, 1)
      }
    }
    return b
  };
  j.q = function(b, c) {
    return j(b, o, o, c)
  };
  j.matchesSelector = function(b, c) {
    return 0 < j(c, o, o, [b]).length
  };
  j.find = function(b, c, e) {
    var f, g, h, d, i, j;
    if(!b) {
      return[]
    }
    for(g = 0, h = k.h.length;g < h;g++) {
      if(i = k.h[g], d = k.g[i].exec(b)) {
        if(j = d[1], d.splice(1, 1), "\\" !== j.substr(j.length - 1) && (d[1] = (d[1] || "").replace(z, ""), f = k.find[i](d, c, e), f != o)) {
          b = b.replace(k.match[i], "");
          break
        }
      }
    }
    f || (f = "undefined" !== typeof c.getElementsByTagName ? c.getElementsByTagName("*") : []);
    return{set:f, b:b}
  };
  j.filter = function(b, c, e, f) {
    for(var g, h, d, i, l, r, s, v, m = b, w = [], y = c, x = c && c[0] && j.d(c[0]);b && c.length;) {
      for(d in k.filter) {
        if((g = k.g[d].exec(b)) != o && g[2]) {
          if(r = k.filter[d], l = g[1], h = p, g.splice(1, 1), "\\" !== l.substr(l.length - 1)) {
            y === w && (w = []);
            if(k.l[d]) {
              if(g = k.l[d](g, y, e, w, f, x)) {
                if(g === n) {
                  continue
                }
              }else {
                h = i = n
              }
            }
            if(g) {
              for(s = 0;(l = y[s]) != o;s++) {
                l && (i = r(l, g, s, y), v = f ^ i, e && i != o ? v ? h = n : y[s] = p : v && (w.push(l), h = n))
              }
            }
            if(void 0 !== i) {
              e || (y = w);
              b = b.replace(k.match[d], "");
              if(!h) {
                return[]
              }
              break
            }
          }
        }
      }
      if(b === m) {
        if(h == o) {
          j.error(b)
        }else {
          break
        }
      }
      m = b
    }
    return y
  };
  j.error = function(b) {
    throw Error("Syntax error, unrecognized expression: " + b);
  };
  var J = j.o = function(b) {
    var c, e;
    c = b.nodeType;
    var f = "";
    if(c) {
      if(1 === c || 9 === c) {
        if("string" === typeof b.textContent) {
          return b.textContent
        }
        if("string" === typeof b.innerText) {
          return b.innerText.replace(P, "")
        }
        for(b = b.firstChild;b;b = b.nextSibling) {
          f += J(b)
        }
      }else {
        if(3 === c || 4 === c) {
          return b.nodeValue
        }
      }
    }else {
      for(c = 0;e = b[c];c++) {
        8 !== e.nodeType && (f += J(e))
      }
    }
    return f
  }, k = j.m = {h:["ID", "NAME", "TAG"], match:{ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/, CLASS:/\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/, NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/, ATTR:/\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/, TAG:/^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/, CHILD:/:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/, POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/, 
  PSEUDO:/:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/}, g:{}, j:{"class":"className", "for":"htmlFor"}, e:{href:function(b) {
    return b.getAttribute("href")
  }, type:function(b) {
    return b.getAttribute("type")
  }}, c:{"+":function(b, c) {
    var e = "string" === typeof c, f = e && !E.test(c), e = e && !f;
    f && (c = c.toLowerCase());
    for(var f = 0, g = b.length, h;f < g;f++) {
      if(h = b[f]) {
        for(;(h = h.previousSibling) && 1 !== h.nodeType;) {
        }
        b[f] = e || h && h.nodeName.toLowerCase() === c ? h || p : h === c
      }
    }
    e && j.filter(c, b, n)
  }, ">":function(b, c) {
    var e, f = "string" === typeof c, g = 0, h = b.length;
    if(f && !E.test(c)) {
      for(c = c.toLowerCase();g < h;g++) {
        if(e = b[g]) {
          e = e.parentNode, b[g] = e.nodeName.toLowerCase() === c ? e : p
        }
      }
    }else {
      for(;g < h;g++) {
        (e = b[g]) && (b[g] = f ? e.parentNode : e.parentNode === c)
      }
      f && j.filter(c, b, n)
    }
  }, "":function(b, c, e) {
    var f, g = I++, h = N;
    "string" === typeof c && !E.test(c) && (f = c = c.toLowerCase(), h = M);
    h("parentNode", c, g, b, f, e)
  }, "~":function(b, c, e) {
    var f, g = I++, h = N;
    "string" === typeof c && !E.test(c) && (f = c = c.toLowerCase(), h = M);
    h("previousSibling", c, g, b, f, e)
  }}, find:{ID:function(b, c, e) {
    if("undefined" !== typeof c.getElementById && !e) {
      return(b = c.getElementById(b[1])) && b.parentNode ? [b] : []
    }
  }, NAME:function(b, c) {
    if("undefined" !== typeof c.getElementsByName) {
      for(var e = [], f = c.getElementsByName(b[1]), g = 0, h = f.length;g < h;g++) {
        f[g].getAttribute("name") === b[1] && e.push(f[g])
      }
      return 0 === e.length ? o : e
    }
  }, TAG:function(b, c) {
    if("undefined" !== typeof c.getElementsByTagName) {
      return c.getElementsByTagName(b[1])
    }
  }}, l:{CLASS:function(b, c, e, f, g, h) {
    b = " " + b[1].replace(z, "") + " ";
    if(h) {
      return b
    }
    for(var h = 0, d;(d = c[h]) != o;h++) {
      d && (g ^ (d.className && 0 <= (" " + d.className + " ").replace(/[\t\n\r]/g, " ").indexOf(b)) ? e || f.push(d) : e && (c[h] = p))
    }
    return p
  }, ID:function(b) {
    return b[1].replace(z, "")
  }, TAG:function(b) {
    return b[1].replace(z, "").toLowerCase()
  }, CHILD:function(b) {
    if("nth" === b[1]) {
      b[2] || j.error(b[0]);
      b[2] = b[2].replace(/^\+|\s*/g, "");
      var c = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec("even" === b[2] && "2n" || "odd" === b[2] && "2n+1" || !/\D/.test(b[2]) && "0n+" + b[2] || b[2]);
      b[2] = c[1] + (c[2] || 1) - 0;
      b[3] = c[3] - 0
    }else {
      b[2] && j.error(b[0])
    }
    b[0] = I++;
    return b
  }, ATTR:function(b, c, e, f, g, h) {
    c = b[1] = b[1].replace(z, "");
    !h && k.j[c] && (b[1] = k.j[c]);
    b[4] = (b[4] || b[5] || "").replace(z, "");
    "~=" === b[2] && (b[4] = " " + b[4] + " ");
    return b
  }, PSEUDO:function(b, c, e, f, g) {
    if("not" === b[1]) {
      if(1 < (H.exec(b[3]) || "").length || /^\w/.test(b[3])) {
        b[3] = j(b[3], o, o, c)
      }else {
        return b = j.filter(b[3], c, e, 1 ^ g), e || f.push.apply(f, b), p
      }
    }else {
      if(k.match.POS.test(b[0]) || k.match.CHILD.test(b[0])) {
        return n
      }
    }
    return b
  }, POS:function(b) {
    b.unshift(n);
    return b
  }}, f:{enabled:function(b) {
    return b.disabled === p && "hidden" !== b.type
  }, disabled:function(b) {
    return b.disabled === n
  }, checked:function(b) {
    return b.checked === n
  }, selected:function(b) {
    return b.selected === n
  }, parent:function(b) {
    return!!b.firstChild
  }, empty:function(b) {
    return!b.firstChild
  }, has:function(b, c, e) {
    return!!j(e[3], b).length
  }, header:function(b) {
    return/h\d/i.test(b.nodeName)
  }, text:function(b) {
    var c = b.getAttribute("type"), e = b.type;
    return"input" === b.nodeName.toLowerCase() && "text" === e && (c === e || c === o)
  }, radio:function(b) {
    return"input" === b.nodeName.toLowerCase() && "radio" === b.type
  }, checkbox:function(b) {
    return"input" === b.nodeName.toLowerCase() && "checkbox" === b.type
  }, file:function(b) {
    return"input" === b.nodeName.toLowerCase() && "file" === b.type
  }, password:function(b) {
    return"input" === b.nodeName.toLowerCase() && "password" === b.type
  }, submit:function(b) {
    var c = b.nodeName.toLowerCase();
    return("input" === c || "button" === c) && "submit" === b.type
  }, image:function(b) {
    return"input" === b.nodeName.toLowerCase() && "image" === b.type
  }, reset:function(b) {
    var c = b.nodeName.toLowerCase();
    return("input" === c || "button" === c) && "reset" === b.type
  }, button:function(b) {
    var c = b.nodeName.toLowerCase();
    return"input" === c && "button" === b.type || "button" === c
  }, input:function(b) {
    return/input|select|textarea|button/i.test(b.nodeName)
  }, focus:function(b) {
    return b === b.ownerDocument.activeElement
  }}, p:{first:function(b, c) {
    return 0 === c
  }, last:function(b, c, e, f) {
    return c === f.length - 1
  }, even:function(b, c) {
    return 0 === c % 2
  }, odd:function(b, c) {
    return 1 === c % 2
  }, lt:function(b, c, e) {
    return c < e[3] - 0
  }, gt:function(b, c, e) {
    return c > e[3] - 0
  }, nth:function(b, c, e) {
    return e[3] - 0 === c
  }, eq:function(b, c, e) {
    return e[3] - 0 === c
  }}, filter:{PSEUDO:function(b, c, e, f) {
    var g = c[1], h = k.f[g];
    if(h) {
      return h(b, e, c, f)
    }
    if("contains" === g) {
      return 0 <= (b.textContent || b.innerText || J([b]) || "").indexOf(c[3])
    }
    if("not" === g) {
      c = c[3];
      e = 0;
      for(f = c.length;e < f;e++) {
        if(c[e] === b) {
          return p
        }
      }
      return n
    }
    j.error(g)
  }, CHILD:function(b, c) {
    var e, f, g, h, d, i;
    e = c[1];
    i = b;
    switch(e) {
      case "only":
      ;
      case "first":
        for(;i = i.previousSibling;) {
          if(1 === i.nodeType) {
            return p
          }
        }
        if("first" === e) {
          return n
        }
        i = b;
      case "last":
        for(;i = i.nextSibling;) {
          if(1 === i.nodeType) {
            return p
          }
        }
        return n;
      case "nth":
        e = c[2];
        f = c[3];
        if(1 === e && 0 === f) {
          return n
        }
        g = c[0];
        if((h = b.parentNode) && (h[x] !== g || !b.k)) {
          d = 0;
          for(i = h.firstChild;i;i = i.nextSibling) {
            1 === i.nodeType && (i.k = ++d)
          }
          h[x] = g
        }
        i = b.k - f;
        return 0 === e ? 0 === i : 0 === i % e && 0 <= i / e
    }
  }, ID:function(b, c) {
    return 1 === b.nodeType && b.getAttribute("id") === c
  }, TAG:function(b, c) {
    return"*" === c && 1 === b.nodeType || !!b.nodeName && b.nodeName.toLowerCase() === c
  }, CLASS:function(b, c) {
    return-1 < (" " + (b.className || b.getAttribute("class")) + " ").indexOf(c)
  }, ATTR:function(b, c) {
    var e = c[1], e = j.attr ? j.attr(b, e) : k.e[e] ? k.e[e](b) : b[e] != o ? b[e] : b.getAttribute(e), f = e + "", g = c[2], h = c[4];
    return e == o ? "!=" === g : !g && j.attr ? e != o : "=" === g ? f === h : "*=" === g ? 0 <= f.indexOf(h) : "~=" === g ? 0 <= (" " + f + " ").indexOf(h) : !h ? f && e !== p : "!=" === g ? f !== h : "^=" === g ? 0 === f.indexOf(h) : "$=" === g ? f.substr(f.length - h.length) === h : "|=" === g ? f === h || f.substr(0, h.length + 1) === h + "-" : p
  }, POS:function(b, c, e, f) {
    var g = k.p[c[2]];
    if(g) {
      return g(b, e, c, f)
    }
  }}}, K = k.match.POS, B;
  for(B in k.match) {
    k.match[B] = RegExp(k.match[B].source + /(?![^\[]*\])(?![^\(]*\))/.source), k.g[B] = RegExp(/(^(?:.|\r|\n)*?)/.source + k.match[B].source.replace(/\\(\d+)/g, r))
  }
  k.match.globalPOS = K;
  try {
    Array.prototype.slice.call(document.documentElement.childNodes, 0)
  }catch(Q) {
    l = function(b, c) {
      var e = 0, f = c || [];
      if("[object Array]" === L.call(b)) {
        Array.prototype.push.apply(f, b)
      }else {
        if("number" === typeof b.length) {
          for(var g = b.length;e < g;e++) {
            f.push(b[e])
          }
        }else {
          for(;b[e];e++) {
            f.push(b[e])
          }
        }
      }
      return f
    }
  }
  var F, C;
  document.documentElement.compareDocumentPosition ? F = function(b, c) {
    return b === c ? (D = n, 0) : !b.compareDocumentPosition || !c.compareDocumentPosition ? b.compareDocumentPosition ? -1 : 1 : b.compareDocumentPosition(c) & 4 ? -1 : 1
  } : (F = function(b, c) {
    if(b === c) {
      return D = n, 0
    }
    if(b.sourceIndex && c.sourceIndex) {
      return b.sourceIndex - c.sourceIndex
    }
    var e, f, g = [], h = [];
    e = b.parentNode;
    f = c.parentNode;
    var d = e;
    if(e === f) {
      return C(b, c)
    }
    if(e) {
      if(!f) {
        return 1
      }
    }else {
      return-1
    }
    for(;d;) {
      g.unshift(d), d = d.parentNode
    }
    for(d = f;d;) {
      h.unshift(d), d = d.parentNode
    }
    e = g.length;
    f = h.length;
    for(d = 0;d < e && d < f;d++) {
      if(g[d] !== h[d]) {
        return C(g[d], h[d])
      }
    }
    return d === e ? C(b, h[d], -1) : C(g[d], c, 1)
  }, C = function(b, c, e) {
    if(b === c) {
      return e
    }
    for(b = b.nextSibling;b;) {
      if(b === c) {
        return-1
      }
      b = b.nextSibling
    }
    return 1
  });
  (function() {
    var b = document.createElement("div"), c = "script" + (new Date).getTime(), e = document.documentElement;
    b.innerHTML = "<a name='" + c + "'/>";
    e.insertBefore(b, e.firstChild);
    document.getElementById(c) && (k.find.ID = function(b, c, e) {
      if("undefined" !== typeof c.getElementById && !e) {
        return(c = c.getElementById(b[1])) ? c.id === b[1] || "undefined" !== typeof c.getAttributeNode && c.getAttributeNode("id").nodeValue === b[1] ? [c] : void 0 : []
      }
    }, k.filter.ID = function(b, c) {
      var e = "undefined" !== typeof b.getAttributeNode && b.getAttributeNode("id");
      return 1 === b.nodeType && e && e.nodeValue === c
    });
    e.removeChild(b);
    e = b = o
  })();
  (function() {
    var b = document.createElement("div");
    b.appendChild(document.createComment(""));
    0 < b.getElementsByTagName("*").length && (k.find.TAG = function(b, e) {
      var d = e.getElementsByTagName(b[1]);
      if("*" === b[1]) {
        for(var g = [], h = 0;d[h];h++) {
          1 === d[h].nodeType && g.push(d[h])
        }
        d = g
      }
      return d
    });
    b.innerHTML = "<a href='#'></a>";
    b.firstChild && "undefined" !== typeof b.firstChild.getAttribute && "#" !== b.firstChild.getAttribute("href") && (k.e.href = function(b) {
      return b.getAttribute("href", 2)
    });
    b = o
  })();
  document.querySelectorAll && function() {
    var b = j, c = document.createElement("div");
    c.innerHTML = "<p class='TEST'></p>";
    if(!(c.querySelectorAll && 0 === c.querySelectorAll(".TEST").length)) {
      j = function(c, d, e, u) {
        d = d || document;
        if(!u && !j.d(d)) {
          var i = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(c);
          if(i && (1 === d.nodeType || 9 === d.nodeType)) {
            if(i[1]) {
              return l(d.getElementsByTagName(c), e)
            }
            if(i[2] && k.find.CLASS && d.getElementsByClassName) {
              return l(d.getElementsByClassName(i[2]), e)
            }
          }
          if(9 === d.nodeType) {
            if("body" === c && d.body) {
              return l([d.body], e)
            }
            if(i && i[3]) {
              var r = d.getElementById(i[3]);
              if(r && r.parentNode) {
                if(r.id === i[3]) {
                  return l([r], e)
                }
              }else {
                return l([], e)
              }
            }
            try {
              return l(d.querySelectorAll(c), e)
            }catch(x) {
            }
          }else {
            if(1 === d.nodeType && "object" !== d.nodeName.toLowerCase()) {
              var i = d, s = (r = d.getAttribute("id")) || "__sizzle__", v = d.parentNode, m = /^\s*[+~]/.test(c);
              r ? s = s.replace(/'/g, "\\$&") : d.setAttribute("id", s);
              m && v && (d = d.parentNode);
              try {
                if(!m || v) {
                  return l(d.querySelectorAll("[id='" + s + "'] " + c), e)
                }
              }catch(w) {
              }finally {
                r || i.removeAttribute("id")
              }
            }
          }
        }
        return b(c, d, e, u)
      };
      for(var d in b) {
        j[d] = b[d]
      }
      c = o
    }
  }();
  (function() {
    var b = document.documentElement, c = b.matchesSelector || b.mozMatchesSelector || b.webkitMatchesSelector || b.msMatchesSelector;
    if(c) {
      var d = !c.call(document.createElement("div"), "div"), f = p;
      try {
        c.call(document.documentElement, "[test!='']:sizzle")
      }catch(g) {
        f = n
      }
      j.matchesSelector = function(b, g) {
        g = g.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");
        if(!j.d(b)) {
          try {
            if(f || !k.match.PSEUDO.test(g) && !/!=/.test(g)) {
              var i = c.call(b, g);
              if(i || !d || b.document && 11 !== b.document.nodeType) {
                return i
              }
            }
          }catch(l) {
          }
        }
        return 0 < j(g, o, o, [b]).length
      }
    }
  })();
  (function() {
    var b = document.createElement("div");
    b.innerHTML = "<div class='test e'></div><div class='test'></div>";
    b.getElementsByClassName && 0 !== b.getElementsByClassName("e").length && (b.lastChild.className = "e", 1 !== b.getElementsByClassName("e").length && (k.h.splice(1, 0, "CLASS"), k.find.CLASS = function(b, d, f) {
      if("undefined" !== typeof d.getElementsByClassName && !f) {
        return d.getElementsByClassName(b[1])
      }
    }, b = o))
  })();
  j.contains = document.documentElement.contains ? function(b, c) {
    return b !== c && (b.contains ? b.contains(c) : n)
  } : document.documentElement.compareDocumentPosition ? function(b, c) {
    return!!(b.compareDocumentPosition(c) & 16)
  } : function() {
    return p
  };
  j.d = function(b) {
    return(b = (b ? b.ownerDocument || b : 0).documentElement) ? "HTML" !== b.nodeName : p
  };
  window.a = j
})();
var A = window.a;
jQuery.find = A;
jQuery.b = A.m;
jQuery.b[":"] = jQuery.b.f;
jQuery.unique = A.n;
jQuery.text = A.o;
jQuery.isXMLDoc = A.d;
jQuery.contains = A.contains;

