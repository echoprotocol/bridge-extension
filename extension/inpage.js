import * as echojslib from 'echojs-lib';
import lodash from 'lodash';

import {
	APP_ID,
	CONNECTION_TIMEOUT,
	MAX_RETRIES,
	PING_INTERVAL,
	PING_TIMEOUT,
	MESSAGE_METHODS,
} from '../src/constants/GlobalConstants';

import IdHelper from './IdHelper';

const requestQueue = [];

const networkSubscribers = [];
const accountSubscribers = [];
const accountChangedSubscribers = [];

let activeAccount = null;

const INPAGE_ID = IdHelper.getId();

/**
 * @description dispatch notify response that is received from background like switchNetwork, switchAccount, activeAccount
 * @param {Object} eventData
 */
const dispatchNotifyResponse = (eventData) => {
	const { method, res } = eventData;

	switch (method) {
		case MESSAGE_METHODS.SWITCH_NETWORK_SUBSCRIBE: {
			networkSubscribers.forEach((cb) => cb(res));
			break;
		}
		case MESSAGE_METHODS.SWITCH_ACCOUNT_SUBSCRIBE: {
			accountSubscribers.forEach((cb) => cb(res));
			break;
		}
		case MESSAGE_METHODS.ACTIVE_SWITCH_ACCOUNT_SUBSCRIBE: {

			// accountSubscribers.forEach((cb) => cb(res.find((account) => account.active)));
			// const prevAccount = activeAccount;
			const error = eventData.error || (res && res.error);

			activeAccount = error ? null : res;

			// if (prevAccount !== activeAccount) {
			accountChangedSubscribers.forEach((cb) => cb(res));
			// }
			break;
		}
		default: break;
	}
};


/**
 * Get current network
 * @returns {Promise}
 */
const getCurrentNetwork = () => {
	const id = IdHelper.getId();

	const result = new Promise((resolve, reject) => {
		const callback = ({ data }) => {
			if (data.error) {
				reject(data.error);
				return;
			}

			resolve(data.res);
		};

		requestQueue.push({ id, cb: callback });

		window.postMessage({
			method: MESSAGE_METHODS.GET_NETWORK, target: 'content', appId: APP_ID, id,
		}, '*');
	});

	return result;
};

/**
 * subscribeSwitchNetwork to switch network
 * @param subscriberCb
 * @returns {Promise}
 */
const subscribeSwitchNetwork = (subscriberCb) => {
	const id = IdHelper.getId();

	const result = new Promise((resolve, reject) => {
		if (!lodash.isFunction(subscriberCb)) {
			reject(new Error('Is not a function'));
			return;
		}

		networkSubscribers.push(subscriberCb);

		const callback = ({ data }) => (data.error ? reject(data.error) : resolve(data.res));
		requestQueue.push({ id, cb: callback });

		window.postMessage({
			method: MESSAGE_METHODS.GET_NETWORK, target: 'content', appId: APP_ID, id,
		}, '*');
	});

	return result;
};

/**
 * Notify about switch account
 * @param {Function} subscriberCb
 * @returns {Promise}
 */
const subscribeAccountChanged = (subscriberCb) => {

	// TODO
	if (!lodash.isFunction(subscriberCb)) {
		throw new Error('The first argument is not a function');
	}

	const id = IdHelper.getId();

	const result = new Promise((resolve, reject) => {

		const callback = ({ data }) => {
			console.log('TCL: callback -> subscribeAccountChanged', data);

			if (data.error) {
				reject(data.error);
				return;
			}

			if (data.response) {

				accountChangedSubscribers.push(subscriberCb);

				resolve(activeAccount);
				subscriberCb(activeAccount);
				return;
			}

			reject(new Error('No access'));
		};

		requestQueue.push({ id, cb: callback });

		window.postMessage({
			method: MESSAGE_METHODS.CHECK_ACCESS, target: 'content', appId: APP_ID, id,
		}, '*');

	});

	return result;


};

// /**
//  * @method notifyAccountChanged
//  * @param {String|null} accountId
//  */
// const notifyAccountChanged = (accountId) => {
// 	accountChangedSubscribers.forEach((cb) => {
// 		cb(accountId);
// 	});

// };

/**
 * Notify about switch account
 * @param {Function} subscriberCb
 * @returns {Promise}
 */
const subscribeSwitchAccount = (subscriberCb) => {
	const id = IdHelper.getId();

	const result = new Promise((resolve, reject) => {
		if (!lodash.isFunction(subscriberCb)) {
			reject(new Error('Is not a function'));
			return;
		}

		accountSubscribers.push(subscriberCb);

		const callback = ({ data }) => (data.error ? reject(data.error) : resolve());
		requestQueue.push({ id, cb: callback });

		window.postMessage({
			method: MESSAGE_METHODS.ACCOUNTS, target: 'content', appId: APP_ID, id,
		}, '*');
	});

	return result;
};

echojslib.echo = echojslib.default;

const oldConnect = echojslib.echo.connect;

/**
 *
 * @param {String} url
 * @param {Object} params
 * @returns {Promise<any>}
 */
echojslib.echo.connect = (url, params) => {
	const connectionParams = params || {
		connectionTimeout: CONNECTION_TIMEOUT,
		maxRetries: MAX_RETRIES,
		pingTimeout: PING_TIMEOUT,
		pingInterval: PING_INTERVAL,
		debug: false,
		apis: ['database', 'network_broadcast', 'history', 'registration', 'asset', 'login', 'network_node'],
	};

	const id = IdHelper.getId();

	const result = new Promise((resolve, reject) => {

		const cb = async ({ data }) => {
			await oldConnect.apply(echojslib.echo, [url || data.res.url, connectionParams]);

			if (data.res.error) {
				reject(data.res.error);
			} else {
				resolve(`Connected to ${data.res.url}`);
			}
		};

		requestQueue.push({ id, cb });
		window.postMessage({
			method: 'getNetwork', id, target: 'content', appId: APP_ID,
		}, '*');

	});

	return result;
};

/**
 * On content script message
 * @param event
 */
const onMessage = (event) => {
	console.log('TCL: onMessage -> event', event);

	const { id, target, appId } = event.data;

	if (target !== 'inpage' || !appId || appId !== APP_ID) return;

	if (!id) {
		dispatchNotifyResponse(event.data);
	} else {
		const requestIndex = requestQueue.findIndex(({ id: requestId }) => requestId === id);
		console.log('TCL: onMessage -> requestQueue', requestQueue);
		console.log('TCL: onMessage -> requestIndex', requestIndex);
		if (requestIndex === -1) return;

		const request = requestQueue.splice(requestIndex, 1);
		request[0].cb(event);
	}


};


/**
 * Send custom transaction
 * @param options
 * @returns {Promise}
 */
const sendTransaction = (options) => {
	const id = IdHelper.getId();

	const result = new Promise((resolve, reject) => {
		const cb = ({ data }) => {

			const { status, text, resultBroadcast } = data;

			if (status === 'approved') {
				resolve({ status, resultBroadcast });
			} else {
				reject(data.error || text || status);
			}
		};
		requestQueue.push({ id, cb });
		window.postMessage({
			method: 'confirm', data: options, id, target: 'content', appId: APP_ID,
		}, '*');

	});

	return result;

};


/**
 * Get user account if unlocked
 * @returns {Promise}
 */
const getAccounts = () => {
	const id = IdHelper.getId();

	const result = new Promise((resolve, reject) => {

		const cb = ({ data }) => {
			if (data.error || data.res.error) {
				reject(data.error || data.res.error);
			} else {
				resolve(data.res);
			}
		};

		requestQueue.push({ id, cb });
		window.postMessage({
			method: 'accounts', id, target: 'content', appId: APP_ID,
		}, '*');

	});

	return result;
};


/**
 * @method backgroundRequest
 * @param {String} method
 */
const backgroundRequest = (method) => {
	const id = `${method}_${IdHelper.getId()}`;

	const result = new Promise((resolve, reject) => {

		const cb = ({ data }) => {
			if (data.error || (data.res && data.res.error)) {
				reject(data.error || data.res.error);
			} else {
				resolve(data.res);
			}
		};

		requestQueue.push({ id, cb });

		window.postMessage({
			method, id, target: 'content', appId: APP_ID,
		}, '*');

	});

	return result;
};

const requestAccount = () => backgroundRequest('requestAccount');
/**
 * Load active bridge account
 * @returns {undefined}
 */
const loadActiveAccount = () => {

	const cb = ({ data }) => {
		const error = data.error || (data.res && data.res.error);

		if (error) {
			activeAccount = null;
		} else {
			activeAccount = data.res;
		}
	};

	const id = IdHelper.getId();

	requestQueue.push({ id, cb });
	window.postMessage({
		method: MESSAGE_METHODS.ACTIVE_SWITCH_ACCOUNT_SUBSCRIBE, id, target: 'content', appId: APP_ID, inPageId: INPAGE_ID,
	}, '*');
};

const proofOfAuthority = (message, accountId) => {
	const id = IdHelper.getId();
	const result = new Promise((resolve, reject) => {

		const cb = ({ data }) => {
			if (data.error) {
				reject(data.error);
			} else {
				resolve(data.signature);
			}
		};

		requestQueue.push({ id, cb });
		window.postMessage({
			method: 'proofOfAuthority',
			id,
			data: { message, accountId },
			target: 'content',
			appId: APP_ID,
		}, '*');

	});

	return result;
};

const signData = (message, accountId) => {
	const id = IdHelper.getId();
	const result = new Promise((resolve, reject) => {

		if (!Buffer.isBuffer(message)) {
			reject(new Error('Message isn\'t a Buffer'));
			return;
		}

		const cb = ({ data }) => {
			if (data.error) {
				reject(data.error);
			} else {
				resolve(data.signature);
			}
		};

		requestQueue.push({ id, cb });
		window.postMessage({
			method: 'signData',
			id,
			data: {
				message: message.toString('hex'),
				accountId,
			},
			target: 'content',
			appId: APP_ID,
		}, '*');

	});

	return result;
};

/**
 * Get provider approval
 * @returns {Promise}
 */
const getAccess = () => {
	const id = IdHelper.getId();

	const result = new Promise((resolve, reject) => {

		const cb = ({ data }) => {
			if (data.error) {
				reject(data.error);
			} else {
				resolve(data.status);
			}
		};

		requestQueue.push({ id, cb });
		window.postMessage({
			method: MESSAGE_METHODS.GET_ACCESS, id, target: 'content', appId: APP_ID,
		}, '*');

	});

	return result;
};


class Signat {

	/**
	 *
	 * @param {String} value hex
	 */
	constructor(value) {
		this.value = value;
	}

	toBuffer() {
		return Buffer.from(this.value, 'hex');
	}

}

echojslib.Transaction.prototype.signWithBridge = async function signWithBridge() {
	const id = IdHelper.getId();

	if (!this.hasAllFees) {
		await this.setRequiredFees();
	}

	const result = new Promise((resolve, reject) => {
		if (!this._operations.length) {
			return reject(new Error('Operation required'));
		}

		const cb = ({ data }) => {
			if (data.error) {
				reject(data.error);
				return;
			}

			const signData = JSON.parse(data.signData);

			if (this._operations[0][1].from) {
				this._operations[0][1].from = signData.accountId;
			} else if (this._operations[0][1].registrar) {
				this._operations[0][1].registrar = signData.accountId;
			}

			this._refBlockNum = signData.ref_block_num;
			this._refBlockPrefix = signData.ref_block_prefix;
			this._expiration = signData.expiration;
			this._signatures = signData.serializedSignatures.map((hexString) => new Signat(hexString));

			this._finalized = true;

			resolve(this);
		};

		requestQueue.push({ id, cb });

		const operations = JSON.stringify(this._operations);

		window.postMessage({
			method: 'confirm',
			data: operations,
			id,
			target: 'content',
			appId: APP_ID,
		}, '*');

		return null;
	});

	return result;
};

const extension = {
	get activeAccount() { return activeAccount; },
	getAccounts: () => getAccounts(),
	requestAccount: () => requestAccount(),
	sendTransaction: (data) => sendTransaction(data),
	getCurrentNetwork: () => getCurrentNetwork(),
	subscribeSwitchNetwork: (subscriberCb) => subscribeSwitchNetwork(subscriberCb),
	subscribeSwitchAccount: (subscriberCb) => subscribeSwitchAccount(subscriberCb),
	getAccess: () => getAccess(),
	proofOfAuthority: (message, accountId) => proofOfAuthority(message, accountId),
	signData: (message, accountId) => signData(message, accountId),
	subscribeAccountChanged: (subscriberCb) => subscribeAccountChanged(subscriberCb),
};

window._.noConflict();
window.echojslib = echojslib;
window.echojslib.isEchoBridge = true;
window.echojslib.extension = extension;
window.echojslib.Buffer = Buffer;

window.addEventListener('message', onMessage, false);

loadActiveAccount();
