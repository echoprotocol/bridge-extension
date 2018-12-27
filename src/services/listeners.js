import echoService from './echo';

import { getChainSubcribe } from '../api/ChainApi';

import { requestHandler, trResponseHandler, windowRequestHandler } from '../actions/SignActions';
import { sendHandler } from '../actions/BalanceActions';
import { onLogout } from '../actions/GlobalActions';
import { getCrypto, lockResponse, unlockResponse } from '../actions/CryptoActions';

class Listeners {

	constructor(emitter, crypto) {
		this.emitter = emitter || echoService.getEmitter();
		this.crypto = crypto || getCrypto();
	}

	initListeners(dispatch) {
		this.windowRequestHandler = (id, windowType) =>
			dispatch(windowRequestHandler(id, windowType));
		this.requestHandler = (id, options) => dispatch(requestHandler(id, options));
		this.trResponseHandler = (status, id, path, windowType) =>
			dispatch(trResponseHandler(status, id, path, windowType));
		this.sendHandler = (path) => dispatch(sendHandler(path));
		this.onLogout = (name) =>
			dispatch(onLogout(name));
		this.lockResponse = () => dispatch(lockResponse());
		this.unlockResponse = () => dispatch(unlockResponse());

		this.emitter.on('windowRequest', this.windowRequestHandler);
		this.emitter.on('request', this.requestHandler);
		this.emitter.on('trResponse', this.trResponseHandler);

		this.emitter.on('sendResponse', this.sendHandler);

		this.emitter.on('logout', this.onLogout);

		this.crypto.on('locked', this.lockResponse);
		this.crypto.on('unlocked', this.unlockResponse);

		window.onunload = () => {
			this.removeListeners();
		};
	}

	removeListeners() {
		if (getChainSubcribe()) {
			const { ChainStore } = echoService.getChainLib();
			ChainStore.unsubscribe(getChainSubcribe());
		}

		this.emitter.removeListener('request', this.requestHandler);
		this.emitter.removeListener('windowRequest', this.windowRequestHandler);
		this.emitter.removeListener('trResponse', this.trResponseHandler);
		this.emitter.removeListener('sendResponse', this.sendHandler);
		this.emitter.removeListener('logout', this.onLogout);

		this.crypto.removeListener('locked', this.lockResponse);
		this.crypto.removeListener('unlocked', this.unlockResponse);
	}

	initBackgroundListeners(onResponse, onTransaction, onSend) {
		this.emitter.on('response', onResponse);
		this.emitter.on('trRequest', onTransaction);
		this.emitter.on('sendRequest', onSend);
	}

}

export default Listeners;
