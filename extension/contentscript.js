/* global EXTENSION */

const extensionizer = require('./extensionizer');
const { APP_ID } = require('../src/constants/GlobalConstants');
const { MESSAGE_METHODS } = require('../src/constants/GlobalConstants');

const getAccessRequest = {};
let currentPort = null;

/**
 * inpage script injection to web page
 */
const setupInjection = () => {
	try {
		const scriptTag = document.createElement('script');

		scriptTag.src = extensionizer.extension.getURL('inpage.js');
		scriptTag.onload = function () {
			this.parentNode.removeChild(this);
		};
		const container = document.head || document.documentElement;

		container.insertBefore(scriptTag, container.children[0]);

		// see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/Port
		// the object for long-live exchanging of messages between page script and background.js
		currentPort = extensionizer.runtime.connect();

	} catch (e) {
		console.error('Bridge injection failed.', e);
	}

};

/**
 * Handler on background message. It send messages to web page via One-off messages
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
 *
 * @param {Object} res
 * @return {Promise<any>}
 */
const onBackgroundMessage = async (res) => {
	console.log('TCL: onBackgroundMessage -> res', res);
	if (!res) {
		return null;
	}

	const { origin, method } = res;

	delete res.origin;

	if (method === MESSAGE_METHODS.GET_ACCESS && !getAccessRequest[origin]) {
		getAccessRequest[origin] = res;
	}

	onResponse(res, origin);

	return null;
};

/**
 * On Inpage message
 * @param event
 */
const onPageMessage = (event) => {
	const { data, origin } = event;

	if (data.target !== 'content' || !data.appId || data.appId !== APP_ID) return;

	try {
		if (data.method !== MESSAGE_METHODS.GET_ACCESS) {
			currentPort.postMessage(data);
			return;
		} else if (!getAccessRequest[origin]) {
			currentPort.postMessage(data);
		} else {
			const result = getAccessRequest[origin];
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


// eslint-disable-next-line no-unused-expressions
EXTENSION && setupInjection();

// listen messages from inpage.js script injected in web page. Implemented with One-off messages
window.addEventListener('message', onPageMessage, false);

// listen messages from background.js script by.  Implemented with Connection-based messaging
currentPort.onMessage.addListener(onBackgroundMessage);
