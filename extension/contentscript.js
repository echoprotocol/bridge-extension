/* global EXTENSION */
/* global INPAGE_PATH_PACK_FOLDER */

import { APP_ID } from '../src/constants/GlobalConstants';

// const extensionizer = require('./extensionizer');
import extensionizer from './extensionizer';

// const extensionizer = require('./extensionizer');
// const prk = require('../src/constants/GlobalConstants');
// const { APP_ID } = require('../src/constants/GlobalConstants');
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const inpage = require(`../${INPAGE_PATH_PACK_FOLDER}/inpage`);

const inpageContent = inpage.default;
let currentPort;

console.log('123123', EXTENSION);
console.log('5555', extensionizer.tabs);
console.log('666666', extensionizer.runtime);
console.log('4444', extensionizer.window);
console.log('777777', extensionizer.windows);
// console.log('888888', APP_ID);

/**
 * inpage script injection to web page
 */
function setupInjection(content) {
	console.log('123123', EXTENSION);
	try {
		const scriptTag = document.createElement('script');
		scriptTag.textContent = content;
		scriptTag.setAttribute('async', false);
		const container = document.head || document.documentElement;

		container.insertBefore(scriptTag, container.children[0]);
		container.removeChild(scriptTag);

		// see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/Port
		// the object for long-live exchanging of messages between page script and background.js
	} catch (e) {
		console.error('Bridge injection failed.', e);
	}

}

// /**
//  *
//  * @param {Object} res
//  * @return {Promise<any>}
//  */
// const onBackgroundMessage = async (res) => {
// 	if (!res) {
// 		return null;
// 	}

// 	const { origin } = res;

// 	delete res.origin;
// 	res.target = 'inpage';
// 	res.appId = APP_ID;

// 	window.postMessage(res, origin);

// 	return null;
// };

// /**
//  * On Inpage message
//  * @param event
//  */
// const onPageMessage = (event) => {
// 	const { data } = event;

// 	if (data.target !== 'content' || !data.appId || data.appId !== APP_ID) return;

// 	try {
// 		currentPort.postMessage(data);
// 	} catch (err) {
// 		if (err.message.match(/Invocation of form runtime\.connect/) && err.message.match(/doesn't match definition runtime\.connect/)) {
// 			console.error('Connection to background error, please reload the page', err);
// 		} else {
// 			console.error('Unexpected error occurred', err);
// 		}
// 	}
// };


// // eslint-disable-next-line no-unused-expressions
// // setupInjection(inpageContent);

// // listen messages from inpage.js script injected in web page. Implemented with One-off messages
// // window.addEventListener('message', onPageMessage, false);

// // listen messages from background.js script by.  Implemented with Connection-based messaging
// // currentPort.onMessage.addListener(onBackgroundMessage);

function documentElementCheck() {
	const documentElement = document.documentElement.nodeName;
	if (documentElement) {
		return documentElement.toLowerCase() === 'html';
	}
	return true;
}

function doctypeCheck() {
	const { doctype } = window.document;
	if (doctype) {
		return doctype.name === 'html';
	}
	return true;
}

// async function domIsReady() {
// 	// already loaded
// 	if (['interactive', 'complete'].includes(document.readyState)) {
// 		return undefined;
// 	}
// 	// wait for load
// 	return new Promise((resolve) => window.addEventListener('DOMContentLoaded', resolve, { once: true }));
// }

function shouldInjectProvider() {
	return doctypeCheck() && documentElementCheck();
}

// function setupStreams() {
// 	currentPort = extensionizer.runtime.connect();
// 	window.addEventListener('message', onPageMessage, false);
// 	currentPort.onMessage.addListener(onBackgroundMessage);
// }

// async function start() {
// 	await setupStreams();
// 	// await domIsReady();
// }

if (shouldInjectProvider()) {
	setupInjection(inpageContent);
	// start();
}
