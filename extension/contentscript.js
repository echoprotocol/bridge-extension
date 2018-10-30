/* global EXTENSION */

const extensionizer = require('./extensionizer');

function setupInjection() {
	try {
		const scriptTag = document.createElement('script');

		scriptTag.src = extensionizer.extension.getURL('inpage.js');
		scriptTag.onload = function () { this.parentNode.removeChild(this); };
		const container = document.head || document.documentElement;

		container.insertBefore(scriptTag, container.children[0]);

	} catch (e) {
		console.error('Bridge injection failed.', e);
	}

}

EXTENSION && setupInjection();

const onResponse = (res, origin = '*') => {
	res.target = 'inpage';
	window.postMessage(res, origin);
};

const onMessage = (event) => {
	const { data } = event;
	if (data.target !== 'content') return;

	extensionizer.runtime.sendMessage(data, (res) => onResponse(res, event.origin));
};

window.addEventListener('message', onMessage, false);

