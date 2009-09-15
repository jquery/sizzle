
jquery:
	@@sed '/EXPOSE/r libs/jquery.js' sizzle.js > jquery-sizzle.js
	@@cp jquery-sizzle.js ../jQuery/src/selector.js
	@@cd ../jQuery && make jquery
