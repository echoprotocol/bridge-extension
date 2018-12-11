import BN from 'bignumber.js';
import { Aes, PrivateKey, TransactionHelper } from 'echojs-lib';

import echoService from '../src/services/echo';

import { CORE_ID, MEMO_FEE_KEYS, SET_TR_FEE_TIMEOUT } from '../src/constants/GlobalConstants';

import { formatToSend, getFetchMap } from '../src/services/operation';


export const getTrOperationFee = async (type, transaction, core) => {
	const options = JSON.parse(JSON.stringify(transaction));

	if (options.memo) {
		const nonce = TransactionHelper.unique_nonce_uint64();
		const pKey = PrivateKey.fromWif(MEMO_FEE_KEYS.WIF);

		const message = Aes.encryptWithChecksum(
			pKey,
			MEMO_FEE_KEYS.PUBLIC_MEMO_TO,
			nonce,
			Buffer.from(options.memo, 'utf-8'),
		);

		options.memo = {
			from: MEMO_FEE_KEYS.PUBLIC_MEMO_FROM,
			to: MEMO_FEE_KEYS.PUBLIC_MEMO_TO,
			nonce,
			message,
		};
	}

	const { TransactionBuilder } = await echoService.getChainLib();
	const tr = new TransactionBuilder();
	tr.add_type_operation(type, options);

	const start = new Date().getTime();

	await Promise.race([
		tr.set_required_fees(core.get('id')).then(() => (new Date().getTime() - start)),
		new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				clearTimeout(timeoutId);
				reject(new Error('Timeout set required fees'));
			}, SET_TR_FEE_TIMEOUT);
		}),
	]);

	return tr.operations[0][1].fee.amount;
};

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
 * fetch object from chain
 * @param {String} key
 * @returns {Object}
 */
export const trFetchChain = async (key) => {
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
 *  @method getTransactionFee
 *
 * 	Get operation fee
 *
 * 	@param {Object} options
 */
const getTransactionFee = async (options) => {
	const { fee } = options;
	const core = await trFetchChain(CORE_ID);

	let amount = await getTrOperationFee(options.type, formatToSend(options.type, options), core);

	if (fee.asset.get('id') !== CORE_ID) {
		const price = new BN(fee.asset.getIn(['options', 'core_exchange_rate', 'quote', 'amount']))
			.div(fee.asset.getIn(['options', 'core_exchange_rate', 'base', 'amount']))
			.times(10 ** (core.get('precision') - fee.asset.get('precision')));

		amount = new BN(amount).div(10 ** core.get('precision'));
		amount = price.times(amount).times(10 ** fee.asset.get('precision'));
	}

	return {
		amount: new BN(amount).integerValue(BN.ROUND_UP).toString(),
		asset: fee.asset,
	};
};

const getFetchedObjects = async (fetchList) => {
	try {
		return Promise.all(fetchList.map(async ([key, value]) => {
			const result = await trFetchChain(value);
			return { [key]: result };
		}));
	} catch (err) {
		return null;
	}
};

const getTransaction = async ({ id, options }) => {
	const transaction = JSON.parse(JSON.stringify(options));
	transaction.fee = transaction.fee || { amount: 0, asset_id: CORE_ID };

	const fetchList = Object.entries(getFetchMap(options.type, transaction));

	let fetched = await getFetchedObjects(fetchList, id);

	if (!fetched) {
		return null;
	}

	fetched = fetched.reduce((obj, item) => ({ ...obj, ...item }), {});

	const arrTemp = [];
	Object.entries(fetched).forEach(([key, value]) => { if (!value) { arrTemp.push(key); } });

	if (arrTemp.length) {

		return null;
	}

	Object.keys(transaction).forEach((key) => {
		if (['amount', 'fee'].includes(key)) {
			transaction[key].asset = fetched[key];
			delete transaction[key].asset_id;
			return null;
		}

		if (fetched[key]) {
			transaction[key] = fetched[key];
		}

		return null;
	});

	if (transaction.amount) {
		transaction.amount.amount = parseInt(transaction.amount.amount, 10);
	} else if (transaction.value) {
		transaction.value = parseInt(transaction.value, 10);
	}

	try {
		transaction.fee = await getTransactionFee(transaction);
	} catch (err) {
		return err;
	}

	return transaction;
};

export default getTransaction;
