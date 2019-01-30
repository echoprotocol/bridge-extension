import echoService from './echo';

import { requestHandler, trResponseHandler, windowRequestHandler } from '../actions/SignActions';
import { sendHandler } from '../actions/BalanceActions';
import { onLogout } from '../actions/GlobalActions';
import { getCrypto, lockResponse, unlockResponse } from '../actions/CryptoActions';
import { onStatusConnected, subscribe } from '../actions/ChainStoreAction';

import { CONNECT_STATUS, DISCONNECT_STATUS } from '../constants/GlobalConstants';

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
		this.onStatusConnected = (status) => dispatch(onStatusConnected(status));
		this.onGlobalSubscribe = () => dispatch(subscribe());
		// this.sign = (id, options) => dispatch(signTr(id, options));

		this.emitter.on('windowRequest', this.windowRequestHandler);
		this.emitter.on('request', this.requestHandler);
		this.emitter.on('trResponse', this.trResponseHandler);

		this.emitter.on('sendResponse', this.sendHandler);
		this.emitter.on('logout', this.onLogout);

		this.emitter.on(CONNECT_STATUS, () => this.onStatusConnected(CONNECT_STATUS));
		this.emitter.on(DISCONNECT_STATUS, () => this.onStatusConnected(DISCONNECT_STATUS));

		this.emitter.on('globalSubscribe', this.onGlobalSubscribe);

		this.crypto.on('locked', this.lockResponse);
		this.crypto.on('unlocked', this.unlockResponse);

		// this.emitter.on('transaction', this.sign);

		window.onunload = () => {
			this.removeListeners();
		};
	}

	removeListeners() {
		this.emitter.removeListener('request', this.requestHandler);
		this.emitter.removeListener('windowRequest', this.windowRequestHandler);
		this.emitter.removeListener('trResponse', this.trResponseHandler);
		this.emitter.removeListener('sendResponse', this.sendHandler);
		this.emitter.removeListener('logout', this.onLogout);
		this.emitter.removeListener(CONNECT_STATUS, this.onStatusConnected);
		this.emitter.removeListener(DISCONNECT_STATUS, this.onStatusConnected);
		this.emitter.removeListener('globalSubscribe', this.onGlobalSubscribe);

		this.crypto.removeListener('locked', this.lockResponse);
		this.crypto.removeListener('unlocked', this.unlockResponse);
	}

	initBackgroundListeners(onResponse, onTransaction, onSend, onSwitchNetwork) {
		this.emitter.on('response', onResponse);
		this.emitter.on('trRequest', onTransaction);
		this.emitter.on('sendRequest', onSend);
		this.emitter.on('switchNetwork', onSwitchNetwork);
	}

}

export default Listeners;
