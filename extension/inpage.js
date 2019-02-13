import echo, { Transaction, constants, PublicKey } from 'echojs-lib';
import lodash from 'lodash';
import BigNumber from 'bignumber.js';

import {
	APP_ID,
	CONNECTION_TIMEOUT,
	MAX_RETRIES,
	NETWORKS,
	PING_INTERVAL,
	PING_TIMEOUT
} from '../src/constants/GlobalConstants';

import { uniqueNonceUint64 } from '../src/services/crypto';

const requestQueue = [];

const networkSubscribers = [];

/**
 * subscribeSwitchNetwork to switch network
 * @param subscriberCb
 */
const subscribeSwitchNetwork = (subscriberCb) => {

	if (subscriberCb) {
		networkSubscribers.push(subscriberCb);
		return window.postMessage({
			method: 'getNetwork', target: 'content', appId: APP_ID,
		}, '*');
	}
	return window.postMessage({
		method: 'networkSubscribe', target: 'content', appId: APP_ID,
	}, '*');
};

/**
 * On content script message
 * @param event
 */
const onMessage = (event) => {
	if (event.data.subscriber) {

		networkSubscribers.forEach((cb) => cb(event.data.res));
		subscribeSwitchNetwork();
		return;
	}

	const { id, target, appId } = event.data;

	if (!id || target !== 'inpage' || !appId || appId !== APP_ID) return;

	const requestIndex = requestQueue.findIndex(({ id: requestId }) => requestId === id);
	if (requestIndex === -1) return;

	requestQueue.splice(requestIndex, 1)[0].cb(event);
};


/**
 * Send custom transaction
 * @param options
 * @returns {Promise}
 */
const sendTransaction = (options) => {

	const id = Date.now();
	const result = new Promise((resolve, reject) => {
		const cb = ({ data }) => {

			const { status, text, resultBroadcast } = data;

			if (status === 'approved') {
				resolve({ status, resultBroadcast });
			} else {
				reject(text || status);
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
	const id = Date.now();
	const result = new Promise((resolve, reject) => {

		const cb = ({ data }) => {

			if (data.res.error) {
				reject(data.res.error);
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

Transaction.prototype.signWithBridge = async function signWithBridge() {
	const id = Date.now();

	if (!this.hasAllFees) {
		await this.setRequiredFees();
	}

	const result = new Promise((resolve, reject) => {
		if (!this._operations.length) {
			return reject(new Error('Operation required'));
		}

		const cb = ({ data }) => {
			const signData = JSON.parse(data.signData);

			if (signData.memoMessage) {
				this._operations[0][1].memo.message = Buffer.from(signData.memoMessage, 'hex');
			}

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

const connectBridge = (url, params) => {
	const options = params || {
		connectionTimeout: CONNECTION_TIMEOUT,
		maxRetries: MAX_RETRIES,
		pingTimeout: PING_TIMEOUT,
		pingInterval: PING_INTERVAL,
		debug: false,
		apis: ['database', 'network_broadcast', 'history', 'registration', 'asset', 'login', 'network_node'],
	};

	echo.connect(url || NETWORKS[0].url, options);
};

const extension = {
	getAccounts: () => getAccounts(),
	sendTransaction: (data) => sendTransaction(data),
	subscribeSwitchNetwork: (subscriberCb) => {

		if (!lodash.isFunction(subscriberCb)) {
			throw new Error('Is not a function');
		}

		subscribeSwitchNetwork(subscriberCb);
	},
};

window._.noConflict();
window.echojslib = echo;
window.echojslib.isEchoBridge = true;
window.echojslib.extension = extension;
window.echojslib.constants = constants;
window.echojslib.helpers = {
	BigNumber,
};
window.echojslib.PublicKey = PublicKey;
window.echojslib.Buffer = Buffer;
window.echojslib.generateNonce = () => uniqueNonceUint64();
window.echojslib.connectBridge = (url, params) => connectBridge(url, params);

window.addEventListener('message', onMessage, false);

