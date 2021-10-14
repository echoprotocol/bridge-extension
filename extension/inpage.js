/* eslint-disable no-underscore-dangle */
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

/**
 * @member dispatchNotifyResponse
 * @description dispatch notify response that is received from background like switchNetwork,
 * switchAccount, activeAccount
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
		case MESSAGE_METHODS.ACTIVE_ACCOUNT_SUBSCRIBE: {
			const error = eventData.error || (res && res.error);
			activeAccount = error ? null : res;

			accountChangedSubscribers.forEach((cb) => cb(res));
			break;
		}
		default: break;
	}
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
			method: MESSAGE_METHODS.GET_NETWORK, id, target: 'content', appId: APP_ID,
		}, '*');

	});

	return result;
};

/**
 * On content script message
 * @method onMessage
 * @param event
 */
const onMessage = (event) => {

	const { id, target, appId } = event.data;

	if (target !== 'inpage' || !appId || appId !== APP_ID) return;

	if (!id) {
		dispatchNotifyResponse(event.data);
	} else {
		const requestIndex = requestQueue.findIndex(({ id: requestId }) => requestId === id);
		if (requestIndex === -1) return;

		const request = requestQueue.splice(requestIndex, 1);
		request[0].cb(event);
	}
};

/**
 * @method backgroundRequest
 * @param {String} method
 */
const backgroundRequest = (method, requestData) => {
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
			method, id, target: 'content', appId: APP_ID, data: requestData,
		}, '*');

	});

	return result;
};

/**
 * @method requestAccount
 */
const requestAccount = () => backgroundRequest(MESSAGE_METHODS.REQUEST_ACCOUNT);

/**
 * @method getAccounts
 */
const getAccounts = () => backgroundRequest(MESSAGE_METHODS.ACCOUNTS);

/**
 * @method getCurrentNetwork
 */
const getCurrentNetwork = () => backgroundRequest(MESSAGE_METHODS.GET_NETWORK);

/**
 * @method checkAccess
 */
const checkAccess = () => backgroundRequest(MESSAGE_METHODS.CHECK_ACCESS);

/**
 * @method getActiveAccount
 */
const getActiveAccount = () => backgroundRequest(MESSAGE_METHODS.GET_ACTIVE_ACCOUNT);

/**
 * @method getAccess
 */
const getAccess = () => backgroundRequest(MESSAGE_METHODS.GET_ACCESS);

/**
 * @method proofOfAuthority
 * @param {string} message
 * @param {string} accountId
 */
const proofOfAuthority = async (message, accountId) => {
	if (typeof message !== 'string') throw new Error('message is not a string');
	return backgroundRequest(MESSAGE_METHODS.PROOF_OF_AUTHORITY, { message, accountId });
};

/**
 * @method signData
 * @param {string} message
 * @param {string} accountId
 */
const signData = async (message, accountId) => {
	if (!Buffer.isBuffer(message)) throw new Error('Message isn\'t a Buffer');
	return backgroundRequest(MESSAGE_METHODS.SIGN_DATA, { message: message.toString('hex'), accountId });
};

/**
 * @method loadActiveAccount
 */
const loadActiveAccount = async () => {
	const isAccess = await checkAccess();
	if (isAccess) {
		const account = await getActiveAccount();
		activeAccount = account;
	}
};


/**
 * @method sendTransaction
 * @param {string} message
 * @param {string} accountId
 */
const sendTransaction = async (options) => {
	const result = await backgroundRequest(MESSAGE_METHODS.CONFIRM, JSON.stringify(options));
	return JSON.parse(result);
};

/**
 * @method subscribeSwitchAccount
 * @param {function} subscriberCb
 */
const subscribeSwitchAccount = async (subscriberCb) => {
	if (!lodash.isFunction(subscriberCb)) throw new Error('Is not a function');

	const result = await getAccounts();
	accountSubscribers.push(subscriberCb);
	subscriberCb(result);

	return result;
};

/**
 * @method subscribeSwitchNetwork
 * @param {function} subscriberCb
 */
const subscribeSwitchNetwork = async (subscriberCb) => {
	if (!lodash.isFunction(subscriberCb)) throw new Error('Is not a function');

	const result = await getCurrentNetwork();
	networkSubscribers.push(subscriberCb);
	subscriberCb(result);

	return result;
};

/**
 * @method subscribeAccountChanged
 * @param {function} subscriberCb
 */
const subscribeAccountChanged = async (subscriberCb) => {
	if (!lodash.isFunction(subscriberCb)) throw new Error('Is not a function');

	const access = await checkAccess();
	subscriberCb(activeAccount);

	if (access) {
		accountChangedSubscribers.push(subscriberCb);
		return activeAccount;
	}

	return null;
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

			const signResult = JSON.parse(data.res);

			if (this._operations[0][1].from) {
				this._operations[0][1].from = signResult.accountId;
			} else if (this._operations[0][1].registrar) {
				this._operations[0][1].registrar = signResult.accountId;
			}

			this._refBlockNum = signResult.ref_block_num;
			this._refBlockPrefix = signResult.ref_block_prefix;
			this._expiration = signResult.expiration;
			this._chainId = signResult.chainId;
			this._signatures = signResult.serializedSignatures.map((hexString) => new Signat(hexString));

			this._finalized = true;

			resolve(this);
		};

		requestQueue.push({ id, cb });

		const operations = JSON.stringify(this._operations);

		window.postMessage({
			method: MESSAGE_METHODS.CONFIRM,
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
