
import chainjs from 'echojs-lib';
import echojs from 'echojs-ws';

import { connectToAddress, fetchChain } from '../api/ChainApi';

import { NETWORKS } from '../constants/GlobalConstants';
import { ChainStoreCacheNames } from '../constants/ChainStoreConstants';


// ChainStoreCacheNames.forEach(({ origin, custom: field }) => {
//     const value = ChainStore[origin];
// });


window.getWsLib = () => echojs;
window.getChainLib = () => chainjs;
window.connectToAddress = async (address, subsCb) => connectToAddress(address, subsCb);
window.fetchChain = async (key) => fetchChain(key);


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

// const height = 620;
// const width = 360;
//
// let popupId = '';
//
// const cb = (currentPopup) => { popupId = currentPopup.id; };
// // create new notification popup
// const creation = extension.windows.create({
// 	url: 'index.html',
// 	type: 'popup',
// 	width,
// 	height,
// }, cb);
// creation && creation.then && creation.then(cb);
