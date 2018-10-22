/* global EXTENSION */

import echojs from 'echojs-ws';
import chainlib from 'echojs-lib';

import extension from '../../extension/extensionizer';

class Echo {

	static getWsLib() {
		return EXTENSION ? extension.extension.getBackgroundPage().getWsLib() : echojs;
	}

	static getChainLib() {
		return EXTENSION ? extension.extension.getBackgroundPage().getChainLib() : chainlib;
	}

}

export default Echo;
