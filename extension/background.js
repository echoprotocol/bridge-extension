/* eslint-disable no-nested-ternary */
import echo, { Transaction, PrivateKey, aes, ED25519, crypto as echojsCrypto } from 'echojs-lib';
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
	MAX_RETRIES,
	SIGN_STATUS,
	DRAFT_STORAGE_KEY,
	GLOBAL_ID_1,
	EXPIRATION_INFELICITY,
	MESSAGE_METHODS,
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
	SIGN_MESSAGE_PATH,
	CLOSE_AFTER_UNLOCK_PATH,
} from '../src/constants/RouterConstants';

import { FORM_SIGN_UP, FORM_SEND } from '../src/constants/FormConstants';
import FormatHelper from '../src/helpers/FormatHelper';

const notificationManager = new NotificationManager();
const emitter = new EventEmitter();
const crypto = new Crypto();

/** @type {[PortObject]} */
const ports = [];
let lastRequestType = '';

let requestQueue = [];
let signMessageRequests = [];

const approvedOrigins = {};

const isPortApproved = (portObj) => approvedOrigins[portObj.origin];

const notifyAllApprovedPorts = (res, method) => {
	ports.forEach((portObj) => {
		if (isPortApproved(portObj)) {
			portObj.port.postMessage({ res, method });
		}
	});
};

const sendOnPortsViaMethod = (portsToSend, method, res) => {
	portsToSend.forEach((portObject) => {
		const { port, origin } = portObject;

		if (!isPortApproved(portObject) && ![MESSAGE_METHODS.GET_ACCESS, MESSAGE_METHODS.CHECK_ACCESS].includes(method)) {
			return;
		}

		portObject.pendingRequests = portObject.pendingRequests.filter((request) => {
			if (request.method === method) {
				port.postMessage({ res, ...request, origin });
				console.log('TCL: sendOnPortsViaMethod -> portObject', portObject);
				console.log('TCL: sendOnPortsViaMethod -> { res, ...request, origin }', { res, ...request, origin });
				return false;
			}
			return true;
		});
	});
};

const providerNotification = new NotificationManager();
const signNotification = new NotificationManager();

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
	const chainId = await echoService.getChainLib().api.getChainId();
	return { ...network, chainId };
};

/**
 * Create default socket
 * @param {String?} url
 * @return {Promise.<void>}
 */
const createSocket = async (url) => {

	if (!url) {
		const network = await storage.get('current_network') || NETWORKS[0];

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
	// the looking out a list of ports that contains MESSAGE_METHODS.GET_ACCESS task
	const filterPorts = ports.filter(({ pendingRequests }) => pendingRequests.find(({ method }) => method === MESSAGE_METHODS.GET_ACCESS));
	const approvedSizePerOrigin = _.uniqBy(filterPorts, ({ origin }) => origin).length;

	const length = requestQueue.length + signMessageRequests.length + approvedSizePerOrigin;
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
		storageSetDraft(FORM_SIGN_UP, 'loading', true);
		const network = await getNetwork();
		const { error, example } = await validateAccountExist(name);

		if (error) {
			storageSetDraft(FORM_SIGN_UP, 'loading', false);
			storageSetDraft(FORM_SIGN_UP, 'error', { error, example });
			emitter.emit('offerName', error, example);
			return null;
		}
		const wif = crypto.generateWIF();
		const key = PrivateKey.fromWif(wif).toPublicKey().toString();
		await echoService.getChainLib().api.registerAccount(name, key, key);
		await storage.set('account', { name, keys: [key], networkName: network.name });
		await crypto.importByWIF(network.name, wif);
		await emitter.emit('addAccount', name, [key], network.name, path);
		storage.remove(DRAFT_STORAGE_KEY);
	} catch (err) {
		await emitter.emit('addAccountError', FormatHelper.formatError(err));
		storageSetDraft(FORM_SIGN_UP, 'error', { error: FormatHelper.formatError(err), example: '' });
	} finally {
		storageSetDraft(FORM_SIGN_UP, 'loading', false);
	}
	return null;

};


/**
 * Get active account by network
 * @param {String} switchNetwork
 * @returns {Promise<[activeAccount]>}
 */
const getActiveAccount = async (switchNetwork) => {
	const network = switchNetwork || await getNetwork();

	let activeAccount = null;

	if (!crypto.isLocked()) {
		let accounts = await crypto.getInByNetwork(network.name, 'accounts') || [];
		accounts = accounts.filter((account) => account.active);
		if (accounts.length > 0) {
			activeAccount = accounts[0].id;
		}
	}

	return activeAccount;
};

const resolveRequestAccount = async (portsToSend) => {
	const account = await getActiveAccount();
	sendOnPortsViaMethod(portsToSend, MESSAGE_METHODS.REQUEST_ACCOUNT, account);
};

const resolveAccounts = async (portsToSend) => {
	const network = await getNetwork();
	let accounts = await crypto.getInByNetwork(network.name, 'accounts') || [];
	accounts = accounts.filter((account) => account.active);
	sendOnPortsViaMethod(portsToSend, MESSAGE_METHODS.ACCOUNTS, accounts);
};

const resolveActiveAccount = async (portsToSend) => {
	const activeAccount = await getActiveAccount();
	sendOnPortsViaMethod(portsToSend, MESSAGE_METHODS.GET_ACTIVE_ACCOUNT, activeAccount);
};

const resolveNetwork = async (portsToSend) => {
	const result = await getNetwork();
	sendOnPortsViaMethod(portsToSend, MESSAGE_METHODS.GET_NETWORK, JSON.parse(JSON.stringify(result)));
};

const resolveCheckAccess = async (portsToSend) => {
	const { origin } = portsToSend[0];
	const result = !!approvedOrigins[origin];
	sendOnPortsViaMethod(portsToSend, MESSAGE_METHODS.CHECK_ACCESS, result);
};

const resolveProviderApprove = (portsToSend) => {
	const { origin } = portsToSend[0];
	const status = approvedOrigins[origin];
	sendOnPortsViaMethod(portsToSend, MESSAGE_METHODS.GET_ACCESS, status);
};

const resolveGetAccess = (portsToSend) => {
	const { origin } = portsToSend[0];
	const result = !!approvedOrigins[origin];
	sendOnPortsViaMethod(portsToSend, MESSAGE_METHODS.GET_ACCESS, result);
};

/**
 *
 * @param {Object} request
 * @param {PortObject} portObj
 */
const onMessageHandler = (request, portObj) => {
	const { port: { sender } } = portObj;
	const { origin } = urlParse(sender.tab.url);
	const { id, method } = request;

	const sendResponse = (reposneObject) => portObj.port.postMessage({ ...reposneObject, origin, method });

	if (!request.id || !request.method || !request.appId || request.appId !== APP_ID) return false;

	lastRequestType = request.method;

	if (request.method === MESSAGE_METHODS.CHECK_ACCESS) {
		portObj.addTask(id, method);
		resolveCheckAccess([portObj]);
		return true;
	} else if (!approvedOrigins[origin]) {

		if (request.method !== MESSAGE_METHODS.GET_ACCESS) {
			// TODO
			sendResponse({ id: request.id, error: 'No access' });
			return true;
		}

		portObj.addTask(id, method);

		try {
			emitter.emit('addProviderRequest', request.id, origin);
		} catch (e) {
			return null;
		}

		setBadge();
		triggerPopup(INCOMING_CONNECTION_PATH, providerNotification);
		return true;
	}


	switch (method) {
		case MESSAGE_METHODS.GET_ACCESS: {
			portObj.addTask(id, method);
			resolveGetAccess(ports);
			return true;
		}
		case MESSAGE_METHODS.REQUEST_ACCOUNT: {
			portObj.addTask(id, method);
			if (!crypto.isLocked()) {
				resolveRequestAccount([portObj]);
			} else {
				triggerPopup(CLOSE_AFTER_UNLOCK_PATH);
			}
			return true;
		}
		case MESSAGE_METHODS.GET_NETWORK: {
			portObj.addTask(id, method);
			resolveNetwork([portObj]);
			return true;
		}
		case MESSAGE_METHODS.ACCOUNTS: {
			portObj.addTask(id, method);

			if (!crypto.isLocked()) {
				resolveAccounts([portObj]);
			} else {
				triggerPopup();
			}
			return true;
		}
		case MESSAGE_METHODS.GET_ACTIVE_ACCOUNT: {
			portObj.addTask(id, method);
			resolveActiveAccount([portObj]);
			return true;
		}
		case MESSAGE_METHODS.PROOF_OF_AUTHORITY:
		case MESSAGE_METHODS.SIGN_DATA: {
			portObj.addTask(id, method);

			signMessageRequests.push({
				origin,
				id: request.id,
				message: request.data.message,
				signer: request.data.accountId,
				method: request.method,
				cb: sendResponse,
			});

			setBadge();

			try {
				emitter.emit(
					'addSignMessageRequest',
					request.id,
					origin,
					request.data.accountId,
					request.data.message,
				);
			} catch (e) {
				return null;
			}

			triggerPopup(SIGN_MESSAGE_PATH, signNotification);
			return true;
		}
		case MESSAGE_METHODS.CONFIRM: {
			if (request.data) {
				const operations = JSON.parse(request.data);

				requestQueue.push({
					data: operations, sender, id, cb: sendResponse,
				});

				setBadge();

				try {
					emitter.emit('request', id, operations);
				} catch (e) {
					return null;
				}

				notificationManager.getPopup()
					.then((popup) => {
						if (!popup) {
							triggerPopup();
						}
					})
					.catch(triggerPopup);
			}
			return true;
		}
		default: {
			// TODO send error about unknown method
			return true;
		}
	}
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
	// TODO:: add validation of input variables
	const { type } = transaction;
	const account = transaction[operationKeys[type]];
	const options = formatToSend(type, transaction);

	const publicKeys = account.active.key_auths;

	const keyPromises =
		await Promise.all(publicKeys.map((key) => crypto.getInByNetwork(networkName, key[0])));

	const indexPublicKey = keyPromises.findIndex((key) => !!key);

	const pKey = await crypto.getSignPrivateKey(networkName, publicKeys[indexPublicKey][0]);

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
				.then(() => { }, (err) => {
					console.error('Broadcast transaction error', err);
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
		console.error('Broadcast transaction error', err);
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
 * Update active account on all requested inpage
 * @returns {Promise<null|{error: *}>}
 */
const updateActiveAccountInpage = async (network) => {
	try {
		const account = await getActiveAccount(network);
		notifyAllApprovedPorts(account, MESSAGE_METHODS.ACTIVE_ACCOUNT_SUBSCRIBE);
		return null;
	} catch (e) {
		return { error: e.message };
	}
};

const onPinUnlock = () => {
	if (lastRequestType === MESSAGE_METHODS.REQUEST_ACCOUNT) {
		resolveRequestAccount(ports);
	} else if (lastRequestType === MESSAGE_METHODS.ACCOUNTS) {
		resolveAccounts(ports);
	}
	updateActiveAccountInpage();
	return null;
};

const onLock = () => {
	updateActiveAccountInpage();
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
		console.error('Switch network error', e);
	} finally {
		updateActiveAccountInpage(network);
		notifyAllApprovedPorts(network, MESSAGE_METHODS.SWITCH_NETWORK_SUBSCRIBE);
	}
};


const onSwitchActiveAccount = (res) => {
	updateActiveAccountInpage();
	if (!res) return;
	notifyAllApprovedPorts(res, MESSAGE_METHODS.SWITCH_ACCOUNT_SUBSCRIBE);
};

/**
 *  @method onProviderApproval
 *
 * 	@param {Object} err
 * 	@param {String} id
 * 	@param {Boolean} status
 */
export const onProviderApproval = (err, id, status, approvedOrigin) => {
	approvedOrigins[approvedOrigin] = status;

	updateActiveAccountInpage();

	const portsToSend = ports.filter((portObj) => portObj.origin === approvedOrigin);
	resolveProviderApprove(portsToSend);

	closePopup(providerNotification);

	try {
		emitter.emit('removeProviderRequest', id);
	} catch (e) {
		//
	}

	setBadge();
};

const removeSignMessageRequest = (err, id, signature) => {
	const request = signMessageRequests.find((r) => String(r.id) === id);
	request.cb({ error: err, id: request.id, signature });

	signMessageRequests = signMessageRequests.filter((p) => p.id !== request.id);
	if (!signMessageRequests.length) {
		closePopup(signNotification);
	}

	setBadge();

	try {
		emitter.emit('removeSignMessageRequest', id);
	} catch (e) {
		//
	}
};

const signMessage = async (method, message, account, networkName) => {
	if (method === 'proofOfAuthority') {
		const publicKey = account.keys[0];
		const wif = await crypto.getWIFByPublicKey(networkName, publicKey);
		const privateKeyBuffer = PrivateKey.fromWif(wif).toBuffer();
		const publicKeyBuffer = PrivateKey.fromWif(wif).toPublicKey().toBuffer();
		return ED25519.signMessage(Buffer.from(message, 'utf8'), publicKeyBuffer, privateKeyBuffer);
	}

	if (method === 'signData') {
		const keys = await account.keys.reduce(async (promise, publicKey) => {
			const arr = await promise;
			const wif = await crypto.getWIFByPublicKey(networkName, publicKey);
			return wif ? [...arr, PrivateKey.fromWif(wif)] : arr;
		}, Promise.resolve([]));

		return echojsCrypto.utils.signData(Buffer.from(message, 'hex'), keys);
	}

	throw new Error('Method is not allowed');
};

export const onSignMessageApproval = async (err, id, status, message, signer) => {

	if (!status) {
		removeSignMessageRequest(err, id);
		return;
	}

	const network = await getNetwork();

	try {
		const accounts = await crypto.getInByNetwork(network.name, 'accounts') || [];
		const accountIndex = accounts.findIndex((i) => i.id === signer);
		const request = signMessageRequests.find((i) => i.id === id);

		if (accountIndex >= 0) {
			const account = accounts[accountIndex];
			const signature = await signMessage(request.method, request.message, account, network.name);
			const signatureHex = signature.toString('hex');
			removeSignMessageRequest(err, id, signatureHex);
		}

	} catch (error) {
		console.error(error);
	}
};

const listeners = new Listeners(emitter, crypto);
listeners.initBackgroundListeners(
	createAccount,
	onResponse,
	onSend,
	onSwitchNetwork,
	trSignResponse,
	onProviderApproval,
	onSignMessageApproval,
	onSwitchActiveAccount,
);

createSocket();

window.getChainLib = () => echo;
window.getCrypto = () => crypto;
window.getEmitter = () => emitter;
window.getList = () => requestQueue.map(({ id, data }) => ({ id, options: data }));
window.getPrivateKey = () => PrivateKey;
window.getAes = () => aes;
window.Transaction = () => Transaction;
window.getProviderMap = () => {
	const providerMap = {};
	ports.forEach(({ pendingRequests, origin }) => {
		pendingRequests.forEach(({ id, method }) => {
			if (method === MESSAGE_METHODS.GET_ACCESS) {
				providerMap[id] = origin;
			}
		});
	});
	return providerMap;
};


window.getSignMessageMap = () => signMessageRequests.reduce((map, {
	id, origin, message, signer, method,
}) => {
	map[id] = {
		origin,
		signer,
		message: method === 'proofOfAuthority' ? message : message.toString('hex'),
	};
	return map;
}, {});

crypto.on('unlocked', onPinUnlock);
crypto.on('locked', onLock);

extensionizer.runtime.onInstalled.addListener(onFirstInstall);

extensionizer.browserAction.setBadgeText({ text: 'BETA' });


const connectRemote = (port) => {
	const { sender } = port;
	const { tab: { id, url } } = sender;
	const { origin } = urlParse(url);

	// push object with `accessPermission`, `id` and `portObject` info
	const portObj = {
		origin,
		id,
		port,
		pendingRequests: [],
		addTask: function addTask(requestId, method) {
			this.pendingRequests.push({ id: requestId, method });
		},
	};

	// somethimes contentscript creates several instances of port connection
	if (!ports.find((portItem) => portItem.id === id)) {
		ports.push(portObj);
	}

	const onMessageCb = (message) => onMessageHandler(message, portObj);

	const onDisconnectCb = () => {
		port.onMessage.removeListener(onMessageCb);
		port.onDisconnect.removeListener(onDisconnectCb);

		const portIndex = ports.findIndex((portItem) => portItem.id === id);
		ports.splice(portIndex, 1);
	};

	port.onMessage.addListener(onMessageCb);
	port.onDisconnect.addListener(onDisconnectCb);
};

extensionizer.runtime.onConnect.addListener(connectRemote);

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} PortObject
 * @property {object} port
 * @property {string} origin
 * @property {function} addTask
 * @property {number} id
 * @property {[object]} pendingRequests
 */
