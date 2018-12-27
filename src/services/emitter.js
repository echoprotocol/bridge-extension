import echoService from './echo';

import { getChainSubcribe } from '../api/ChainApi';

import { requestHandler, trResponseHandler, windowRequestHandler } from '../actions/SignActions';
import { sendHandler } from '../actions/BalanceActions';
import { onLogout } from '../actions/GlobalActions';
import { getCrypto, lockResponse, unlockResponse } from '../actions/CryptoActions';

const emitter = echoService.getEmitter();

class Emitter {

	constructor() {
		this.removeListeners();
	}

	static setStore(store) {
		this.store = store;
	}

	static getStore() {
		return this.store;
	}

	initListeners() {
		emitter.on('windowRequest', windowRequestHandler);
		emitter.on('request', requestHandler);
		emitter.on('trResponse', trResponseHandler);

		emitter.on('sendResponse', sendHandler);

		emitter.on('logout', onLogout);

		getCrypto().on('locked', lockResponse);
		getCrypto().on('unlocked', unlockResponse);

		window.onunload = () => {
			if (getChainSubcribe()) {
				const { ChainStore } = echoService.getChainLib();
				ChainStore.unsubscribe(getChainSubcribe());
			}

			this.removeListeners();
		};
	}

	removeListeners() {
		emitter.removeListener('request', requestHandler);
		emitter.removeListener('windowRequest', windowRequestHandler);
		emitter.removeListener('trResponse', trResponseHandler);

		getCrypto().removeListener('locked', lockResponse);
		getCrypto().removeListener('unlocked', unlockResponse);
	}

	static initBackgroundListeners(onResponse, onTransaction, onSend) {
		emitter.on('response', onResponse);
		emitter.on('trRequest', onTransaction);
		emitter.on('sendRequest', onSend);
	}

}

export default Emitter;
