import echojs from 'echojs-ws';
import chainjs from 'echojs-lib';

import Crypto from '../src/services/crypto';

import { NETWORKS } from '../src/constants/GlobalConstants';

const crypto = new Crypto();

echojs.Apis.setAutoReconnect(false);

const instance = echojs.Apis.instance(
	NETWORKS[0].url,
	true,
	4000,
	{ enableCrypto: false },
);

instance.init_promise
	.then(() => chainjs.ChainStore.init())
	.then(() => {});

window.getWsLib = () => echojs;
window.getChainLib = () => chainjs;
window.getCrypto = () => crypto;
