/* global EXTENSION */

const extensionizer = require('./extensionizer');

function setupInjection() {
	try {
		const scriptTag = document.createElement('script');

		scriptTag.src = extensionizer.extension.getURL('inpage.js');

		scriptTag.onload = function () { this.parentNode.removeChild(this); };
		const container = document.head || document.documentElement;

		container.insertBefore(scriptTag, container.children[0]);

		// (document.head || document.documentElement).appendChild(scriptTag);
		// scriptTag.onload = function () {
		// 	scriptTag.parentNode.removeChild(scriptTag);
		// };
	} catch (e) {
		console.error('Bridge injection failed.', e);
	}

}

EXTENSION && setupInjection();
