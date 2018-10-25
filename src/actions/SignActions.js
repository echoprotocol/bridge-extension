import { Map, List } from 'immutable';

import history from '../history';
import store from '../store';

import { sendTransaction } from '../api/WalletApi';
import echoService from '../services/echo';
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

const removeTransaction = (id) => (dispatch, getState) => {
	const sign = getState().global.get('sign');
	const transactions = sign.get('transactions').filter((tr) => tr.id !== id);

	dispatch(GlobalReducer.actions.setIn({ field: 'sign', params: { transactions } }));

	if (!transactions.size) {
		history.push(sign.get('goTo') || INDEX_PATH);
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

emitter.on('request', (id, options) => {
	const transactions = store.getState().global.getIn(['sign', 'transactions']);

	store.dispatch(GlobalReducer.actions.setIn({
		field: 'sign',
		params: { transactions: transactions.push({ id, options }) },
	}));

	store.dispatch(redirectToSign());
});

export const loadRequests = () => (dispatch) => {
	const transactions = echoService.getRequests();

	if (!transactions.length) { return; }

	const { pathname } = history.location;

	dispatch(GlobalReducer.actions.set({
		field: 'sign',
		value: new Map({
			goTo: !NOT_RETURNED_PATHS.includes(pathname) ? pathname : null,
			transactions: new List(transactions),
		}),
	}));

	dispatch(redirectToSign());
};

export const approveTransaction = (transaction) => async (dispatch) => {
	try {
		await sendTransaction(transaction.options);
		emitter.emit('response', null, transaction.id, APPROVED_STATUS);
	} catch (err) {
		// TODO check if locked - go to unlock
		const error = FormatHelper.formatError(err);
		emitter.emit('response', error, transaction.id, ERROR_STATUS);
	} finally {
		dispatch(removeTransaction(transaction.id));
	}
};

export const cancelTransaction = (transaction) => (dispatch) => {
	emitter.emit('response', null, transaction.id, CANCELED_STATUS);

	dispatch(removeTransaction(transaction.id));
};
