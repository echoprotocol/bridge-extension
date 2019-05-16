import * as echojslib from 'echojs-lib';
import lodash from 'lodash';

import {
	APP_ID,
	CONNECTION_TIMEOUT,
	MAX_RETRIES,
	PING_INTERVAL,
	PING_TIMEOUT,
} from '../src/constants/GlobalConstants';

import { uniqueNonceUint64 } from '../src/services/crypto';

const requestQueue = [];

const networkSubscribers = [];


/**
 * network subscription
 *
 */
const networkSubscription = () => {
	const id = Date.now();

	const callback = ({ data }) => {
		/**
		 *  call all subscribers and repost subscription
		 */
		networkSubscribers.forEach((cb) => cb(data.res));
		networkSubscription();
	};

	requestQueue.push({ id, cb: callback });

	window.postMessage({
		method: 'networkSubscribe', target: 'content', appId: APP_ID, id,
	}, '*');
};

/**
 * subscribeSwitchNetwork to switch network
 * @param subscriberCb
 * @returns {Promise}
 */
const subscribeSwitchNetwork = (subscriberCb) => {
	const id = Date.now();
	const result = new Promise((resolve, reject) => {
		if (!lodash.isFunction(subscriberCb)) {
			reject(new Error('Is not a function'));
			return;
		}

		const callback = ({ data }) => {
			if (data.error) {
				reject(data.error);
				return;
			}

			resolve();

			if (!networkSubscribers.length) {
				networkSubscription();
			}

			networkSubscribers.push(subscriberCb);
			subscriberCb(data.res);
		};

		requestQueue.push({ id, cb: callback });

		window.postMessage({
			method: 'getNetwork', target: 'content', appId: APP_ID, id,
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

	const id = Date.now();
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
	const id = Date.now();
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
 * Get provider approval
 * @returns {Promise}
 */
const getAccess = () => {
	const id = Date.now();
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
			method: 'getAccess', id, target: 'content', appId: APP_ID,
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

const extension = {
	getAccounts: () => getAccounts(),
	sendTransaction: (data) => sendTransaction(data),
	subscribeSwitchNetwork: (subscriberCb) => subscribeSwitchNetwork(subscriberCb),
	getAccess: () => getAccess(),
};

window._.noConflict();
window.echojslib = echojslib;
window.echojslib.isEchoBridge = true;
window.echojslib.extension = extension;
window.echojslib.Buffer = Buffer;
window.echojslib.generateNonce = () => uniqueNonceUint64();

window.addEventListener('message', onMessage, false);
