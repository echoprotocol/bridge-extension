import echoService from '../services/echo';

// const { Apis } = echoService.getWsLib();
// const { ChainStore } = echoService.getChainLib();

import { Apis } from 'echojs-ws';
import { ChainStore } from 'echojs-lib';


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
 * connect socket to address
 * @param {String} address
 * @param {Function} subscribeCb
 */
export const connectToAddress = async (address, subscribeCb) => {

	CHAIN_SUBSCRIBE = subscribeCb;

	try {
		const instance = Apis.instance(
			address,
			true,
			4000,
			{ enableCrypto: false },
		);

		Apis.setAutoReconnect(false);

		await instance.init_promise;

		await ChainStore.init();
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
	const instance = Apis.instance();
	if (instance.url !== address) {
		throw new Error('invalid address');
	}

	if (CHAIN_SUBSCRIBE) ChainStore.unsubscribe(CHAIN_SUBSCRIBE);
	ChainStore.resetCache();

	CHAIN_SUBSCRIBE = null;

	await Apis.close();
};

/**
 * fetch object from chain
 * @param {String} key
 * @returns {Object}
 */
export const fetchChain = async (key) => {
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
	const instance = Apis.instance();

	const result = await instance.dbApi().exec('lookup_accounts', [accountName, limit]);

	return result;
};
