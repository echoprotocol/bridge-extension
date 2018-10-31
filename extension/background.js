/* eslint-disable no-nested-ternary */
import echojs from 'echojs-ws';
import chainjs from 'echojs-lib';
import EventEmitter from 'events';

import Crypto from '../src/services/crypto';
import storage from '../src/services/storage';
import extensionizer from './extensionizer';
import NotificationManager from './NotificationManager';

import { NETWORKS, APP_ID } from '../src/constants/GlobalConstants';

const notificationManager = new NotificationManager();
const emitter = new EventEmitter();
const crypto = new Crypto();


const requestQueue = [];
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
			.then((popup) => !popup && triggerPopup())
			.catch(triggerPopup);
	} else if (request.method === 'accounts') {
		getAccountList().then((res) => sendResponse({ id, res }));
	}

	return true;
};

/**
 * On extension emitter response
 * @param err
 * @param id
 * @param status
 * @returns {Promise.<void>}
 */
const onResponse = async (err, id, status) => {
	const requestIndex = requestQueue.findIndex(({ id: requestId }) => requestId === id);
	if (requestIndex === -1) return;

	requestQueue.splice(requestIndex, 1)[0].cb({ id, status, text: err });

	setBadge();
	createNotification('Transaction', `${status} ${err ? err.toLowerCase() : ''}`);

	if (requestQueue.length === 0) closePopup();
};

createSocket();

window.getWsLib = () => echojs;
window.getChainLib = () => chainjs;
window.getCrypto = () => crypto;
window.getEmitter = () => emitter;
window.getList = () => requestQueue.map(({ id, data }) => ({ id, options: data }));

emitter.on('response', onResponse);

extensionizer.runtime.onMessage.addListener(onMessage);

extensionizer.browserAction.setBadgeText({ text: 'BETA' });
