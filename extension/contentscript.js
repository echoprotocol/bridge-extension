/* global EXTENSION */
/* global INPAGE_PATH_PACK_FOLDER */

const extensionizer = require('./extensionizer');
const { APP_ID } = require('../src/constants/GlobalConstants');
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const inpage = require(`../${INPAGE_PATH_PACK_FOLDER}/inpage`);

const inpageContent = inpage.default;
let currentPort;

/**
 * inpage script injection to web page
 */
function setupInjection(content) {
	try {
		const scriptTag = document.createElement('script');
		scriptTag.textContent = content;
		scriptTag.setAttribute('async', false);
		const container = document.head || document.documentElement;

		container.insertBefore(scriptTag, container.children[0]);
		container.removeChild(scriptTag);

		// see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/Port
		// the object for long-live exchanging of messages between page script and background.js
		currentPort = extensionizer.runtime.connect();
	} catch (e) {
		console.error('Bridge injection failed.', e);
	}

}

/**
 *
 * @param {Object} res
 * @return {Promise<any>}
 */
const onBackgroundMessage = async (res) => {
	if (!res) {
		return null;
	}

	const { origin } = res;

	delete res.origin;
	res.target = 'inpage';
	res.appId = APP_ID;

	window.postMessage(res, origin);

	return null;
};

/**
 * On Inpage message
 * @param event
 */
const onPageMessage = (event) => {
	const { data } = event;

	if (data.target !== 'content' || !data.appId || data.appId !== APP_ID) return;

	try {
		currentPort.postMessage(data);
	} catch (err) {
		if (err.message.match(/Invocation of form runtime\.connect/) && err.message.match(/doesn't match definition runtime\.connect/)) {
			console.error('Connection to background error, please reload the page', err);
		} else {
			console.error('Unexpected error occurred', err);
		}
	}
};


// eslint-disable-next-line no-unused-expressions
EXTENSION && setupInjection(inpageContent);

// listen messages from inpage.js script injected in web page. Implemented with One-off messages
window.addEventListener('message', onPageMessage, false);

// listen messages from background.js script by.  Implemented with Connection-based messaging
currentPort.onMessage.addListener(onBackgroundMessage);
