import echo, { Transaction } from 'echojs-lib';

import { APP_ID } from '../src/constants/GlobalConstants';

import SignTransaction from './SignTransaction';

const requestQueue = [];

const networkSubscribers = [];

/**
 * subscribe to switch network
 * @param subscriberCb
 */
const subscribe = (subscriberCb) => {
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
		networkSubscribers.forEach((cb) => cb());
		subscribe();
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

Transaction.prototype.signWithBridge = function () {
	// const signTransaction = new SignTransaction();

	// const cb = () => signTransaction.sign();

	const id = Date.now();

	const result = new Promise((resolve, reject) => {

		const cb = ({ data }) => {

			if (data.signatures.error) {
				reject(data.res.error);
			} else {
				resolve(data.signatures);
			}
		};

		requestQueue.push({ id, cb });

		const operations = JSON.stringify(this._operations);

		window.postMessage({
			method: 'transaction', data: operations, id, target: 'content', appId: APP_ID,
		}, '*');

	});

	return result;
};

// const signWithBridge = async () => {
// 	const tr = window.getChainLib().createTransaction();
// 	const signTr = new SignTransaction(tr);
// 	await signTr.sign();
// 	tr.addOperation(options.type, options);
//
// 	const id = Date.now();
//
// 	const cb = (signs) => broadcastTr(signs, tr);
//
// 	requestQueue.push({ id, cb });
// 	window.postMessage({
// 		method: 'confirm', data: options, id, target: 'content', appId: APP_ID,
// 	}, '*');
//
// 	// const result = new Promise((resolve, reject) => {
// 	// 	const cb = ({ data }) => {
// 	//
// 	// 		const { status, text, resultBroadcast } = data;
// 	//
// 	// 		if (status === 'approved') {
// 	// 			resolve({ status, resultBroadcast });
// 	// 		} else {
// 	// 			reject(text || status);
// 	// 		}
// 	// 	};
// 	//
// 	//
// 	// });
// };

const extension = {
	getAccounts: () => getAccounts(),
	sendTransaction: (data) => sendTransaction(data),
	subscribe: () => subscribe(),
};
window.echo = echo;
window.echojslib = {
	...echo,
	connect: echo.connect,
	isEchoBridge: true,
	extension,
	subscribe,
};
window.addEventListener('message', onMessage, false);

