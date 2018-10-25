import echojs from 'echojs-ws';
import chainjs from 'echojs-lib';

import Crypto from '../src/services/crypto';
import extensionizer from './extensionizer';
import NotificationManager from './NotificationManager';

import { NETWORKS } from '../src/constants/GlobalConstants';

const notificationManager = new NotificationManager();

const crypto = new Crypto();

const popupIsOpen = false;
const notificationIsOpen = false;
const openMetamaskTabsIDs = {};

const instance = echojs.Apis.instance(
	NETWORKS[0].url,
	true,
	4000,
	{ enableCrypto: false },
);

echojs.Apis.setAutoReconnect(false);

instance.init_promise
	.then(() => chainjs.ChainStore.init())
	.then(() => {});

window.getWsLib = () => echojs;
window.getChainLib = () => chainjs;
window.getCrypto = () => crypto;


const createPopup = () => {
	const height = 591;
	const width = 362;

	let popupId = '';

	const cb = (currentPopup) => { popupId = currentPopup.id; };

	const creation = extensionizer.windows.create({
		url: 'index.html#transactions', type: 'popup', width, height,
	}, cb);
	creation && creation.then && creation.then(cb);
};

const triggerUi = () => {
	extensionizer.tabs.query({ active: true }, (tabs) => {
		const currentlyActiveMetamaskTab = Boolean(tabs.find((tab) => openMetamaskTabsIDs[tab.id]));
		if (!popupIsOpen && !currentlyActiveMetamaskTab && !notificationIsOpen) {
			notificationManager.showPopup();
		}
	});
};

const onExternalMessage = (request, sender, sendResponse) => {
	switch (request.window) {
		case 'send':

	}
	if (request.window === 'send') {

	}
};

extensionizer.runtime.onMessageExternal.addListener(onExternalMessage);

