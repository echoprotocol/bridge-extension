/* eslint-disable no-nested-ternary */
import echo, { Transaction, PrivateKey, aes } from 'echojs-lib';
import { throttle } from 'lodash';

import EventEmitter from '../libs/CustomAwaitEmitter';

import Crypto from '../src/services/crypto';
import storage from '../src/services/storage';
import Listeners from '../src/services/listeners';
import extensionizer from './extensionizer';
import NotificationManager from './NotificationManager';

import {
	NETWORKS,
	APP_ID,
	CLOSE_STATUS,
	OPEN_STATUS,
	CANCELED_STATUS,
	ERROR_STATUS,
	COMPLETE_STATUS,
	DISCONNECT_STATUS,
	BROADCAST_LIMIT,
	CONNECT_STATUS,
	PING_INTERVAL,
	PING_TIMEOUT,
	CONNECTION_TIMEOUT,
	MAX_RETRIES, SIGN_STATUS, DRAFT_STORAGE_KEY,
} from '../src/constants/GlobalConstants';
import { operationKeys } from '../src/constants/OperationConstants';

import { formatToSend } from '../src/services/operation';
import {
	ERROR_SEND_PATH,
	NETWORK_ERROR_SEND_PATH,
	SUCCESS_SEND_INDEX_PATH,
} from '../src/constants/RouterConstants';

const notificationManager = new NotificationManager();
const emitter = new EventEmitter();
const crypto = new Crypto();

let lastRequestType = '';
const accountsRequests = [];

const requestQueue = [];
let lastTransaction = null;

let networkSubscribers = [];

let popupId = null;

const connectSubscribe = (status) => {
	try {
		switch (status) {
			case CONNECT_STATUS:
				emitter.emit('connect');
				break;
			case DISCONNECT_STATUS:
				emitter.emit('disconnect');
				break;
			default:
				return null;
		}
	} catch (e) {
		return null;
	}

	return null;
};

/**
 * Get current network
 * @returns {Promise.<*>}
 */
const getNetwork = async () => {
	const network = await storage.get('current_network') || NETWORKS[0];
	return network;
};

/**
 * Create default socket
 * @param {String?} url
 * @return {Promise.<void>}
 */
const createSocket = async (url) => {

	if (!url) {
		const network = await getNetwork();

		({ url } = network);

	}

	url = url || NETWORKS[0].url;

	try {
		await echo.connect(url, {
			connectionTimeout: CONNECTION_TIMEOUT,
			maxRetries: MAX_RETRIES,
			pingTimeout: PING_TIMEOUT,
			pingInterval: PING_INTERVAL,
			debug: false,
			apis: ['database', 'network_broadcast', 'history', 'registration', 'asset', 'login', 'network_node'],
		});
		connectSubscribe(CONNECT_STATUS);
		echo.subscriber.setGlobalSubscribe(throttle(() => {

			try {
				emitter.emit('globalSubscribe');
			} catch (e) {
				return null;
			}

			return null;
		}, 300));

		echo.subscriber.setStatusSubscribe(CONNECT_STATUS, () => connectSubscribe(CONNECT_STATUS));

		echo.subscriber
			.setStatusSubscribe(DISCONNECT_STATUS, () => connectSubscribe(DISCONNECT_STATUS));
	} catch (e) {
		connectSubscribe(DISCONNECT_STATUS);
	}

};


/**
 * show popup
 */
const showPopup = () => {
	notificationManager.showPopup();
};

/**
 * check before show popup
 */
const triggerPopup = () => {
	notificationManager.getPopup()
		.then((popup) => {
			if (!popup) {
				showPopup();
			}
		})
		.catch(showPopup);
};

/**
 * close popup
 */
const closePopup = () => {
	notificationManager.closePopup();
};

/**
 * Set count of requests
 */
const setBadge = () => {
	const { length } = requestQueue;
	const text = length === 0 ? 'BETA' : (length > 9 ? '9+' : length.toString());
	extensionizer.browserAction.setBadgeText({ text });
};

/**
 * Create result notification
 * @param title
 * @param message
 */
const createNotification = (title = '', message = '') => {
	extensionizer.notifications.create('', {
		iconUrl: 'images/48.png',
		type: 'basic',
		message,
		title,
	});
};

/**
 * Get user account if unlocked
 * @returns {Promise.<*>}
 */
const resolveAccounts = async () => {

	const network = await getNetwork();

	try {
		const accounts = await crypto.getInByNetwork(network.name, 'accounts') || [];
		accountsRequests.forEach((request) => {
			try {
				request.cb({ id: request.id, res: accounts });
			} catch (e) {
				console.log(e.message);
			}
		});
		return accountsRequests.splice(0, accountsRequests.length);


	} catch (e) {
		return { error: e.message };
	}

};


/**
 * On content script request
 * @param request
 * @param sender
 * @param sendResponse
 * @returns {boolean}
 */
const onMessage = (request, sender, sendResponse) => {

	request = JSON.parse(JSON.stringify(request));

	if (!request.method || !request.appId || request.appId !== APP_ID) return false;

	if (request.method === 'getNetwork') {

		getNetwork().then((result) => {
			sendResponse(({ subscriber: true, res: JSON.parse(JSON.stringify(result)) }));
		});
		return true;
	}

	if (request.method === 'networkSubscribe') {
		networkSubscribers.push(sendResponse);
		return true;
	}

	if (!request.id) return false;

	const { id } = request;

	lastRequestType = request.method;


	if (request.method === 'confirm' && request.data) {

		const operations = JSON.parse(request.data);

		requestQueue.push({
			data: operations, sender, id, cb: sendResponse,
		});

		setBadge();

		try {
			emitter.emit('request', id, operations);
		} catch (e) { return null; }

		notificationManager.getPopup()
			.then((popup) => {
				if (!popup) {
					triggerPopup();
				}
			})
			.catch(triggerPopup);

	} else if (request.method === 'accounts') {

		accountsRequests.push({
			id, cb: sendResponse,
		});

		if (!crypto.isLocked()) {
			resolveAccounts();

		} else {
			triggerPopup();
		}

	}

	return true;
};


const onPinUnlock = () => {
	if (lastRequestType === 'accounts') {
		resolveAccounts();
		closePopup();
	}
	return null;

};

/**
 * @method removeTransaction
 *
 * Remove element from transactions query
 *
 * @param err
 * @param id
 * @returns null
 */
const removeTransaction = (id) => {
	const requestIndex = requestQueue.findIndex(({ id: requestId }) => requestId === id);
	if (requestIndex === -1) return null;

	[lastTransaction] = requestQueue.splice(requestIndex, 1);

	setBadge();

	return null;
};

/**
 * On extension emitter response
 * @param err
 * @param id
 * @param status
 * @returns {Promise.<void>}
 */
export const onResponse = (err, id, status) => {

	if ([CLOSE_STATUS, OPEN_STATUS].includes(status)) {
		if (CLOSE_STATUS === status && requestQueue.length === 1) {
			closePopup();
		}

		removeTransaction(id);


		return null;
	}

	if ([CANCELED_STATUS, ERROR_STATUS].includes(status)) {
		removeTransaction(id);
	}

	// if (lastTransaction) {
	// 	console.log(1, lastTransaction);
	// 	lastTransaction.cb({ id, status, text: err });
	// }

	if (COMPLETE_STATUS !== status) {
		createNotification('Transaction', `${status} ${err ? err.toLowerCase() : ''}`);
	}

	if (requestQueue.length === 1 && SIGN_STATUS === status) {
		closePopup();
	}

	if (
		(requestQueue.length === 0 && COMPLETE_STATUS === status)
        || DISCONNECT_STATUS === status
	) closePopup();

	return null;
};

/**
 * @method trSignResponse
 *
 * @param {Object} signData
 *
 * @returns {null}
 */
export const trSignResponse = (signData) => {
	if (signData === ERROR_STATUS) {
		removeTransaction(requestQueue[0].id);
		return null;
	}

	({ popupId } = notificationManager);
	const dataToSend = JSON.stringify(signData);
	requestQueue[0].cb({ id: requestQueue[0].id, signData: dataToSend });
	removeTransaction(requestQueue[0].id);

	return null;
};

/**
 *  @method onFirstInstall
 *
 * 	Show notifications when extension is installed
 *
 * 	@param {Object} details
 */
const onFirstInstall = (details) => {
	storage.remove(DRAFT_STORAGE_KEY);

	if (details.reason === 'install') {
		createNotification('Bridge', 'Extension is now installed. Restart your work pages, please.');
	} else if (details.reason === 'update') {
		const thisVersion = extensionizer.runtime.getManifest().version;

		createNotification('Bridge', `Extension is now updated to ${thisVersion}. Restart your work pages, please.`);
	}
};


/**
 *  @method sendTransaction
 *
 * 	Send transaction
 *
 * 	@param {Object} transaction
 * 	@param {String} networkName
 */
const sendTransaction = async (transaction, networkName) => {
	const { type, memo } = transaction;
	const account = transaction[operationKeys[type]];
	const options = formatToSend(type, transaction);

	const publicKeys = account.active.key_auths;

	const keyPromises =
        await Promise.all(publicKeys.map((key) => crypto.getInByNetwork(networkName, key[0])));

	const indexPublicKey = keyPromises.findIndex((key) => !!key);

	const pKey = await crypto.getSignPrivateKey(networkName, publicKeys[indexPublicKey][0]);

	if (memo) {
		const { to } = transaction;

		options.memo = await crypto.encryptMemo(
			networkName,
			account.options.memo_key,
			to.options.memo_key,
			memo,
		);
	}

	let tr = echo.createTransaction();

	tr = tr.addOperation(type, options);

	await tr.sign(pKey);

	return tr.broadcast();
};

export const onSend = async (options, networkName) => {
	options = JSON.parse(JSON.stringify(options));
	let path = SUCCESS_SEND_INDEX_PATH;

	try {
		const start = new Date().getTime();

		await Promise.race([
			sendTransaction(options, networkName)
				.then(() => {}, (err) => {
					console.log('Broadcast error', err);
					if (err) { path = ERROR_SEND_PATH; }
				}).finally(() => new Date().getTime() - start),
			new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					clearTimeout(timeoutId);
					reject(new Error('Send transaction timeout'));
				}, BROADCAST_LIMIT);
			}),
		]);
	} catch (err) {
		console.log('Broadcast error', err);
		path = NETWORK_ERROR_SEND_PATH;

		try {
			emitter.emit('sendResponse', path);
		} catch (e) { return null; }

		return null;
	} finally {
		await storage.remove(DRAFT_STORAGE_KEY);
	}

	try {
		emitter.emit('sendResponse', path);
	} catch (e) { return null; }

	return null;
};

/**
 *  @method onSwitchNetwork
 *
 *
 * 	@param {Object} network
 */
export const onSwitchNetwork = async (network) => {

	try {
		await createSocket(network.url);
	} catch (e) {
		console.log('onSwitchNetwork Error', e);
	} finally {
		networkSubscribers = networkSubscribers.filter((cb) => {
			try {
				cb({ subscriber: true, res: network });
				return false;
			} catch (error) {
				return false;
			}
		});

	}

};

const listeners = new Listeners(emitter, crypto);
listeners.initBackgroundListeners(
	onResponse,
	onSend,
	onSwitchNetwork,
	trSignResponse,
);

createSocket();

window.getChainLib = () => echo;
window.getCrypto = () => crypto;
window.getEmitter = () => emitter;
window.getList = () => requestQueue.map(({ id, data }) => ({ id, options: data }));
window.getPrivateKey = () => PrivateKey;
window.getAes = () => aes;
window.Transaction = () => Transaction;

extensionizer.runtime.onMessage.addListener(onMessage);

crypto.on('unlocked', onPinUnlock);


extensionizer.runtime.onInstalled.addListener(onFirstInstall);

extensionizer.browserAction.setBadgeText({ text: 'BETA' });
