/* global EXTENSION */

import echojs from 'echojs-ws';
import chainlib from 'echojs-lib';
import EventEmitter from 'events';

import Crypto from '../services/crypto';
import extension from '../../extension/extensionizer';

const crypto = new Crypto();
const ee = new EventEmitter();

class Echo {

	static getWsLib() {
		return EXTENSION ? extension.extension.getBackgroundPage().getWsLib() : echojs;
	}

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
		return EXTENSION ? extension.extension.getBackgroundPage().getRequests() : [];
	}

}

export default Echo;
