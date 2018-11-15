import { Map, List } from 'immutable';
import BN from 'bignumber.js';

import history from '../history';
import store from '../store';

import { getOperationFee } from '../api/WalletApi';
import { fetchChain, getChainSubcribe, lookupAccounts } from '../api/ChainApi';

import echoService from '../services/echo';
import { validateOperation, getFetchMap, formatToSend } from '../services/operation';

import FormatHelper from '../helpers/FormatHelper';
import ValidateTransactionHelper from '../helpers/ValidateTransactionHelper';

import { INDEX_PATH, NOT_RETURNED_PATHS } from '../constants/RouterConstants';
import {
	APPROVED_STATUS,
	CANCELED_STATUS,
	ERROR_STATUS,
	CORE_ID,
	ACCOUNTS_LOOKUP_LIMIT,
	BROADCAST_LIMIT,
} from '../constants/GlobalConstants';
import { operationKeys, operationTypes } from '../constants/OperationConstants';

import GlobalReducer from '../reducers/GlobalReducer';

const emitter = echoService.getEmitter();

/**
 *  @method checkTransactionAccount
 *
 * 	Is account-receiver exists
 *
 * 	@param {String} toAccount
 */
const checkTransactionAccount = async (toAccount) => {
	try {
		const toAccountResult = await lookupAccounts(toAccount, ACCOUNTS_LOOKUP_LIMIT);

		if (!toAccountResult.find((i) => i[0] === toAccount)) {
			return 'Account \'to\' not found';
		}
	} catch (err) {
		return FormatHelper.formatError(err);
	}

	return null;
};

/**
 *  @method validateTransfer
 *
 * 	Validate transfer operation fields
 *
 * 	@param {Object} options
 * 	@param {Object} options.amount - Amount and asset id
 * 	@param {Object} options.fee - Amount and asset id
 * 	@param {String} options.from
 * 	@param {String} options.to
 * 	@param {String} options.type
 * 	@param {Object} account
 */
const validateTransfer = (options, account) => async (dispatch, getState) => {
	if (options.to) {
		const accountError = await checkTransactionAccount(options.to);

		if (accountError) {
			return accountError;
		}
	}

	const balances = getState().balance.get('balances');

	const amountIdError = ValidateTransactionHelper.validateAssetId(
		options.amount.asset_id,
		balances,
		account,
	);

	if (amountIdError) {
		return 'Amount asset id not found';
	}

	if (options.fee) {
		if (options.amount.asset_id !== options.fee.asset_id) {
			const feeIdError = ValidateTransactionHelper.validateAssetId(
				options.fee.asset_id,
				balances,
				account,
			);

			if (feeIdError) {
				return 'Fee asset id not found';
			}
		}
	}

	if (options.amount.amount) {
		const amountError = ValidateTransactionHelper.validateAmount(options.amount.amount);

		if (amountError) {
			return amountError;
		}
	}

	return null;
};

/**
 *  @method validateContract
 *
 * 	Validate contract operation fields
 *
 * 	@param {Object} options
 * 	@param {String} options.asset_id
 * 	@param {String} options.code
 * 	@param {Object} options.fee - Fee and asset id
 * 	@param {String} options.receiver
 * 	@param {String} options.registrar
 * 	@param {String} options.type
 * 	@param {String} options.value
 * 	@param {Object} account
 */
const validateContract = (options, account) => (dispatch, getState) => {
	if (options.receiver) {
		const contractIdError = ValidateTransactionHelper.validateContractId(options.receiver);

		if (contractIdError) {
			return contractIdError;
		}
	}

	const balances = getState().balance.get('balances');

	if (options.asset_id) {
		const amountIdError = ValidateTransactionHelper.validateAssetId(
			options.asset_id,
			balances,
			account,
		);

		if (amountIdError) {
			return 'Amount asset id not found';
		}
	}

	if (options.fee) {
		if (options.asset_id !== options.fee.asset_id) {
			const feeIdError = ValidateTransactionHelper.validateAssetId(
				options.fee.asset_id,
				balances,
				account,
			);

			if (feeIdError) {
				return 'Fee asset id not found';
			}
		}
	}

	if (options.value) {
		const amountError = ValidateTransactionHelper.validateAmount(options.value);

		if (amountError) {
			return amountError;
		}
	}

	if (options.code) {
		const codeError = ValidateTransactionHelper.validateCode(options.code);

		if (codeError) {
			return codeError;
		}
	}

	return null;
};

/**
 *  @method validateTransaction
 *
 * 	Validate transaction operation
 *
 * 	@param {Object} options
 */
const validateTransaction = (options) => async (dispatch, getState) => {
	let error = validateOperation(options);

	if (error) {
		return error;
	}

	const networkName = getState().global.getIn(['network', 'name']);
	const accounts = getState().global.getIn(['accounts', networkName]);
	const account = options[operationKeys[options.type]];

	const accountResult = accounts.find((a) => [a.id, a.name].includes(account));

	if (!accountResult) {
		return 'Account not found';
	}

	switch (options.type) {
		case operationTypes.transfer.name.toLowerCase():
			error = await dispatch(validateTransfer(options, accountResult));
			break;
		case operationTypes.contract.name.toLowerCase():
			error = dispatch(validateContract(options, accountResult));
			break;
		default:
			return 'Operation type not found';
	}

	return error;
};

/**
 *  @method checkTransactionFee
 *
 * 	Validate operation fee
 *
 * 	@param {Object} options
 * 	@param {Object} transaction
 */
const checkTransactionFee = (options, transaction) => (dispatch, getState) => {
	let valueAssetId = '';

	if (options.type === operationTypes.contract.name.toLowerCase()) {
		valueAssetId = transaction.asset_id;
	} else if (options.type === operationTypes.transfer.name.toLowerCase()) {
		valueAssetId = transaction.amount.asset;
	}

	if (!valueAssetId) {
		return null;
	}

	const balances = getState().balance.get('balances');
	const accountId = getState().global.getIn(['account', 'id']);

	if (!accountId) {
		return 'Account not available';
	}

	const balance = balances
		.find((val) => val.get('owner') === accountId && val.get('asset_type') === transaction.fee.asset.get('id'))
		.get('balance');

	if (valueAssetId.get('id') === transaction.fee.asset.get('id')) {
		const total = new BN(options.value).times(10 ** valueAssetId.get('precision')).plus(transaction.fee.amount);

		if (total.gt(balance)) {
			return 'Insufficient funds for fee';
		}
	} else if (new BN(transaction.fee.amount).gt(balance)) {
		return 'Insufficient funds for fee';

	}

	return null;
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

/**
 *  @method getFetchedObjects
 *
 * 	Get fetched objects
 *
 * 	@param {Array} fetchList
 * 	@param {String} id
 */
const getFetchedObjects = async (fetchList, id) => {
	try {
		return Promise.all(fetchList.map(async ([key, value]) => {
			const result = await fetchChain(value);
			return { [key]: result };
		}));
	} catch (err) {
		const error = FormatHelper.formatError(err);
		emitter.emit('response', error, id, ERROR_STATUS);

		return null;
	}
};

/**
 *  @method setTransaction
 *
 * 	Set transaction data to redux store
 *
 * 	@param {String} id
 * 	@param {Object} options
 */
const setTransaction = ({ id, options }) => async (dispatch) => {
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
		emitter.emit('response', `${arrTemp} incorrect`, id, ERROR_STATUS);
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

	transaction.fee = await getTransactionFee(transaction);

	const errorFee = dispatch(checkTransactionFee(options, transaction));

	if (errorFee) {
		emitter.emit('response', `${arrTemp} incorrect`, id, ERROR_STATUS);
		return null;
	}

	dispatch(GlobalReducer.actions.setIn({
		field: 'sign',
		params: { current: new Map({ id, options: transaction }) },
	}));

	return null;
};

/**
 *  @method removeTransaction
 *
 * 	Remove transaction data from redux store
 *
 * 	@param {String} id
 */
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

/**
 *  @method requestHandler
 *
 * 	Incoming transaction requests handling
 *
 * 	@param {String} id
 * 	@param {Object} options
 */
const requestHandler = async (id, options) => {
	const isLocked = store.getState().global.getIn(['crypto', 'isLocked']);

	if (isLocked) {
		emitter.emit('response', 'Unlock required', id, ERROR_STATUS);
		return null;
	}

	const connected = store.getState().global.get('connected');

	if (!connected) {
		emitter.emit('response', 'Network error', id, ERROR_STATUS);
		return null;
	}

	const error = await store.dispatch(validateTransaction(options));
	if (error) {
		emitter.emit('response', error, id, ERROR_STATUS);
		return null;
	}

	const transactions = store.getState().global.getIn(['sign', 'transactions']);

	if (!transactions.size) {
		await store.dispatch(setTransaction({ id, options }));
	}

	store.dispatch(GlobalReducer.actions.setIn({
		field: 'sign',
		params: { transactions: transactions.push({ id, options }) },
	}));

	return null;
};

emitter.on('request', requestHandler);

window.onunload = () => {
	if (getChainSubcribe()) {
		const { ChainStore } = echoService.getChainLib();
		ChainStore.unsubscribe(getChainSubcribe());
	}

	emitter.removeListener('request', requestHandler);
};

/**
 *  @method loadRequests
 *
 * 	Load transactions data from query to redux store
 */
export const loadRequests = () => async (dispatch, getState) => {
	const connected = getState().global.get('connected');

	const transactions = echoService.getRequests().filter(async ({ id, options }) => {
		const error = connected ? await dispatch(validateTransaction(options)) : 'Network error';

		if (error) {
			emitter.emit('response', error, id, ERROR_STATUS);
		}

		return !error;
	});

	if (!transactions.length) { return null; }

	const { pathname } = history.location;

	dispatch(GlobalReducer.actions.set({
		field: 'sign',
		value: new Map({
			goTo: !NOT_RETURNED_PATHS.includes(pathname) ? pathname : null,
			transactions: new List(transactions),
		}),
	}));

	await dispatch(setTransaction(transactions[0]));

	return null;
};

/**
 *  @method sendTransaction
 *
 * 	Send transaction
 *
 * 	@param {Object} transaction
 */
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

/**
 *  @method approveTransaction
 *
 * 	Approve transaction
 *
 * 	@param {Object} transaction
 */
export const approveTransaction = (transaction) => async (dispatch) => {
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

/**
 *  @method cancelTransaction
 *
 * 	Cancel transaction
 *
 * 	@param {String} id
 */
export const cancelTransaction = (id) => (dispatch) => {
	emitter.emit('response', null, id, CANCELED_STATUS);

	dispatch(removeTransaction(id));
};

/**
 *  @method switchTransactionAccount
 *
 * 	Switch account when extension waits for decision-making
 *
 * 	@param {String} name
 */
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
