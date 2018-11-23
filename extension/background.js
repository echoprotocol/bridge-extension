/* eslint-disable no-nested-ternary */
import echojs from 'echojs-ws';
import chainjs from 'echojs-lib';
import EventEmitter from '../libs/CustomAwaitEmitter';

import Crypto from '../src/services/crypto';
import storage from '../src/services/storage';
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
} from '../src/constants/GlobalConstants';
import FormatHelper from '../src/helpers/FormatHelper';
import { operationKeys } from '../src/constants/OperationConstants';
import { formatToSend } from '../src/services/operation';
import { ERROR_SEND_PATH, SUCCESS_SEND_PATH } from '../src/constants/RouterConstants';
import getTransaction from './transaction';

const notificationManager = new NotificationManager();
const emitter = new EventEmitter();
const crypto = new Crypto();

const requestQueue = [];
let lastTransaction = null;
const { ChainStore } = chainjs;

ChainStore.notifySubscribers = () => {
	// Dispatch at most only once every x milliseconds
	if (!ChainStore.dispatched) {
		ChainStore.dispatched = true;
		ChainStore.timeout = setTimeout(() => {
			ChainStore.dispatched = false;
			ChainStore.subscribers.forEach((callback) => {
				try {
					callback();
				} catch (e) {
					ChainStore.unsubscribe(callback);
				}

			});
		}, ChainStore.dispatchFrequency);
	}
};
/**
 * Create default socket
 */
const createSocket = () => {
	echojs.Apis.setAutoReconnect(false);

	const instance = echojs.Apis.instance(NETWORKS[0].url, true, 4000);

	instance.init_promise
		.then(() => chainjs.ChainStore.init())
		.then(() => {});
};

/**
 * trigger popup
 */
const triggerPopup = () => {
	notificationManager.showPopup();

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
const getAccountList = async () => {
	const network = (await storage.get('current_network')) || NETWORKS[0];

	try {
		const accounts = await crypto.getInByNetwork(network.name, 'accounts') || [];
		return accounts;
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

	if (!request.method || !request.id || !request.appId || request.appId !== APP_ID) return false;

	const { id } = request;

	if (request.method === 'confirm' && request.data) {

		requestQueue.push({
			data: request.data, sender, id, cb: sendResponse,
		});

		setBadge();

		try {
			emitter.emit('request', id, request.data);
		} catch (e) {}

		notificationManager.getPopup()
			.then((popup) => {
				if (!popup) {
					triggerPopup();
				}
			})
			.catch(triggerPopup);
	} else if (request.method === 'accounts') {
		getAccountList().then((res) => sendResponse({ id, res }));
	}

	return true;
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
const onResponse = (err, id, status) => {

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

	const publicKey = account.getIn(['active', 'key_auths', '0', '0']);

	const { TransactionBuilder } = chainjs;
	let tr = new TransactionBuilder();
	tr = await crypto.sign(networkName, tr, publicKey);

	if (memo) {
		const { to } = transaction;

		options.memo = await crypto.encryptMemo(
			networkName,
			account.getIn(['options', 'memo_key']),
			to.getIn(['options', 'memo_key']),
			memo,
		);
	}

	tr.add_type_operation(type, options);
	await tr.set_required_fees(options.fee.asset_id);

	await tr.broadcast();
};

/**
 *  @method onTransaction
 *
 * 	On transaction approve emitter request
 *
 * 	@param {Number} id
 * 	@param {String} networkName
 * 	@param {Number} balance
 */
const onTransaction = async (id, networkName, balance) => {
	const currentTransactionCb = lastTransaction.cb;
	const { popupId } = notificationManager;

	const transaction = await getTransaction({ id, options: lastTransaction.data, balance });

	let path = SUCCESS_SEND_PATH;

	try {
		const start = new Date().getTime();

		await Promise.race([
			sendTransaction(transaction, networkName).then((err) => {
				if (err) {
					path = ERROR_SEND_PATH;
				}
				return new Date().getTime() - start;
			}),
			new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					clearTimeout(timeoutId);
					reject(new Error('Send transaction timeout'));
				}, BROADCAST_LIMIT);
			}),
		]);
	} catch (err) {
		currentTransactionCb({
			id,
			status: ERROR_STATUS,
			text: FormatHelper.formatError(err),
		});

		createNotification('Transaction', `${ERROR_STATUS} ${FormatHelper.formatError(err).toLowerCase()}`);

		if (popupId !== NotificationManager.popupId) {
			return null;
		}

		try {
			emitter.emit('trResponse', ERROR_STATUS, id, path);
		} catch (e) {}

		return null;
	}

	currentTransactionCb({ id, status: APPROVED_STATUS, text: null });

	createNotification('Transaction', `${APPROVED_STATUS}`);

	if (popupId !== notificationManager.popupId) {
		return null;
	}

	try {
		emitter.emit('trResponse', APPROVED_STATUS, id, path);
	} catch (e) {}

	return null;
};

createSocket();

window.getWsLib = () => echojs;
window.getChainLib = () => chainjs;
window.getCrypto = () => crypto;
window.getEmitter = () => emitter;
window.getList = () => requestQueue.map(({ id, data }) => ({ id, options: data }));

emitter.on('response', onResponse);

emitter.on('trRequest', onTransaction);

extensionizer.runtime.onMessage.addListener(onMessage);

extensionizer.runtime.onInstalled.addListener(onFirstInstall);

extensionizer.browserAction.setBadgeText({ text: 'BETA' });
