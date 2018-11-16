import echojslib from 'echojs-lib';
import echojsws from 'echojs-ws';
import { CLOSE_STATUS, OPEN_STATUS } from '../src/constants/GlobalConstants';

const { APP_ID } = require('../src/constants/GlobalConstants');

const requestQueue = [];

/**
 * On content script message
 * @param event
 */
const onMessage = (event) => {
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

			const { status, text } = data;

			if (status === 'approved') {
				resolve({ status });
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
};

window.echojslib = {
	...echojslib,
	isEchoBridge: true,
	extension,
};
window.echojsws = echojsws;
window.addEventListener('message', onMessage, false);
