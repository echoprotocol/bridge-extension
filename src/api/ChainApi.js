import echoService from '../services/echo';

import { connect } from '../actions/ChainStoreAction';
import { loadInfo } from '../actions/GlobalActions';
import GlobalReducer from '../reducers/GlobalReducer';

let CHAIN_SUBSCRIBE = null;

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
	const instance = Apis.instance();

	try {
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
 */
export const connectToAddress = async (address, subscribeCb) => {
	const { Apis } = echoService.getWsLib();
	const { ChainStore } = echoService.getChainLib();
	CHAIN_SUBSCRIBE = subscribeCb;

	try {
		let instance = Apis.instance();

		if (instance.url !== address) {
			await Apis.close();

			Apis.setAutoReconnect(false);

			instance = Apis.instance(
				address,
				true,
				4000,
				{ enableCrypto: false },
			);

			await instance.init_promise;
		}

		const start = new Date().getTime();

		await Promise.race([
			ChainStore.init().then(() => (new Date().getTime() - start)),
			new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					clearTimeout(timeoutId);
					reject(new Error('timeout'));
				}, 10 * 1000);
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
