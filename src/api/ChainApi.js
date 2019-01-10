import { keccak256 } from 'js-sha3';
import utf8 from 'utf8';

import echoService from '../services/echo';

import { connect } from '../actions/ChainStoreAction';
import { loadInfo } from '../actions/GlobalActions';
import GlobalReducer from '../reducers/GlobalReducer';
import { CHAINSTORE_INIT_TIMEOUT, CORE_ID, WS_CLOSE_TIMEOUT } from '../constants/GlobalConstants';

let CHAIN_SUBSCRIBE = null;

export const getChainSubscribe = () => CHAIN_SUBSCRIBE;

/**
 * return method name by key type
 * @param {String} key
 * @returns {String}
 */
const getTypeByKey = (key) => {
	const { ChainValidation } = echoService.getChainLib();
	if (ChainValidation.is_object_id(key)) {
		if (key.search('1.2') === 0) {
			return 'getAccount';
		} else if (key.search('1.3') === 0) {
			return 'getAsset';
		}
		return 'getObject';
	} else if (ChainValidation.is_account_name(key)) {
		return 'getAccount';
	}
	const keyNumber = Number(key);
	if (!Number.isSafeInteger(keyNumber) || keyNumber < 1) throw new Error('Key should be id or account name or block number.');
	return 'getBlock';
};

const createInstance = (url) => {
	const { Apis } = echoService.getWsLib();
	return Apis.instance(
		url,
		true,
		4000,
		{ enableCrypto: false },
	);
};

/**
 *  @method checkConnection
 *
 * 	Call login for check connection
 *
 * 	@param {String} url
 */
export const checkConnection = (url) => async (dispatch, getState) => {
	const { Apis, Manager } = echoService.getWsLib();
	const manager = new Manager({ url, urls: [] });
	let instance = Apis.instance();

	try {
		if (instance.ws_rpc === null) {
			instance = createInstance(url);
		}
		await manager.checkSingleUrlConnection(instance.ws_rpc);
	} catch (err) {
		dispatch(GlobalReducer.actions.set({ field: 'connected', value: false }));
		return false;
	}

	const connected = getState().global.get('connected');

	if (!connected) {
		await dispatch(connect());
		await dispatch(loadInfo());
	}

	return true;
};

/**
 * connect socket to address
 * @param {String} address
 * @param {Function} subscribeCb
 * @param {Boolean} isRecreate
 */
export const connectToAddress = async (address, subscribeCb, isRecreate) => {
	const { Apis } = echoService.getWsLib();
	const { ChainStore } = echoService.getChainLib();
	CHAIN_SUBSCRIBE = subscribeCb;

	try {
		let instance = Apis.instance();

		if (instance.url !== address || (isRecreate && !instance.ws_rpc)) {
			const start = new Date().getTime();

			await Promise.race([
				Apis.close().then(() => (new Date().getTime() - start)),
				new Promise((resolve, reject) => {
					const timeoutId = setTimeout(() => {
						clearTimeout(timeoutId);
						reject(new Error('timeout close'));
					}, WS_CLOSE_TIMEOUT);
				}),
			]);

			Apis.setAutoReconnect(false);

			instance = createInstance(address);

			await instance.init_promise;
		}

		const start = new Date().getTime();

		await Promise.race([
			ChainStore.init().then(() => (new Date().getTime() - start)),
			new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					clearTimeout(timeoutId);
					reject(new Error('timeout chainstore'));
				}, CHAINSTORE_INIT_TIMEOUT);
			}),
		]);

		ChainStore.subscribe(CHAIN_SUBSCRIBE);
	} catch (e) {
		CHAIN_SUBSCRIBE = null;
		throw e;
	}
};

/**
 * disconnect socket from address and clear lib cache
 * @param {String} address
 */
export const disconnectFromAddress = async (address) => {
	const { Apis } = echoService.getWsLib();
	const { ChainStore } = echoService.getChainLib();
	const instance = Apis.instance();
	if (instance.url !== address) {
		throw new Error('invalid address');
	}

	if (CHAIN_SUBSCRIBE) ChainStore.unsubscribe(CHAIN_SUBSCRIBE);
	ChainStore.resetCache();

	CHAIN_SUBSCRIBE = null;
};

/**
 * fetch object from chain
 * @param {String} key
 * @returns {Object}
 */
export const fetchChain = async (key) => {
	const { ChainStore } = echoService.getChainLib();
	const method = getTypeByKey(key);

	try {
		const value = await ChainStore.FetchChain(method, key);

		return value;
	} catch (e) {
		throw e;
	}
};

/**
 * lookup account
 * @param {String} accountName
 * @param {Number} limit
 * @returns {Object}
 */
export const lookupAccounts = async (accountName, limit) => {
	const { Apis } = echoService.getWsLib();
	const instance = Apis.instance();

	const result = await instance.dbApi().exec('lookup_accounts', [accountName, limit]);

	return result;
};

/**
 * lookup account
 * @param {String} accountName
 * @param {Number} limit
 * @returns {Object}
 */
export const getAccountRefsOfKey = async (key) => {
	const { ChainStore } = echoService.getChainLib();

	const result = await ChainStore.FetchChain('getAccountRefsOfKey', key);

	return result;
};

const toUtf8 = (hex) => {
	let str = '';

	for (let i = 0; i < hex.length; i += 2) {
		const code = parseInt(hex.substr(i, 2), 16);
		if (code !== 0) {
			str += String.fromCharCode(code);
		}
	}
	let result = str;
	try {
		result = utf8.decode(str);
	} catch (error) {
		result = str;
	}
	return result;
};

export const getContract = (contractId) => {
	const { Apis } = echoService.getWsLib();
	const instance = Apis.instance();

	return instance.dbApi().exec('get_contract', [contractId]);
};

export const getTokenDetails = async (contractId = '1.16.7807', accountId = '1.2.22') => {
	const { Apis } = echoService.getWsLib();
	const instance = Apis.instance();

	const methods = [
		{
			name: 'balanceOf',
			inputs: [{ type: 'address' }],
		},
		{
			name: 'symbol',
			inputs: [],
		},
		{
			name: 'decimals',
			inputs: [],
		},
	];

	const tokenDetails = [];

	try {
		const resultEncode = Number(accountId.substr(accountId.lastIndexOf('.') + 1)).toString(16).padStart(64, '0');

		methods.forEach((method) => {

			const inputs = method.inputs.map((input) => input.type).join(',');

			let methodId = keccak256(`${method.name}(${inputs})`).substr(0, 8);

			if (method.inputs.length) {
				methodId = methodId.concat(resultEncode);
			}

			tokenDetails.push(instance.dbApi().exec(
				'call_contract_no_changing_state',
				[contractId, accountId, CORE_ID, methodId],
			));
		});

		const result = await Promise.all(tokenDetails);

		return {
			balance: parseInt(result[0], 16),
			symbol: toUtf8(result[1].substr(-64)),
			precision: parseInt(result[2], 16),
		};
	} catch (e) {
		return e;
	}
};
