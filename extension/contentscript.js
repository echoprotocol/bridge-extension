/* global EXTENSION */

const extensionizer = require('./extensionizer');
const { APP_ID } = require('../src/constants/GlobalConstants');
const getAccessRequest = {};

/**
 * inpage script injection to web page
 */
function setupInjection() {
	try {
		const scriptTag = document.createElement('script');

		scriptTag.src = extensionizer.extension.getURL('inpage.js');
		scriptTag.onload = function () {
			this.parentNode.removeChild(this);
		};
		const container = document.head || document.documentElement;

		container.insertBefore(scriptTag, container.children[0]);

	} catch (e) {
		console.error('Bridge injection failed.', e);
	}

}

// eslint-disable-next-line no-unused-expressions
EXTENSION && setupInjection();

/**
 * On background response
 * @param res
 * @param origin
 */
const onResponse = (res, origin = '*') => {
	if (!res) {
		return null;
	}

	res.target = 'inpage';
	res.appId = APP_ID;

	window.postMessage(res, origin);

	return null;
};

/**
 * On Inpage message
 * @param event
 */
const onMessage = async (event) => {
	const { data, origin } = event;

	if (data.target !== 'content' || !data.appId || data.appId !== APP_ID) return;

	try {
		if (data.method !== 'getAccess') {
			extensionizer.runtime.sendMessage(data, (res) => onResponse(res, event.origin));
			return;
		}
		if (!getAccessRequest[origin]) {
			getAccessRequest[origin] = new Promise((resolve) => {
				extensionizer.runtime.sendMessage(data, (res) => {
					onResponse(res, event.origin);
					resolve(res);
				});
			});
		} else {
			const result = await getAccessRequest[origin];
			result.id = event.data.id;
			onResponse(result, event.origin);
		}
	} catch (err) {
		if (err.message.match(/Invocation of form runtime\.connect/) && err.message.match(/doesn't match definition runtime\.connect/)) {
			console.error('Connection to background error, please reload the page', err);
		} else {
			console.error('Unexpected error occurred', err);
		}
	}
};

window.addEventListener('message', onMessage, false);

