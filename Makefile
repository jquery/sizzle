
jquery:
	@@sed '/EXPOSE/r libs/jquery.js' sizzle.js > jquery-sizzle.js
