var fs = require('fs');

var copyCustomFile = function(fromPath, toPath) {
	console.log(`Attempting to copy From: ` + fromPath + ' to ' + toPath);
	fs.copyFile(fromPath, toPath, (err) => {
		if (err) throw err;
		console.log(toPath + ' was copied');
	});
};
var fromPath = './jssip_custom/modules/jssip/lib-es5/Subscribe.js';
var toPath = './node_modules/jssip/lib-es5/Subscribe.js';
copyCustomFile(fromPath, toPath);

var fromPath = './jssip_custom/modules/jssip/lib-es5/UA.js';
var toPath = './node_modules/jssip/lib-es5/UA.js';
copyCustomFile(fromPath, toPath);

var fromPath = './jssip_custom/modules/@types/jssip/index.d.ts';
var toPath = './node_modules/@types/jssip/index.d.ts';
copyCustomFile(fromPath, toPath);

var fromPath = './jssip_custom/modules/jssip/lib-es5/RTCSession.js';
var toPath = './node_modules/jssip/lib-es5/RTCSession.js';
copyCustomFile(fromPath, toPath);
