import echojs from 'echojs-ws';
import chainjs from 'echojs-lib';

import Crypto from '../src/services/crypto';

import { NETWORKS } from '../src/constants/GlobalConstants';

const crypto = new Crypto();

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

// const height = 620;
// const width = 360;
//
// let popupId = '';
//
// const cb = (currentPopup) => { popupId = currentPopup.id; };
// // create new notification popup
// const creation = extension.windows.create({
// 	url: 'index.html', type: 'popup', width, height
// }, cb);
// creation && creation.then && creation.then(cb);
