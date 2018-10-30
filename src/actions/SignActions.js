import { Map, List } from 'immutable';
import { TransactionBuilder } from 'echojs-lib';
import BN from 'bignumber.js';

import history from '../history';
import store from '../store';

import { getMemoFee } from '../api/WalletApi';
import { fetchChain, getChainSubcribe } from '../api/ChainApi';

import echoService from '../services/echo';
import { validateOperation, getFetchMap, formatToSend } from '../services/operation';

import FormatHelper from '../helpers/FormatHelper';
import { INDEX_PATH, NOT_RETURNED_PATHS } from '../constants/RouterConstants';
import {
	APPROVED_STATUS,
	CANCELED_STATUS,
	ERROR_STATUS,
	GLOBAL_ID_0,
	CORE_ID,
} from '../constants/GlobalConstants';
import { operationKeys, operationTypes } from '../constants/OperationConstants';

import GlobalReducer from '../reducers/GlobalReducer';

const emitter = echoService.getEmitter();

// TODO REMOVE!!!!
// window.emitter = emitter;

const validateTransaction = (options) => (dispatch, getState) => {
	const error = validateOperation(options);

	if (error) {
		return error;
	}

	const networkName = getState().global.getIn(['network', 'name']);
	const accounts = getState().global.getIn(['accounts', networkName]);
	const account = options[operationKeys[options.type]];

	if (!accounts.find((a) => [a.id, a.name].includes(account))) {
		return 'Account not found';
	}

	return null;
};

const getTransactionFee = async ({ fee, type, memo }) => {
	const global = await fetchChain(GLOBAL_ID_0);

	const { code } = operationTypes[type];
	let amount = global.getIn(['parameters', 'current_fees', 'parameters', code, 1, 'fee']);

	if (memo) {
		amount = new BN(amount).plus(getMemoFee(global, memo));
	}

	if (fee.asset.get('id') !== CORE_ID) {
		const core = await fetchChain(CORE_ID);

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

const setTransaction = ({ id, options }) => async (dispatch) => {
	options.fee = options.fee || { amount: 0, asset_id: CORE_ID };

	const fetchList = Object.entries(getFetchMap(options.type, options));

	let fetched = await Promise.all(fetchList.map(async ([key, value]) => {
		const result = await fetchChain(value);
		return { [key]: result };
	}));

	fetched = fetched.reduce((obj, item) => ({ ...obj, ...item }), {});

	Object.keys(options).forEach((key) => {
		if (['amount', 'fee'].includes(key)) {
			options[key].asset = fetched.asset;
			delete options[key].asset_id;
		}

		if (fetched[key]) {
			options[key] = fetched[key];
		}
	});

	options.fee = await getTransactionFee(options);

	dispatch(GlobalReducer.actions.setIn({
		field: 'sign',
		params: { current: new Map({ id, options }) },
	}));

};

const removeTransaction = (id) => (dispatch, getState) => {
	const sign = getState().global.get('sign');
	const transactions = sign.get('transactions').filter((tr) => tr.id !== id);

	dispatch(GlobalReducer.actions.setIn({
		field: 'sign',
		params: { transactions, current: null },
	}));

	if (!transactions.size) {
		history.push(sign.get('goTo') || INDEX_PATH);
	} else {
		dispatch(setTransaction(transactions.get(0)));
	}
};

const requestHandler = async (id, options) => {
	const isLocked = store.getState().global.getIn(['crypto', 'isLocked']);

	if (isLocked) {
		emitter.emit('response', 'Unlock required', id, ERROR_STATUS);
		return;
	}

	const error = store.dispatch(validateTransaction(options));
	if (error) {
		emitter.emit('response', error, id, ERROR_STATUS);
		return;
	}

	const transactions = store.getState().global.getIn(['sign', 'transactions']);

	if (!transactions.size) {
		await store.dispatch(setTransaction({ id, options }));
	}

	store.dispatch(GlobalReducer.actions.setIn({
		field: 'sign',
		params: { transactions: transactions.push({ id, options }) },
	}));
};

emitter.on('request', requestHandler);

window.onunload = () => {
	if (getChainSubcribe()) {
		const { ChainStore } = echoService.getChainLib();
		ChainStore.unsubscribe(getChainSubcribe());
	}

	emitter.removeListener('request', requestHandler);
};

export const loadRequests = () => async (dispatch) => {
	const transactions = echoService.getRequests().filter(({ id, options }) => {
		const error = dispatch(validateTransaction(options));

		if (error) {
			emitter.emit('response', error, id, ERROR_STATUS);
		}

		return !error;
	});

	if (!transactions.length) { return; }

	const { pathname } = history.location;

	dispatch(GlobalReducer.actions.set({
		field: 'sign',
		value: new Map({
			goTo: !NOT_RETURNED_PATHS.includes(pathname) ? pathname : null,
			transactions: new List(transactions),
		}),
	}));

	await dispatch(setTransaction(transactions[0]));
};


export const approveTransaction = (transaction) => async (dispatch, getState) => {
	dispatch(GlobalReducer.actions.set({ field: 'loading', value: true }));

	const networkName = getState().global.getIn(['network', 'name']);

	try {
		const { type, memo } = transaction.get('options');
		const account = transaction.get('options')[operationKeys[type]];
		const options = formatToSend(type, transaction.get('options'));

		const publicKey = account.getIn(['active', 'key_auths', '0', '0']);

		let tr = new TransactionBuilder();
		tr = await echoService.getCrypto().sign(networkName, tr, publicKey);

		if (memo) {
			const { to } = transaction.get('options');

			options.memo = await echoService.getCrypto().encryptMemo(
				networkName,
				account.getIn(['options', 'memo_key']),
				to.getIn(['options', 'memo_key']),
				memo,
			);
		}

		tr.add_type_operation(type, options);
		await tr.set_required_fees(options.fee.asset_id);
		await tr.broadcast();

		emitter.emit('response', null, transaction.get('id'), APPROVED_STATUS);
	} catch (err) {
		const error = FormatHelper.formatError(err);
		emitter.emit('response', error, transaction.get('id'), ERROR_STATUS);
	} finally {
		dispatch(removeTransaction(transaction.get('id')));
		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
	}
};

export const cancelTransaction = (id) => (dispatch) => {
	emitter.emit('response', null, id, CANCELED_STATUS);

	dispatch(removeTransaction(id));
};

export const switchTransactionAccount = (name) => async (dispatch, getState) => {
	const account = await fetchChain(name);
	const transaction = getState().global.getIn(['sign', 'current']);
	const key = operationKeys[transaction.get('options').type];

	dispatch(GlobalReducer.actions.setIn({
		field: 'sign',
		params: {
			current: new Map({
				id: transaction.get('id'),
				options: {
					...transaction.get('options'),
					[key]: account,
				},
			}),
		},
	}));
};
