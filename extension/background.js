/* eslint-disable no-nested-ternary */
import echo, { Transaction, PrivateKey, aes } from 'echojs-lib';
import { throttle } from 'lodash';
import urlParse from 'url-parse';

import EventEmitter from '../libs/CustomAwaitEmitter';

import Crypto from '../src/services/crypto';
import storage from '../src/services/storage';
import Listeners from '../src/services/listeners';
import extensionizer from './extensionizer';
import NotificationManager from './NotificationManager';
import echoService from '../src/services/echo';

import {
	NETWORKS,
	APP_ID,
	CLOSE_STATUS,
	OPEN_STATUS,
	CANCELED_STATUS,
	ERROR_STATUS,
	COMPLETE_STATUS,
	DISCONNECT_STATUS,
	NOT_LOGGED_STATUS,
	BROADCAST_LIMIT,
	CONNECT_STATUS,
	PING_INTERVAL,
	PING_TIMEOUT,
	CONNECTION_TIMEOUT,
	MAX_RETRIES, SIGN_STATUS, DRAFT_STORAGE_KEY, GLOBAL_ID_1, EXPIRATION_INFELICITY,
} from '../src/constants/GlobalConstants';

import { operationKeys } from '../src/constants/OperationConstants';

import { formatToSend } from '../src/services/operation';
import { validateAccountExist } from '../src/actions/AuthActions';
import { storageSetDraft } from '../src/actions/GlobalActions';


import {
	ERROR_SEND_PATH,
	NETWORK_ERROR_SEND_PATH,
	SUCCESS_SEND_INDEX_PATH,
	INCOMING_CONNECTION_PATH,
} from '../src/constants/RouterConstants';

import { FORM_SIGN_UP, FORM_SEND } from '../src/constants/FormConstants';
import FormatHelper from '../src/helpers/FormatHelper';

const notificationManager = new NotificationManager();
const emitter = new EventEmitter();
const crypto = new Crypto();

let lastRequestType = '';
const accountsRequests = [];

let requestQueue = [];
const networkSubscribers = [];

const processedOrigins = [];
let providerRequests = [];
const providerNotification = new NotificationManager();

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
const showPopup = (path, manager = notificationManager) => {
	manager.showPopup(path);
};

/**
 * check before show popup
 */
const triggerPopup = (path, manager = notificationManager) => {
	manager.getPopup()
		.then((popup) => {
			if (!popup) {
				showPopup(path, manager);
			}
		})
		.catch(() => showPopup(path, manager));
};

/**
 * close popup
 */
const closePopup = (manager = notificationManager) => {
	manager.closePopup();
};

/**
 * Set count of requests
 */
const setBadge = () => {
	const length = requestQueue.length + providerRequests.length;
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
 * createAccount
 * @param {String} name
 * @param {String?} path
 */
const createAccount = async (name, path) => {
	try {
		const network = await getNetwork();
		const { error, example } = await validateAccountExist(name);

		if (error) {
			storageSetDraft(FORM_SIGN_UP, 'error', { error, example });
			emitter.emit('offerName', error, example);
			return null;
		}
		const wif = crypto.generateWIF();
		const memoKey = crypto.generateECDSAPublicKey();
		const echoRandKey = crypto.generateEchoRandKey();
		const key = PrivateKey.fromWif(wif).toPublicKey().toString();

		await echoService.getChainLib().api.registerAccount(name, key, key, memoKey, echoRandKey);
		await storage.set('account', { name, keys: [key, key], networkName: network.name });
		await crypto.importByWIF(network.name, wif);
		await emitter.emit('addAccount', name, [key, key], network.name, path);
		storage.remove(DRAFT_STORAGE_KEY);
	} catch (err) {
		await emitter.emit('addAccountError', FormatHelper.formatError(err));

		storageSetDraft(FORM_SIGN_UP, 'error', { error: FormatHelper.formatError(err), example: '' });
	}
	return null;

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
	const { hostname } = urlParse(sender.tab.url);

	request = JSON.parse(JSON.stringify(request));

	if (!request.method || !request.appId || request.appId !== APP_ID) return false;

	if (typeof processedOrigins[hostname] !== 'boolean') {
		if (request.method !== 'getAccess') {
			sendResponse({ id: request.id, error: 'No access' });
			return true;
		}

		if (providerRequests.find((p) => p.origin === hostname)) {
			sendResponse({ id: request.id, error: 'Access has already requested' });
			return true;
		}

		providerRequests.push({ origin: hostname, id: request.id, cb: sendResponse });

		setBadge();

		try {
			emitter.emit('addProviderRequest', request.id, hostname);
		} catch (e) { return null; }

		triggerPopup(INCOMING_CONNECTION_PATH, providerNotification);
		return true;
	} else if (request.method === 'getAccess') {
		sendResponse({ id: request.id, status: processedOrigins[hostname] });
		return true;
	}

	if (request.method === 'getNetwork') {

		getNetwork().then((result) => {
			sendResponse(({ id: request.id, res: JSON.parse(JSON.stringify(result)) }));
		});
		return true;
	}

	if (request.method === 'networkSubscribe') {
		networkSubscribers.push({ id: request.id, cb: sendResponse });
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
const removeTransaction = (id, err = null) => {
	requestQueue = requestQueue.filter((r) => {
		if (r.id === id) {
			r.cb({ error: err, id: r.id });
		}

		return r.id !== id;
	});

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
		removeTransaction(id, status);
	}

	if (COMPLETE_STATUS !== status) {
		createNotification('Transaction', `${status} ${err ? err.toLowerCase() : ''}`);
	}

	if (NOT_LOGGED_STATUS === status) {
		requestQueue.forEach((r) => removeTransaction(r.id, status));
	}

	if (requestQueue.length === 1 && SIGN_STATUS === status) {
		closePopup();
	}

	if (
		(requestQueue.length === 0 && COMPLETE_STATUS === status)
        || [DISCONNECT_STATUS, NOT_LOGGED_STATUS].includes(status)
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

	const dynamicGlobalChainData = await echoService.getChainLib().api.getObject(GLOBAL_ID_1, true);

	const headBlockTimeSeconds = Math.ceil(new Date(`${dynamicGlobalChainData.time}Z`).getTime() / 1000);

	tr.expiration = headBlockTimeSeconds + EXPIRATION_INFELICITY;

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
					console.warn('Broadcast transaction error', err);
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
		console.warn('Broadcast transaction error', err);
		path = NETWORK_ERROR_SEND_PATH;

		try {
			emitter.emit('sendResponse', path);
		} catch (e) { return null; }

		return null;
	} finally {
		await storageSetDraft(FORM_SEND, 'loading', false);
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
		console.warn('Switch network error', e);
	} finally {
		networkSubscribers.forEach(({ id, cb }) => {
			try {
				cb({ id, res: network });
			} catch (error) {
				console.warn('Switch network callback error', error);
			}
		});

	}

};

/**
 *  @method onProviderApproval
 *
 * 	@param {Object} err
 * 	@param {String} id
 * 	@param {Boolean} status
 */
export const onProviderApproval = (err, id, status) => {
	const request = providerRequests.find((r) => String(r.id) === id);

	if (!request) {
		return;
	}

	request.cb({ error: err, id: request.id, status });

	providerRequests = providerRequests.filter((p) => p.id !== request.id);
	processedOrigins[request.origin] = status;

	if (!providerRequests.length) {
		closePopup(providerNotification);
	}

	try {
		emitter.emit('removeProviderRequest', id);
	} catch (e) {
		//
	}

	setBadge();
};

const listeners = new Listeners(emitter, crypto);
listeners.initBackgroundListeners(
	createAccount,
	onResponse,
	onSend,
	onSwitchNetwork,
	trSignResponse,
	onProviderApproval,
);

createSocket();

window.getChainLib = () => echo;
window.getCrypto = () => crypto;
window.getEmitter = () => emitter;
window.getList = () => requestQueue.map(({ id, data }) => ({ id, options: data }));
window.getPrivateKey = () => PrivateKey;
window.getAes = () => aes;
window.Transaction = () => Transaction;
window.getProviderMap = () => providerRequests.reduce((map, { id, origin }) => {
	map[id] = origin;
	return map;
}, {});

extensionizer.runtime.onMessage.addListener(onMessage);

crypto.on('unlocked', onPinUnlock);


extensionizer.runtime.onInstalled.addListener(onFirstInstall);

extensionizer.browserAction.setBadgeText({ text: 'BETA' });
