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

let isPopupOpen = false;
const requestQueue = [];

const createSocket = () => {
	const instance = echojs.Apis.instance(NETWORKS[0].url, true, 4000);

	echojs.Apis.setAutoReconnect(false);

	instance.init_promise
		.then(() => chainjs.ChainStore.init())
		.then(() => {});
};

const triggerUi = () => {
	console.log('trigger');
	isPopupOpen = true;
	notificationManager.showPopup();

};

const closeUi = () => {
	isPopupOpen = false;
	notificationManager.closePopup();
};

const setBadge = () => {
	const { length } = requestQueue;
	const text = length === 0 ? '' : (length > 9 ? '9+' : length.toString());
	extensionizer.browserAction.setBadgeText({ text });
};

const getAccountList = () => {

};

const onExternalMessage = (request, sender, sendResponse) => {
	if (!request.method) return;

	if (request.method === 'confirm' && request.data) {

		const id = Date.now();

		requestQueue.push({
			data: request.data, sender, id, cb: sendResponse,
		});

		setBadge();
		emitter.emit('request', id, request);

		notificationManager.getPopup((err, popup) => {
			console.log(err, popup, err || !popup);
			if (err || !popup) triggerUi();
		});
	} else if (request.method === 'accounts') {
		requestQueue.shift().cb(request.method);
		// sendResponse();

		setBadge();

		notificationManager.getPopup((popupErr, popup) => {
			if (requestQueue.length === 0 || !popup) closeUi();
		});

		// let res = [];
		// try {
		// 	res = getAccountList();
		// } catch (e) {
		// 	res = e;
		// } finally {
		// 	sendResponse(res);
		// }
	}
};

const onResponse = (err, id, status) => {
	const requestIndex = requestQueue.findIndex(({ id: requestId }) => requestId === id);
	if (requestIndex === -1) return;

	requestQueue.splice(requestIndex, 1)[0].cb({ status, text: err });

	setBadge();

	notificationManager.getPopup((popupErr, popup) => {
		if (requestQueue.length === 0 || !popup) closeUi();
	});
};


createSocket();

window.getWsLib = () => echojs;
window.getChainLib = () => chainjs;
window.getCrypto = () => crypto;
window.getEmitter = () => emitter;
window.isPopupOpen = () => isPopupOpen;
window.getList = () => requestQueue.map(({ id, request }) => ({ id, request }));

emitter.on('response', onResponse);

extensionizer.runtime.onMessageExternal.addListener(onExternalMessage);
extensionizer.browserAction.setBadgeBackgroundColor({ color: [70, 120, 50, 255] });
