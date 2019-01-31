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
	APPROVED_STATUS,
	BROADCAST_LIMIT,
	CONNECT_STATUS,
} from '../src/constants/GlobalConstants';
import FormatHelper from '../src/helpers/FormatHelper';
import { operationKeys } from '../src/constants/OperationConstants';

import { formatToSend } from '../src/services/operation';
import {
	ERROR_SEND_PATH,
	NETWORK_ERROR_SEND_PATH,
	SUCCESS_SEND_INDEX_PATH,
	SUCCESS_SEND_PATH,
} from '../src/constants/RouterConstants';
import getTransaction from './transaction';

const notificationManager = new NotificationManager();
const emitter = new EventEmitter();
const crypto = new Crypto();

let lastRequestType = '';
const accountsRequests = [];

const requestQueue = [];
let lastTransaction = null;

const { ChainStore } = chainjs;

const networkSubscribers = [];

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
 * Create default socket
 */
const createSocket = async (url) => {
	url = url || NETWORKS[0].url;
	await echo.connect(url, {
		connectionTimeout: 5000,
		maxRetries: 999999999,
		pingTimeout: 7000,
		pingInterval: 7000,
		debug: false,
		apis: ['database', 'network_broadcast', 'history', 'registration', 'asset', 'login', 'network_node'],
	});

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
 * Get current network
 * @returns {Promise.<*>}
 */
const getNetwork = async () => {
	const network = await storage.get('current_network') || NETWORKS[0];
	return network;
};

/**
 * Get user account if unlocked
 * @returns {Promise.<*>}
 */
const resolveAccounts = async () => {

	const network = getNetwork();

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
const onMessage = async (request, sender, sendResponse) => {

	request = JSON.parse(JSON.stringify(request));

	if (!request.method || !request.appId || request.appId !== APP_ID) return false;

	if (request.method === 'getNetwork') {
		getNetwork().then((rezult) => {
			sendResponse(({ subscriber: true, res: JSON.parse(JSON.stringify(rezult)) }));
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

		requestQueue.push({
			data: request.data, sender, id, cb: sendResponse,
		});

		setBadge();

		try {
			emitter.emit('request', id, request.data);
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

	} else if (request.method === 'transaction') {
		requestQueue.push({
			data: request.data, sender, id, cb: sendResponse,
		});

		setBadge();

		try {
			await emitter.emit('transaction', id, request.data);
		} catch (e) { return null; }

		notificationManager.getPopup()
			.then((popup) => {
				if (!popup) {
					triggerPopup();
				}
			})
			.catch(triggerPopup);
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
const removeTransaction = (err, id) => {
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

		removeTransaction(err, id);

		return null;
	}

	if ([CANCELED_STATUS, ERROR_STATUS].includes(status)) {
		removeTransaction(err, id);
	}

	if (lastTransaction) {
		lastTransaction.cb({ id, status, text: err });
	}

	if (COMPLETE_STATUS !== status) {
		createNotification('Transaction', `${status} ${err ? err.toLowerCase() : ''}`);
	}

	if (
		(requestQueue.length === 0 && [COMPLETE_STATUS, ERROR_STATUS].includes(status))
        || DISCONNECT_STATUS === status
	) closePopup();

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

	const publicKeys = account.getIn(['active', 'key_auths']);


	const keyPromises =
        await Promise.all(publicKeys.map((key) => crypto.getInByNetwork(networkName, key.get(0))));

	const indexPublicKey = keyPromises.findIndex((key) => !!key);

	const pKey = publicKeys.getIn([indexPublicKey, 0]);
	let tr = new Transaction();
	tr = await crypto.sign(networkName, tr, pKey);

	if (memo) {
		const { to } = transaction;

		options.memo = await crypto.encryptMemo(
			networkName,
			account.getIn(['options', 'memo_key']),
			to.getIn(['options', 'memo_key']),
			memo,
		);
	}

	tr.addOperation(type, options);
	await tr.setRequiredFees(options.fee.asset_id);

	return tr.broadcast();
};

/**
 *  @method onTransaction
 *
 * 	On transaction approve emitter request
 *
 * 	@param {Number} id
 * 	@param {String} networkName
 * 	@param {Number} balance
 * 	@param {String} windowType
 */
export const onTransaction = async (id, networkName, balance, windowType) => {
	const currentTransactionCb = lastTransaction.cb;
	const { popupId } = notificationManager;

	const transaction = await getTransaction({ id, options: lastTransaction.data, balance });

	let path = SUCCESS_SEND_PATH;
	let resultBroadcast = null;

	try {
		const start = new Date().getTime();

		await Promise.race([
			sendTransaction(transaction, networkName).then((result) => {
				resultBroadcast = result;
			}, (err) => {
				resultBroadcast = err;

				path = ERROR_SEND_PATH;

				throw new Error(err);
			}).finally(() => new Date().getTime() - start),
			new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					clearTimeout(timeoutId);
					reject(new Error('Send transaction timeout'));
				}, BROADCAST_LIMIT);
			}),
		]);
	} catch (err) {
		resultBroadcast = err;
		currentTransactionCb({
			id,
			status: ERROR_STATUS,
			text: FormatHelper.formatError(err),
			resultBroadcast,
		});

		createNotification('Transaction', `${ERROR_STATUS} ${FormatHelper.formatError(err).toLowerCase()}`);

		if (FormatHelper.formatError(err) === 'Send transaction timeout') {
			path = NETWORK_ERROR_SEND_PATH;
		}

		try {
			if (popupId !== notificationManager.popupId) {
				emitter.emit('trResponse', ERROR_STATUS, id, null, windowType);
			} else {
				emitter.emit('trResponse', ERROR_STATUS, id, path, windowType);
			}
		} catch (e) { return null; }

		return null;
	}

	currentTransactionCb({
		id,
		status: APPROVED_STATUS,
		text: null,
		resultBroadcast,
	});

	createNotification('Transaction', `${APPROVED_STATUS}`);

	try {
		if (popupId !== notificationManager.popupId) {
			emitter.emit('trResponse', APPROVED_STATUS, id, null, windowType);
		} else {
			emitter.emit('trResponse', APPROVED_STATUS, id, path, windowType);
		}
	} catch (e) { return null; }

	return null;
};

export const onSend = async (options, networkName) => {
	let path = SUCCESS_SEND_INDEX_PATH;

	try {
		const start = new Date().getTime();

		await Promise.race([
			sendTransaction(options, networkName)
				.then(() => {}, (err) => {
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
		path = NETWORK_ERROR_SEND_PATH;

		try {
			emitter.emit('sendResponse', path);
		} catch (e) { return null; }

		return null;
	}

	try {
		emitter.emit('sendResponse', path);
	} catch (e) { return null; }

	return null;
};

export const onSwitchNetwork = async (network) => {
	await createSocket(network.url);

	networkSubscribers.forEach((cb) => {
		try {

			cb({ subscriber: true, res: network });
		} catch (error) {
			networkSubscribers.splice(networkSubscribers.indexOf(cb), 1);
		}

	});

};

const listeners = new Listeners(emitter, crypto);
listeners.initBackgroundListeners(onResponse, onTransaction, onSend, onSwitchNetwork);

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
