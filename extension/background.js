/* eslint-disable no-nested-ternary */
import echojs from 'echojs-ws';
import chainjs from 'echojs-lib';
import EventEmitter from 'events';

import Crypto from '../src/services/crypto';
import extensionizer from './extensionizer';
import NotificationManager from './NotificationManager';

import { NETWORKS } from '../src/constants/GlobalConstants';

const notificationManager = new NotificationManager();
const emitter = new EventEmitter();
const crypto = new Crypto();

const storage = extensionizer.storage.local;

const requestQueue = [];

const createSocket = () => {
	const instance = echojs.Apis.instance(NETWORKS[0].url, true, 4000);

	echojs.Apis.setAutoReconnect(false);

	instance.init_promise
		.then(() => chainjs.ChainStore.init())
		.then(() => {});
};

const triggerUi = () => {
	notificationManager.showPopup();

};

const closeUi = () => {
	notificationManager.closePopup();
};

const setBadge = () => {
	const { length } = requestQueue;
	const text = length === 0 ? '' : (length > 9 ? '9+' : length.toString());
	extensionizer.browserAction.setBadgeText({ text });
};

const getAccountList = async () => {
	const currentNetworkPromise = new Promise((resolve) => {
		storage.get(null, (result) => {
			const err = extensionizer.runtime.lastError;

			if (err) {
				return resolve(NETWORKS[0]);
			}

			return resolve(result.current_network || NETWORKS[0]);

		});
	});

	const network = await currentNetworkPromise;

	try {
		const accounts = await crypto.getInByNetwork(network.name, 'accounts') || [];
		return accounts;
	} catch (e) {
		return { error: e.message };
	}
};

const onExternalMessage = (request, sender, sendResponse) => {
	if (!request.method || !request.id) return false;

	const { id } = request;

	if (request.method === 'confirm' && request.data) {

		requestQueue.push({
			data: request.data, sender, id, cb: sendResponse,
		});

		emitter.emit('request', id, request);

		notificationManager.getPopup()
			.then((popup) => !popup && triggerUi())
			.catch(triggerUi);

	} else if (request.method === 'accounts') {
		getAccountList().then((res) => sendResponse({ id, res }));
	}

	return true;
};

const onResponse = async (err, id, status) => {
	const requestIndex = requestQueue.findIndex(({ id: requestId }) => requestId === id);
	if (requestIndex === -1) return;

	requestQueue.splice(requestIndex, 1)[0].cb({ id, status, text: err });

	notificationManager.getPopup()
		.then((popup) => {
			if (requestQueue.length === 0 || !popup) closeUi();
		});
};

createSocket();

window.getWsLib = () => echojs;
window.getChainLib = () => chainjs;
window.getCrypto = () => crypto;
window.getEmitter = () => emitter;
window.getList = () => requestQueue.map(({ id, request }) => ({ id, request }));

emitter.on('response', onResponse);

extensionizer.runtime.onMessage.addListener(onExternalMessage);

extensionizer.browserAction.setBadgeText({ text: 'BETA' });
