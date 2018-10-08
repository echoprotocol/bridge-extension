const extension = require('./ext');

function setupInjection() {
	try {
		const scriptTag = document.createElement('script');
		scriptTag.src = extension.extension.getURL('dist/inpage.js');

		scriptTag.onload = function () { this.parentNode.removeChild(this); };
		const container = document.head || document.documentElement;

		container.insertBefore(scriptTag, container.children[0]);

		// (document.head || document.documentElement).appendChild(scriptTag);
		// scriptTag.onload = function () {
		// 	scriptTag.parentNode.removeChild(scriptTag);
		// };
	} catch (e) {
		console.error('Metamask injection failed.', e);
	}
}

setupInjection();
