import { Map, List } from 'immutable';

import history from '../history';
import store from '../store';

import { sendTransaction } from '../api/WalletApi';
import { fetchChain } from '../api/ChainApi';

import echoService from '../services/echo';
import { getFetchMap } from '../services/operation';

import FormatHelper from '../helpers/FormatHelper';
import {
	UNLOCK_PATH,
	SIGN_TRANSACTION_PATH,
	INDEX_PATH,
	NOT_RETURNED_PATHS,
} from '../constants/RouterConstants';
import {
	APPROVED_STATUS,
	CANCELED_STATUS,
	ERROR_STATUS,
} from '../constants/GlobalConstants';

import GlobalReducer from '../reducers/GlobalReducer';

const emitter = echoService.getEmitter();

// TODO REMOVE!!!!
window.emitter = emitter;

const setTransaction = ({ id, options }) => async (dispatch) => {
	const fetchList = Object.entries(getFetchMap(options.type, options));

	let fetched = await Promise.all(fetchList.map(async ([key, value]) => {
		const result = await fetchChain(value);
		return { [key]: result };
	}));

	fetched = fetched.reduce((obj, item) => ({ ...obj, ...item }), {});

	Object.keys(options).forEach((key) => {
		if (key === 'amount') {
			options.amount.asset = fetched.asset;
			delete options.amount.asset_id;
		}

		if (fetched[key]) {
			options[key] = fetched[key];
		}
	});

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

const redirectToSign = () => (dispatch, getState) => {
	const isLocked = getState().global.getIn(['crypto', 'isLocked']);

	if (isLocked) {
		dispatch(GlobalReducer.actions.setIn({
			field: 'crypto',
			params: { goTo: SIGN_TRANSACTION_PATH },
		}));
		history.push(UNLOCK_PATH);
	} else {
		history.push(SIGN_TRANSACTION_PATH);
	}
};

emitter.on('request', async (id, options) => {
	if (!options.type) {
		emitter.emit('response', 'Operation type is required', id, ERROR_STATUS);
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

	store.dispatch(redirectToSign());
});

export const loadRequests = () => async (dispatch) => {
	const transactions = echoService.getRequests().filter(({ id, options }) => {
		if (!options.type) {
			emitter.emit('response', 'Operation type is required', id, ERROR_STATUS);
		}

		return !!options.type;
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

	dispatch(redirectToSign());
};

export const approveTransaction = (transaction) => async (dispatch) => {
	try {
		// TODO check operationKeys account
		await sendTransaction(transaction.get('options'));
		emitter.emit('response', null, transaction.get('id'), APPROVED_STATUS);
	} catch (err) {
		// TODO check if locked - go to unlock
		const error = FormatHelper.formatError(err);
		emitter.emit('response', error, transaction.get('id'), ERROR_STATUS);
	} finally {
		dispatch(removeTransaction(transaction.get('id')));
	}
};

export const cancelTransaction = (id) => (dispatch) => {
	emitter.emit('response', null, id, CANCELED_STATUS);

	dispatch(removeTransaction(id));
};

export const errorTransaction = (error, id) => (dispatch) => {
	emitter.emit('response', error, id, ERROR_STATUS);

	dispatch(removeTransaction(id));
};
