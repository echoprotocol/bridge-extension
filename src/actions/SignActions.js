/* eslint-disable no-empty */
import { Map, List } from 'immutable';
import BN from 'bignumber.js';
import { batchActions } from 'redux-batched-actions';

import history from '../history';

import getOperationFee from '../api/WalletApi';

import echoService from '../services/echo';
import { formatToSend } from '../services/operation';

import {
	ERROR_SEND_PATH,
	INDEX_PATH,
	NETWORK_ERROR_SEND_PATH,
	NOT_RETURNED_PATHS,
	SUCCESS_SEND_PATH,
} from '../constants/RouterConstants';
import {
	CANCELED_STATUS,
	ERROR_STATUS,
	CORE_ID,
	CLOSE_STATUS,
	OPEN_STATUS,
	POPUP_WINDOW_TYPE,
	COMPLETE_STATUS, SIGN_STATUS,
} from '../constants/GlobalConstants';

import GlobalReducer from '../reducers/GlobalReducer';

import SignTransaction from '../../extension/SignTransaction';
import { operationFields, operationTypes } from '../constants/OperationConstants';

export const globals = {
	WINDOW_TYPE: null,
	IS_LOADING: false,
};

/**
 *  @method getTransactionFee
 *
 * 	Get operation fee
 *
 * 	@param {Object} options
 */
export const getTransactionFee = async (options) => {
	const { fee } = options;
	const core = await echoService.getChainLib().api.getObject(CORE_ID);

	let amount = await getOperationFee(options.type, formatToSend(options.type, options), core);

	if (fee.asset.get('id') !== CORE_ID) {
		const price = new BN(fee.asset.getIn(['options', 'core_exchange_rate', 'quote', 'amount']))
			.div(fee.asset.getIn(['options', 'core_exchange_rate', 'base', 'amount']))
			.times(10 ** (core.precision - fee.asset.get('precision')));

		amount = new BN(amount).div(10 ** core.precision);
		amount = price.times(amount).times(10 ** fee.asset.get('precision'));
	}

	return {
		amount: new BN(amount).integerValue(BN.ROUND_UP).toString(),
		asset: fee.asset,
	};
};

/**
 *  @method closePopup
 *
 * 	Close popup incoming transaction
 *
 * 	@param {String} status
 */
export const closePopup = (status) => {
	const emitter = echoService.getEmitter();

	try {
		emitter.emit('response', null, null, status || COMPLETE_STATUS);
	} catch (e) {}

};

const getFetchedData = async (options) => {
	const type = Object.entries(operationTypes).find(([, v]) => v.code === options[0][0]);
	let opts = JSON.parse(JSON.stringify(options));

	if (!type) {
		return null;
	}

	const typeParams = operationFields[type[0]];

	const { api } = echoService.getChainLib();
	let requests = [];
	[[, opts]] = opts;

	Object.entries(typeParams).forEach(([key, value]) => {
		if (!opts[key]) {
			return null;
		}

		if (value.hasProperties) {
			requests.push(api.getObject(opts[key][value.hasProperties]));

			return null;
		} else if (value.field) {
			if (key === 'memo') {
				requests.push(Buffer.from(opts[key][value.field], 'hex').toString());
			} else {
				requests.push(opts[key][value.field]);
			}

			return null;
		}

		requests.push(api.getObject(opts[key]));

		return null;
	});

	requests = await Promise.all(requests);

	Object.entries(typeParams).forEach(([key, value], index) => {
		if (!opts[key]) {
			return null;
		}

		if (value.hasProperties) {
			opts[key][value.hasProperties] = requests[index];

			return null;
		}

		opts[key] = requests[index];

		return null;
	});

	[opts.type] = type;

	return opts;
};

/**
 *  @method removeTransaction
 *
 * 	Remove transaction data from redux store
 *
 * 	@param {String} id
 * 	@param {Boolean} isClose
 */
export const removeTransaction = (id, isClose) => async (dispatch, getState) => {
	const sign = getState().global.get('sign');
	const transactions = sign.get('transactions').filter((tr) => tr.id !== id);

	if (transactions.size) {
		dispatch(GlobalReducer.actions.setIn({
			field: 'sign',
			params: {
				current: new Map({
					id: transactions.get(0).id,
					options: transactions.get(0).options,
				}),
			},
		}));
	} else {
		if (globals.WINDOW_TYPE !== POPUP_WINDOW_TYPE) {
			closePopup();
		}

		if (isClose) {
			closePopup();
			history.push(INDEX_PATH);
		}

		dispatch(GlobalReducer.actions.setIn({
			field: 'sign',
			params: {
				current: null,
			},
		}));
	}

	const dataToShow = await getFetchedData(transactions.get(0).options);

	dispatch(batchActions([
		GlobalReducer.actions.setIn({
			field: 'sign',
			params: { transactions },
		}),
		GlobalReducer.actions.setIn({
			field: 'sign',
			params: {
				dataToShow: new Map(dataToShow),
			},
		}),
	]));

	// if (!transactions.size && isClose) {
	// 	closePopup();
	// 	history.push(INDEX_PATH);
	// } else if (transactions.size) {
	// 	dispatch(setTransaction(transactions.get(0)));
	// }
};

/**
 *  @method removeTransaction
 *
 * 	Remove transaction data from redux store
 *
 * 	@param {String} id
 */
export const removeTransactionWindow = (id, status) => async (dispatch, getState) => {
	const sign = getState().global.get('sign');
	const transactions = sign.get('transactions').filter((tr) => tr.id !== id);

	if (!transactions.size) {
		closePopup(status);
		history.push(INDEX_PATH);
	} else if (transactions.size) {
		const dataToShow = await getFetchedData(transactions.get(0).options);

		dispatch(batchActions([
			GlobalReducer.actions.setIn({
				field: 'sign',
				params: {
					current: new Map({
						id: transactions.get(0).id,
						options: transactions.get(0).options,
					}),
				},
			}),
			GlobalReducer.actions.setIn({
				field: 'sign',
				params: {
					dataToShow: new Map(dataToShow),
				},
			}),
		]));
	}

	dispatch(GlobalReducer.actions.setIn({
		field: 'sign',
		params: { transactions },
	}));
};

/**
 *  @method requestHandler
 *
 * 	Incoming transaction requests handling
 *
 * 	@param {String} id
 * 	@param {Object} options
 */
export const requestHandler = (id, options) => async (dispatch, getState) => {
	const emitter = echoService.getEmitter();

	const isLocked = getState().global.getIn(['crypto', 'isLocked']);

	if (isLocked) {
		emitter.emit('response', 'Unlock required', id, ERROR_STATUS);
		return null;
	}

	const connected = getState().global.get('connected');

	if (!connected) {
		emitter.emit('response', 'Network error', id, ERROR_STATUS);
		return null;
	}

	// const error = await dispatch(validateTransaction(options));
	// if (error) {
	// 	emitter.emit('response', `${error}`, id, ERROR_STATUS);
	// 	return null;
	// }

	const transactions = getState().global.getIn(['sign', 'transactions']);

	if (!transactions.size) {
		dispatch(GlobalReducer.actions.setIn({
			field: 'sign',
			params: {
				current: new Map({
					id,
					options,
				}),
			},
		}));
		// await dispatch(setTransaction({ id, options }));
	}

	dispatch(GlobalReducer.actions.setIn({
		field: 'sign',
		params: { transactions: transactions.push({ id, options }) },
	}));

	return null;
};

/**
 *  @method windowRequestHandler
 *
 * 	Transaction operations handler (between windows)
 *
 * 	@param {Number} id
 * 	@param {String} windowType
 */
export const windowRequestHandler = (id, windowType, status) => async (dispatch) => {
	if (globals.WINDOW_TYPE !== windowType) {
		await dispatch(removeTransactionWindow(id, status));
	}
};

/**
 *  @method requestHandler
 *
 * 	On transaction broadcast result emitter response
 *
 * 	@param {String} status
 * 	@param {Object} id
 * 	@param {Object} path
 * 	@param {String} windowType
 */
export const trResponseHandler = (status, id, path, windowType) => async (dispatch) => {
	if (path === NETWORK_ERROR_SEND_PATH) {
		dispatch(GlobalReducer.actions.set({ field: 'connected', value: false }));
	}

	if (windowType === globals.WINDOW_TYPE) {
		await dispatch(removeTransaction(id));

		if (path) {
			history.push(path);
		}

		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
	}
};

/**
 *  @method loadRequests
 *
 * 	Load transactions data from query to redux store
 */
export const loadRequests = () => async (dispatch) => {
	try {
		const { pathname } = history.location;
		const requests = JSON.parse(JSON.stringify(echoService.getRequests()));

		if (!requests.length) {
			return null;
		}

		const dataToShow = await getFetchedData(requests[0].options);

		dispatch(batchActions([
			GlobalReducer.actions.set({
				field: 'sign',
				value: new Map({
					goTo: !NOT_RETURNED_PATHS.includes(pathname) ? pathname : null,
					transactions: new List(requests),
				}),
			}),
			GlobalReducer.actions.setIn({
				field: 'sign',
				params: {
					current: new Map({
						id: requests[0].id,
						options: requests[0].options,
					}),
				},
			}),
			GlobalReducer.actions.setIn({
				field: 'sign',
				params: {
					dataToShow: new Map(dataToShow),
				},
			}),
		]));
	} catch (err) {
		console.log('loadRequests Error', err);
	}

	return null;
};

/**
 *  @method approveTransaction
 *
 * 	Approve transaction
 *
 * 	@param {Object} transaction
 */
export const approveTransaction = (transaction) => async (dispatch, getState) => {
	const emitter = echoService.getEmitter();

	try {
		emitter.emit('response', null, transaction.get('id'), globals.WINDOW_TYPE !== POPUP_WINDOW_TYPE ? CLOSE_STATUS : OPEN_STATUS);

		emitter.emit('windowRequest', transaction.get('id'), globals.WINDOW_TYPE);
	} catch (e) {
		return null;
	}

	const networkName = getState().global.getIn(['network', 'name']);

	globals.IS_LOADING = true;
	dispatch(GlobalReducer.actions.set({ field: 'loading', value: true }));

	const balances = getState().balance.get('balances');
	const accountId = getState().global.getIn(['account', 'id']);

	if (!accountId) {
		return 'Account not available';
	}

	const balance = balances
		.find((val) => val.get('owner') === accountId && val.get('asset_type') === transaction.get('options').fee.asset.get('id'))
		.get('balance');

	emitter.emit('trRequest', transaction.get('id'), networkName, balance, globals.WINDOW_TYPE);

	return null;
};

/**
 *  @method cancelTransaction
 *
 * 	Cancel transaction
 *
 * 	@param {String} id
 */
export const cancelTransaction = (id) => async (dispatch) => {
	const emitter = echoService.getEmitter();

	try {
		emitter.emit('response', null, id, CANCELED_STATUS);

		emitter.emit('windowRequest', id, globals.WINDOW_TYPE);

		await dispatch(removeTransaction(id, true));
	} catch (e) {
		return null;
	}

	return null;

};

/**
 * @method signTr
 *
 * Save current transaction data to redux
 *
 * @param {Object} operations
 * @param {String} id
 */
export const signTr = (id, operations) => (dispatch) => {

	dispatch(GlobalReducer.actions.setIn({
		field: 'sign',
		params: {
			current: new Map({
				id: operations[0][0],
				options: operations,
			}),
		},
	}));
};

/**
 * @method approve
 *
 * Approve sign transaction
 *
 * @param {Object} operations
 * @param {String} id
 *
 * @returns {Object}
 */
export const approve = (operations, id) => async (dispatch, getState) => {
	const emitter = echoService.getEmitter();

	try {
		if (
			!operations
			|| !operations[0]
			|| [undefined, null].includes(operations[0][0])
			|| !operations[0][1]
		) {
			throw new Error('Invalid operations data');
		}

		if (!echoService.getChainLib()._ws._connected) { // eslint-disable-line no-underscore-dangle
			throw new Error('Network error');
		}

		const tr = echoService.getChainLib().createTransaction();

		const signTransaction = new SignTransaction();

		const currentAccount = getState().global.get('signAccount');

		emitter.emit('windowRequest', id, globals.WINDOW_TYPE, SIGN_STATUS);

		dispatch(GlobalReducer.actions.set({ field: 'loading', value: true }));

		dispatch(removeTransaction(id));

		const networkName = getState().global.getIn(['network', 'name']);

		// get account active keys
		const accountKeys = (await echoService.getChainLib().api.getAccountByName(currentAccount.get('name')))
			.active.key_auths;

		const keyPromises =
			await Promise.all(accountKeys.map((key) => echoService.getCrypto().getInByNetwork(
				networkName,
				key[0],
			)));

		const indexPublicKey = keyPromises.findIndex((key) => !!key);

		// get private key
		const privateKey = await echoService.getCrypto().getSignPrivateKey(
			networkName,
			accountKeys[indexPublicKey][0],
		);

		// if its transfer and has memo
		if (operations[0][1].memo) {
			operations[0][1].memo = await echoService.getCrypto().encryptMemo(
				networkName,
				operations[0][1].memo.from,
				operations[0][1].memo.to,
				Buffer.from(operations[0][1].memo.message, 'hex').toString(),
				operations[0][1].memo.nonce,
			);
		}

		if (operations[0][1].from) {
			operations[0][1].from = currentAccount.get('id');
		} else if (operations[0][1].registrar) {
			operations[0][1].registrar = currentAccount.get('id');
		}

		// SIGN
		const signData = await signTransaction.sign(
			tr,
			privateKey,
			[[operations[0][0], operations[0][1]]],
		);

		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));

		history.push(SUCCESS_SEND_PATH);

		emitter.emit('trSignResponse', signData, globals.WINDOW_TYPE);
	} catch (err) {
		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));

		dispatch(removeTransaction(id));

		emitter.emit('response', `Error: ${err}`, id, ERROR_STATUS);

		emitter.emit('windowRequest', id, globals.WINDOW_TYPE);

		history.push(ERROR_SEND_PATH);
	}
};

export const setWindowType = (type) => {
	globals.WINDOW_TYPE = type;
};
