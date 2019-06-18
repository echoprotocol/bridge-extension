/* eslint-disable global-require */
/* global EXTENSION */

import chainlib from 'echojs-lib';
import EventEmitter from '../../libs/CustomAwaitEmitter';

import Crypto from '../services/crypto';
import extension from '../../extension/extensionizer';

const crypto = new Crypto();
const ee = new EventEmitter();


if (EXTENSION) {
	require('../assets/images/16.png');
	require('../assets/images/32.png');
	require('../assets/images/48.png');
	require('../assets/images/96.png');
	require('../assets/images/128.png');
}

class Echo {

	static getChainLib() {
		return EXTENSION ? extension.extension.getBackgroundPage().getChainLib() : chainlib;
	}

	static getCrypto() {
		return EXTENSION ? extension.extension.getBackgroundPage().getCrypto() : crypto;
	}

	static getEmitter() {
		return EXTENSION ? extension.extension.getBackgroundPage().getEmitter() : ee;
	}

	static getRequests() {
		return EXTENSION ? extension.extension.getBackgroundPage().getList() : [];
	}

	static getProviderRequests() {
		return EXTENSION ? extension.extension.getBackgroundPage().getProviderMap() : {};
	}

	static getSignMessageRequests() {
		return EXTENSION ? extension.extension.getBackgroundPage().getSignMessageMap() : {};
	}

}

export default Echo;
