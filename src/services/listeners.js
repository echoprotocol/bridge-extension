import echoService from './echo';

import { requestHandler, signTr, trResponseHandler, windowRequestHandler } from '../actions/SignActions';
import { sendHandler } from '../actions/BalanceActions';
import {
	onLogout,
	addAccount,
	addAccountError,
	addProviderRequest,
	removeProviderRequest,
	addSignMessageRequest,
	removeSignMessageRequest,
} from '../actions/GlobalActions';
import { getCrypto, lockResponse, unlockResponse } from '../actions/CryptoActions';

import { offerName } from '../actions/AuthActions';

import { onStatusConnected, subscribe } from '../actions/ChainStoreAction';

import { CONNECT_STATUS, DISCONNECT_STATUS } from '../constants/GlobalConstants';


class Listeners {

	constructor(emitter, crypto) {
		this.emitter = emitter || echoService.getEmitter();
		this.crypto = crypto || getCrypto();
	}

	initListeners(dispatch) {
		this.windowRequestHandler = (id, windowType, status) =>
			dispatch(windowRequestHandler(id, windowType, status));
		this.requestHandler = (id, options) => dispatch(requestHandler(id, options));
		this.trResponseHandler = (status, id, path, windowType) =>
			dispatch(trResponseHandler(status, id, path, windowType));
		this.sendHandler = (path) => dispatch(sendHandler(path));
		this.onLogout = (name) =>
			dispatch(onLogout(name));
		this.lockResponse = () => dispatch(lockResponse());
		this.unlockResponse = () => dispatch(unlockResponse());

		this.offerName = (error, example) => dispatch(offerName(error, example));

		this.onStatusConnected = (status) => dispatch(onStatusConnected(status));
		this.onGlobalSubscribe = () => dispatch(subscribe());
		this.sign = (id, options) => dispatch(signTr(id, options));
		this.addAccount = (name, keys, networkName, link) => {
			dispatch(addAccount(name, keys, networkName, link));
		};
		this.addAccountError = (error) => dispatch(addAccountError(error));

		this.addProviderRequestHandler = (id, origin) => dispatch(addProviderRequest(id, origin));

		this.addSignMessageRequestHandler =
			(id, origin, signer, message, method) =>
				dispatch(addSignMessageRequest(id, origin, signer, message, method));

		this.removeSignMessageRequestHandler = (id) => dispatch(removeSignMessageRequest(id));

		this.removeProviderRequestHandler = (id) => dispatch(removeProviderRequest(id));

		this.emitter.on('windowRequest', this.windowRequestHandler);
		this.emitter.on('request', this.requestHandler);
		this.emitter.on('trResponse', this.trResponseHandler);

		this.emitter.on('addProviderRequest', this.addProviderRequestHandler);
		this.emitter.on('removeProviderRequest', this.removeProviderRequestHandler);

		this.emitter.on('addSignMessageRequest', this.addSignMessageRequestHandler);
		this.emitter.on('removeSignMessageRequest', this.removeSignMessageRequestHandler);


		this.emitter.on('sendResponse', this.sendHandler);
		this.emitter.on('logout', this.onLogout);
		this.emitter.on('offerName', this.offerName);

		this.emitter.on(CONNECT_STATUS, () => this.onStatusConnected(CONNECT_STATUS));
		this.emitter.on(DISCONNECT_STATUS, () => this.onStatusConnected(DISCONNECT_STATUS));

		this.emitter.on('globalSubscribe', this.onGlobalSubscribe);

		this.crypto.on('locked', this.lockResponse);
		this.crypto.on('unlocked', this.unlockResponse);

		this.emitter.on('transaction', this.sign);
		this.emitter.on('addAccount', this.addAccount);
		this.emitter.on('addAccountError', this.addAccountError);

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
		this.emitter.removeListener('offerName', this.offerName);
		this.emitter.removeListener(CONNECT_STATUS, this.onStatusConnected);
		this.emitter.removeListener(DISCONNECT_STATUS, this.onStatusConnected);
		this.emitter.removeListener('globalSubscribe', this.onGlobalSubscribe);
		this.emitter.removeListener('transaction', this.sign);
		this.emitter.removeListener('addAccount', this.addAccount);
		this.emitter.removeListener('addAccountError', this.addAccountError);

		this.emitter.removeListener('addProviderRequest', this.addProviderRequestHandler);
		this.emitter.removeListener('removeProviderRequest', this.removeProviderRequestHandler);
		this.emitter.removeListener('addSignMessageRequest', this.addSignMessageRequestHandler);
		this.emitter.removeListener('removeSignMessageRequest', this.removeSignMessageRequestHandler);

		this.crypto.removeListener('locked', this.lockResponse);
		this.crypto.removeListener('unlocked', this.unlockResponse);
	}

	initBackgroundListeners(
		createAccount, onResponse, onSend, onSwitchNetwork,
		trSignResponse, onProviderApproval, onSignMessageApproval,
		onSwitchActiveAccount,
	) {
		this.emitter.on('createAccount', createAccount);
		this.emitter.on('response', onResponse);
		this.emitter.on('sendRequest', onSend);
		this.emitter.on('switchNetwork', onSwitchNetwork);
		this.emitter.on('trSignResponse', trSignResponse);
		this.emitter.on('providerResponse', onProviderApproval);
		this.emitter.on('signMessageResponse', onSignMessageApproval);
		this.emitter.on('activeAccountResponse', onSwitchActiveAccount);
	}

}

export default Listeners;
