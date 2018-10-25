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

const popupIsOpen = false;
const notificationIsOpen = false;
const openBridgeTabsIDs = {};
const requestQueue = [];

const createSocket = () => {
	const instance = echojs.Apis.instance(NETWORKS[0].url, true, 4000);

	echojs.Apis.setAutoReconnect(false);

	instance.init_promise
		.then(() => chainjs.ChainStore.init())
		.then(() => {});
};

const triggerUi = (tabId) => {
	extensionizer.tabs.query({ active: true }, (tabs) => {
		const currentlyActiveMetamaskTab = Boolean(tabs.find((tab) => openBridgeTabsIDs[tab.id]));
		if (!popupIsOpen && !currentlyActiveMetamaskTab && !notificationIsOpen) {
			notificationManager.showPopup();
			openBridgeTabsIDs[tabId] = true;

		}
	});
};

const isPopupOpen = (tabId) => openBridgeTabsIDs[tabId];

const onExternalMessage = (request, sender, sendResponse) => {
	const id = Date.now();
	requestQueue.push({
		request, sender, id, cb: sendResponse,
	});
	const tabId = sender.tab.id;
	if (isPopupOpen(tabId)) {
		emitter.emit('request', id, request);
	} else {
		triggerUi(tabId);
	}

	// todo onClose popup event and remove it from openBridgeTabsIDs map
	// https://developer.chrome.com/extensions/windows#method-create
};

const onResponse = (err, id, status) => {
	const request = requestQueue.find(({ id: requestId }) => requestId === id);
	if (!request) return;

	request.cb({ status, text: err });
};


createSocket();

window.getWsLib = () => echojs;
window.getChainLib = () => chainjs;
window.getCrypto = () => crypto;
window.getEmitter = () => emitter;
window.getList = () => requestQueue.map(({ id, request }) => ({ id, request }));

emitter.on('response', onResponse);

extensionizer.runtime.onMessageExternal.addListener(onExternalMessage);

