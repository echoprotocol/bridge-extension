import { Apis } from 'echojs-ws';
import { ChainStore, ChainValidation } from 'echojs-lib';

let CHAIN_SUBSCRIBE = null;

const getTypeByKey = (key) => {
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

export const connectToAddress = async (address, subscribeCb) => {

	CHAIN_SUBSCRIBE = subscribeCb;

	try {
		const instance = Apis.instance(
			address,
			true,
			4000,
			{ enableCrypto: false },
		);

		await instance.init_promise;

		await ChainStore.init();
		ChainStore.subscribe(CHAIN_SUBSCRIBE);
	} catch (e) {
		throw e;
	}
};

export const disconnectFromAddress = async (address) => {
	const instance = Apis.instance();
	if (instance.url !== address) {
		throw new Error('invalid address');
	}

	ChainStore.unsubscribe(CHAIN_SUBSCRIBE);
	ChainStore.resetCache();

	CHAIN_SUBSCRIBE = null;

	await Apis.close();

	return instance;
};

export const fetchChain = async (key) => {
	const method = getTypeByKey(key);

	try {
		const value = await ChainStore.FetchChain(method, key);

		return value;
	} catch (e) {
		throw e;
	}
};

export const lookupAccounts = async (accountName, limit) => {
	const instance = Apis.instance();

	const result = await instance.dbApi().exec('lookup_accounts', [accountName, limit]);

	return result;
};
