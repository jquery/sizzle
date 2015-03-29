// A custom pass-through pseudo to force non-qSA processing
Sizzle.selectors.filters.noQSA = function( elem ) {
	return true;
};
