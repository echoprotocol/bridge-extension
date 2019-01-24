import BN from 'bignumber.js';

import echoService from '../src/services/echo';

import { CORE_ID, MEMO_FEE_KEYS, SET_TR_FEE_TIMEOUT } from '../src/constants/GlobalConstants';

import { formatToSend, getFetchMap } from '../src/services/operation';


export const getTrOperationFee = async (type, transaction, core) => {
	const { Transaction, aes, PrivateKey } = await echoService.getChainLib();

	const options = JSON.parse(JSON.stringify(transaction));

	if (options.memo) {
		const nonce = null;
		const pKey = PrivateKey.fromWif(MEMO_FEE_KEYS.WIF);

		const message = aes.encryptWithChecksum(
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

	const tr = new Transaction();
	tr.addOperation(type, options);

	const start = new Date().getTime();

	await Promise.race([
		tr.setRequiredFees(core.get('id')).then(() => (new Date().getTime() - start)),
		new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				clearTimeout(timeoutId);
				reject(new Error('Timeout set required fees'));
			}, SET_TR_FEE_TIMEOUT);
		}),
	]);

	return tr._operations[0][1].fee.amount; // eslint-disable-line no-underscore-dangle
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
	const core = await echoService.getChainLib().api.getObject(CORE_ID);

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
			const result = await echoService.getChainLib().api.getObject(value);
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
