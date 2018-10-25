/* global EXTENSION */

import echojs from 'echojs-ws';
import chainlib from 'echojs-lib';

import Crypto from '../services/crypto';
import extension from '../../extension/extensionizer';

const crypto = new Crypto();

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

}

export default Echo;
