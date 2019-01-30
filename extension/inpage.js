import echojslib from 'echojs-lib';
import echojsws from 'echojs-ws';

import { APP_ID } from '../src/constants/GlobalConstants';

const requestQueue = [];

const networkSubscribers = [];


/**
 * subscribeSwitchNetwork to switch network
 * @param subscriberCb
 */

const subscribeSwitchNetwork = (subscriberCb) => {
	console.log('2: subscribeSwitchNetwork -> subscriberCb', subscriberCb);
	if (subscriberCb) { networkSubscribers.push(subscriberCb); }
	window.postMessage({
		method: 'networkSubscribe', target: 'content', appId: APP_ID,
	}, '*');
};

/**
 * On content script message
 * @param event
 */
const onMessage = (event) => {

	if (event.data.subscriber) {
		networkSubscribers.forEach((cb) => cb(event));
		subscribeSwitchNetwork();
		return;
	}

	const { id, target, appId } = event.data;

	if (!id || target !== 'inpage' || !appId || appId !== APP_ID) return;

	const requestIndex = requestQueue.findIndex(({ id: requestId }) => requestId === id);
	if (requestIndex === -1) return;

	requestQueue.splice(requestIndex, 1)[0].cb(event);
};


/**
 * Send custom transaction
 * @param options
 * @returns {Promise}
 */
const sendTransaction = (options) => {

	const id = Date.now();
	const result = new Promise((resolve, reject) => {
		const cb = ({ data }) => {

			const { status, text, resultBroadcast } = data;

			if (status === 'approved') {
				resolve({ status, resultBroadcast });
			} else {
				reject(text || status);
			}
		};
		requestQueue.push({ id, cb });
		window.postMessage({
			method: 'confirm', data: options, id, target: 'content', appId: APP_ID,
		}, '*');

	});

	return result;

};

/**
 * Get user account if unlocked
 * @returns {Promise}
 */
const getAccounts = () => {
	const id = Date.now();
	const result = new Promise((resolve, reject) => {

		const cb = ({ data }) => {

			if (data.res.error) {
				reject(data.res.error);
			} else {
				resolve(data.res);
			}
		};

		requestQueue.push({ id, cb });
		window.postMessage({
			method: 'accounts', id, target: 'content', appId: APP_ID,
		}, '*');

	});

	return result;
};


const extension = {
	getAccounts: () => getAccounts(),
	sendTransaction: (data) => sendTransaction(data),
	subscribeSwitchNetwork: () => subscribeSwitchNetwork(),
};

window.echojslib = {
	...echojslib,
	isEchoBridge: true,
	extension,
	subscribeSwitchNetwork,
};
window.echojsws = echojsws;
window.addEventListener('message', onMessage, false);

