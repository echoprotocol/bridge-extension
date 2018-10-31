/* global EXTENSION */

const extensionizer = require('./extensionizer');
const { APP_ID } = require('../src/constants/GlobalConstants');

/**
 * inpage script injection to web page
 */
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

/**
 * On background response
 * @param res
 * @param origin
 */
const onResponse = (res, origin = '*') => {
	res.target = 'inpage';
	res.appId = APP_ID;
	window.postMessage(res, origin);
};

/**
 * On Inpage message
 * @param event
 */
const onMessage = (event) => {
	const { data } = event;
	if (data.target !== 'content' || !data.appId || data.appId !== APP_ID) return;

	extensionizer.runtime.sendMessage(data, (res) => onResponse(res, event.origin));
};

window.addEventListener('message', onMessage, false);

