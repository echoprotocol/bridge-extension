import { Map, List } from 'immutable';
import BN from 'bignumber.js';

import history from '../history';
import store from '../store';

import { getOperationFee } from '../api/WalletApi';
import { fetchChain, getChainSubcribe } from '../api/ChainApi';

import echoService from '../services/echo';
import { validateOperation, getFetchMap, formatToSend } from '../services/operation';

import FormatHelper from '../helpers/FormatHelper';
import { INDEX_PATH, NOT_RETURNED_PATHS } from '../constants/RouterConstants';
import {
	APPROVED_STATUS,
	CANCELED_STATUS,
	ERROR_STATUS,
	CORE_ID,
	CLOSE_STATUS,
	OPEN_STATUS,
	POPUP_WINDOW_TYPE,
	BROADCAST_LIMIT,
} from '../constants/GlobalConstants';
import { operationKeys } from '../constants/OperationConstants';

import GlobalReducer from '../reducers/GlobalReducer';

const emitter = echoService.getEmitter();
let WINDOW_TYPE = null;

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

const getTransactionFee = async (options) => {
	const { fee } = options;
	let amount = await getOperationFee(options.type, formatToSend(options.type, options));

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
	const transaction = JSON.parse(JSON.stringify(options));
	transaction.fee = transaction.fee || { amount: 0, asset_id: CORE_ID };

	const fetchList = Object.entries(getFetchMap(options.type, transaction));

	let fetched = await Promise.all(fetchList.map(async ([key, value]) => {
		const result = await fetchChain(value);
		return { [key]: result };
	}));

	fetched = fetched.reduce((obj, item) => ({ ...obj, ...item }), {});

	Object.keys(transaction).forEach((key) => {
		if (['amount', 'fee'].includes(key)) {
			transaction[key].asset = fetched[key];
			delete transaction[key].asset_id;
			return;
		}

		if (fetched[key]) {
			transaction[key] = fetched[key];
		}
	});

	transaction.fee = await getTransactionFee(transaction);

	dispatch(GlobalReducer.actions.setIn({
		field: 'sign',
		params: { current: new Map({ id, options: transaction }) },
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

	const connected = store.getState().global.get('connected');

	if (!connected) {
		emitter.emit('response', 'Network error', id, ERROR_STATUS);
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

export const loadRequests = () => async (dispatch, getState) => {
	const connected = getState().global.get('connected');

	const transactions = echoService.getRequests().filter(({ id, options }) => {
		const error = connected ? dispatch(validateTransaction(options)) : 'Network error';

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

const sendTransaction = (transaction) => async (dispatch, getState) => {
	const networkName = getState().global.getIn(['network', 'name']);

	const { type, memo } = transaction.get('options');
	const account = transaction.get('options')[operationKeys[type]];
	const options = formatToSend(type, transaction.get('options'));

	const publicKey = account.getIn(['active', 'key_auths', '0', '0']);

	const { TransactionBuilder } = await echoService.getChainLib();
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

	return tr.broadcast().then(() => {
		emitter.emit('response', null, transaction.get('id'), APPROVED_STATUS);
	}).catch((err) => {
		emitter.emit('response', FormatHelper.formatError(err), transaction.get('id'), ERROR_STATUS);
	});
};

export const approveTransaction = (transaction) => async (dispatch) => {
	emitter.emit('response', null, transaction.get('id'), WINDOW_TYPE !== POPUP_WINDOW_TYPE ? CLOSE_STATUS : OPEN_STATUS);

	dispatch(GlobalReducer.actions.set({ field: 'loading', value: true }));

	try {
		const start = new Date().getTime();

		await Promise.race([
			dispatch(sendTransaction(transaction)).then(() => (new Date().getTime() - start)),
			new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					clearTimeout(timeoutId);
					reject(new Error('Send transaction timeout'));
				}, BROADCAST_LIMIT);
			}),
		]);
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

export const setWindowType = (type) => {
	WINDOW_TYPE = type;
};
