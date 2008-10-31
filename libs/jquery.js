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

return;
