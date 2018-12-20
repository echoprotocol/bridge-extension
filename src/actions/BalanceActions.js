import BN from 'bignumber.js';
import { Map } from 'immutable';
import { batchActions } from 'redux-batched-actions';

import { setFormError, setValue, setFormValue } from './FormActions';
import { getTransactionFee } from './SignActions';
import { getCryptoInfo, setCryptoInfo } from './CryptoActions';
import { set } from './GlobalActions';

import { fetchChain, getContract, getTokenDetails, lookupAccounts } from '../api/ChainApi';

import { FORM_SEND, FORM_WATCH_TOKEN } from '../constants/FormConstants';
import { CORE_ID, GLOBAL_ID_1 } from '../constants/GlobalConstants';
import { ERROR_SEND_PATH, WALLET_PATH, SEND_PATH } from '../constants/RouterConstants';

import echoService from '../services/echo';

import FormatHelper from '../helpers/FormatHelper';
import ValidateSendHelper from '../helpers/ValidateSendHelper';

import BalanceReducer from '../reducers/BalanceReducer';
import GlobalReducer from '../reducers/GlobalReducer';

import history from '../history';
import store from '../store';
import ValidateTransactionHelper from '../helpers/ValidateTransactionHelper';

const emitter = echoService.getEmitter();

/**
 *  @method initAssetsBalances
 *
 * 	Initialization user's assets
 *
 */
export const initAssetsBalances = () => async (dispatch, getState) => {

	const balancesPromises = [];
	const assetsPromises = [];
	const balancesState = getState().balance;
	const stateAssets = balancesState.get('assets');
	const stateBalances = balancesState.get('balances');

	const accounts = getState().global.get('accounts');
	const activeNetworkName = getState().global.getIn(['network', 'name']);

	if (!accounts.get(activeNetworkName)) {
		return false;
	}

	const allPromises = accounts.get(activeNetworkName).map(async (account) => {

		const userBalances = (await fetchChain(account.name)).get('balances');

		userBalances.forEach((value) => balancesPromises.push(fetchChain(value)));
		userBalances.mapKeys((value) => assetsPromises.push(fetchChain(value)));

		const balancesPromise = Promise.all(balancesPromises);
		const assetsPromise = Promise.all(assetsPromises);

		return Promise.all([balancesPromise, assetsPromise]);

	});

	const balancesAssets = await Promise.all(allPromises);

	let balances = stateBalances;
	let assets = stateAssets;

	balancesAssets.forEach(([balancesResult, assetsResult]) => {

		balancesResult.forEach((value) => {
			balances = balances.set(value.get('id'), value);
		});
		assetsResult.forEach((value) => {
			assets = assets.set(value.get('id'), value);
		});

	});

	if ((stateAssets !== assets) || (stateBalances !== balances)) {
		dispatch(BalanceReducer.actions.setAssets({
			balances,
			assets,
		}));
	}

	return true;

};

/**
 *  @method removeBalances
 *
 * 	Remove balances and assets by deleted user's id
 *
 * 	@param {String} accountId
 */
export const removeBalances = (accountId) => (dispatch, getState) => {
	let balances = getState().balance.get('balances');
	let assets = getState().balance.get('assets');

	balances.forEach((balance) => {
		if (balance.get('owner') === accountId) {
			balances = balances.delete(balance.get('id'));

			if (!balances.find((val) => val.get('asset_type') === balance.get('asset_type'))) {
				assets = assets.delete(balance.get('asset_type'));
			}
		}
	});

	dispatch(BalanceReducer.actions.setAssets({
		balances,
		assets,
	}));
};

/**
 *  @method checkFeePool
 *
 * 	Remove balances and assets by deleted user's id
 *
 * 	@param {Object} coreAsset
 * 	@param {Object} asset
 * 	@param {Number} fee
 */
const checkFeePool = (coreAsset, asset, fee) => {
	if (coreAsset.get('id') === asset.get('id')) { return true; }

	let feePool = new BN(asset.getIn(['dynamic', 'fee_pool'])).div(10 ** coreAsset.get('precision'));

	const base = asset.getIn(['options', 'core_exchange_rate', 'base']);
	const quote = asset.getIn(['options', 'core_exchange_rate', 'quote']);
	const precision = coreAsset.get('precision') - asset.get('precision');
	const price = new BN(quote.get('amount')).div(base.get('amount')).times(10 ** precision);
	feePool = price.times(feePool).times(10 ** asset.get('precision'));

	return feePool.gt(fee);
};

/**
 *  @method checkAccount
 *
 * 	Look up accounts
 *
 * 	@param {String} fromAccount
 * 	@param {String} toAccount
 * 	@param {Number} limit
 */
export const checkAccount = (fromAccount, toAccount, limit = 50) => async (dispatch) => {
	try {
		if (fromAccount === toAccount) {
			dispatch(setFormError(FORM_SEND, 'to', 'You can not send funds to yourself'));
			return false;
		}

		const result = await lookupAccounts(toAccount, limit);

		if (!result.find((i) => i[0] === toAccount)) {
			dispatch(setFormError(FORM_SEND, 'to', 'Account is not found'));
			return false;
		}
	} catch (err) {
		dispatch(setValue(FORM_SEND, 'error', FormatHelper.formatError(err)));

		history.push(ERROR_SEND_PATH);

		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));

		return false;
	}

	return true;
};

/**
 *  @method setFeeFormValue
 *
 * 	Set fee depending on the amount value and memo
 */
export const setFeeFormValue = () => async (dispatch, getState) => {
	const form = getState().form.get(FORM_SEND);

	const to = form.get('to');

	const result = await lookupAccounts(to.value, 50);

	if (!result.find((i) => i[0] === to.value)) {
		return false;
	}

	const amount = Number(form.get('amount').value).toString();
	const memo = form.get('memo');
	const selectedBalance = getState().form.getIn([FORM_SEND, 'selectedBalance']);
	const selectedFeeBalance = getState().form.getIn([FORM_SEND, 'selectedFeeBalance']);
	const balances = getState().balance.get('balances');
	const assets = getState().balance.get('assets');
	const fromAccount = await fetchChain(getState().global.getIn(['account', 'name']));
	const toAccount = await fetchChain(to.value);

	const amountAsset = assets.get(balances.getIn([selectedBalance, 'asset_type']));

	const options = {
		amount: {
			amount: amount * (10 ** amountAsset.get('precision')),
			asset: amountAsset,
		},
		fee: {
			amount: 0,
			asset: assets.get(balances.getIn([selectedFeeBalance, 'asset_type'])),
		},
		from: fromAccount,
		to: toAccount,
		memo: memo.value,
		type: 'transfer',
	};

	if (!options.amount.asset || !options.fee.asset || !options.from) {
		return false;
	}

	const resultFee = await getTransactionFee(options);

	dispatch(setFormValue(FORM_SEND, 'fee', resultFee.amount / (10 ** options.fee.asset.get('precision'))));

	return true;
};

/**
 *  @method send
 *
 * 	Transfer transaction
 */
export const send = () => async (dispatch, getState) => {

	const form = getState().form.get(FORM_SEND);

	const amount = Number(form.get('amount').value).toString();

	const to = form.get('to');
	const fee = form.get('fee');
	const memo = form.get('memo');

	if (to.error || form.get('amount').error || fee.error || memo.error) {
		return false;
	}

	const selectedBalance = getState().form.getIn([FORM_SEND, 'selectedBalance']);
	const selectedFeeBalance = getState().form.getIn([FORM_SEND, 'selectedFeeBalance']);
	const balances = getState().balance.get('balances');
	const assets = getState().balance.get('assets');

	const balance = {
		symbol: assets.getIn([balances.getIn([selectedBalance, 'asset_type']), 'symbol']),
		precision: assets.getIn([balances.getIn([selectedBalance, 'asset_type']), 'precision']),
		balance: balances.getIn([selectedBalance, 'balance']),
	};

	const amountError = ValidateSendHelper.validateAmount(amount, balance);

	if (amountError) {
		dispatch(setFormError(FORM_SEND, 'amount', amountError));
		return false;
	}

	const activeUserName = getState().global.getIn(['account', 'name']);

	const isAccount = await dispatch(checkAccount(activeUserName, to.value));

	if (!isAccount) {
		return false;
	}

	const fromAccount = await fetchChain(activeUserName);
	const toAccount = await fetchChain(to.value);

	const options = {
		amount: {
			amount,
			asset: assets.get(balances.getIn([selectedBalance, 'asset_type'])),
		},
		fee: {
			amount: fee.value || 0,
			asset: assets.get(balances.getIn([selectedFeeBalance, 'asset_type'])),
		},
		from: fromAccount,
		to: toAccount,
		memo: memo.value,
		type: 'transfer',
	};

	if (!fee.value) {
		options.fee = await getTransactionFee(options);
	}

	if (!checkFeePool(assets.get(CORE_ID), options.fee.asset, options.fee.amount)) {
		dispatch(setFormError(
			FORM_SEND,
			'fee',
			`${options.fee.asset.get('symbol')} fee pool balance is less than fee amount`,
		));
		return false;
	}

	if (options.amount.asset.get('id') === options.fee.asset.get('id')) {
		const total = new BN(amount).times(10 ** options.amount.asset.get('precision')).plus(options.fee.amount);

		if (total.gt(balances.getIn([selectedBalance, 'balance']))) {
			dispatch(setFormError(FORM_SEND, 'amount', 'Insufficient funds for fee'));
			return false;
		}
	} else {
		const feeBalance = balances.find((val) => val.get('asset_type') === options.fee.asset.get('id')).get('balance');

		if (new BN(fee.value).gt(feeBalance)) {
			dispatch(setFormError(FORM_SEND, 'amount', 'Insufficient funds for fee'));
			return false;
		}
	}

	options.amount.amount = parseInt(options.amount.amount * (10 ** options.amount.asset.get('precision')), 10);

	const activeNetworkName = getState().global.getIn(['network', 'name']);

	dispatch(GlobalReducer.actions.set({ field: 'loading', value: true }));

	emitter.emit('sendRequest', options, activeNetworkName);

	return true;
};

/**
 *  @method sendHandler
 *
 * 	On send broadcast result emitter response
 *
 * 	@param {String} path
 */
const sendHandler = (path) => {
	if (store.getState().global.get('loading')) {
		history.push(path);
	}

	store.dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
};

emitter.on('sendResponse', sendHandler);

export const watchToken = (contractId) => async (dispatch, getState) => {
	if (!contractId) {
		dispatch(setFormError(FORM_WATCH_TOKEN, 'contractId', 'Contract id should not be empty'));
		return null;
	}

	if (ValidateTransactionHelper.validateContractId(contractId)) {
		dispatch(setFormError(FORM_WATCH_TOKEN, 'contractId', 'Invalid contract id'));
		return null;
	}

	try {
		dispatch(GlobalReducer.actions.set({ field: 'loading', value: true }));
		const contract = await getContract(contractId);

		if (!contract) {
			dispatch(setFormError(FORM_WATCH_TOKEN, 'contractId', 'Invalid contract id'));
			dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
			return null;
		}

		const accountId = getState().global.getIn(['account', 'id']);

		const { symbol, precision, balance } = await getTokenDetails(contractId, accountId);

		if (!symbol || !Number.isInteger(precision)) {
			dispatch(setFormError(FORM_WATCH_TOKEN, 'contractId', 'Invalid token contract'));
			dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
			return null;
		}

		const networkName = getState().global.getIn(['network', 'name']);

		let tokens = await dispatch(getCryptoInfo('tokens', networkName));


		if (tokens && Object.values(tokens).find((id) => id.includes(contractId.split('.')[2]))) {
			dispatch(setFormError(FORM_WATCH_TOKEN, 'contractId', 'Token already exists'));
			dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
			return null;
		}

		if (!tokens) {
			tokens = {};
			tokens[accountId] = [];
		}

		tokens[accountId].push(contractId.split('.')[2]);

		dispatch(setCryptoInfo('tokens', tokens));

		let stateTokens = getState().balance.get('tokens');

		stateTokens = stateTokens
			.setIn([contractId, 'accountId'], accountId)
			.setIn([contractId, 'symbol'], symbol)
			.setIn([contractId, 'precision'], precision)
			.setIn([contractId, 'balance'], balance);

		dispatch(batchActions([
			BalanceReducer.actions.set({ field: 'tokens', value: stateTokens }),
			GlobalReducer.actions.set({ field: 'loading', value: false }),
		]));

		history.push(WALLET_PATH);
	} catch (err) {
		dispatch(setValue(FORM_WATCH_TOKEN, 'error', FormatHelper.formatError(err)));

		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
	}

	return null;
};

const checkBlockTransactions = async (blockNum, count, tokens) => {
	const { ChainStore } = echoService.getChainLib();


	const block = await ChainStore.getBlock(blockNum);

	if (block.transactions.length) {
		for (let tr = 0; tr < block.transactions.length; tr += 1) {
			for (let i = 0; i < block.transactions[tr].operations.length; i += 1) {
				const [, data] = block.transactions[tr].operations[i];
				if (tokens.findKey((value, key) => key === data.receiver)) {
					return true;
				}
			}
		}
	}

	blockNum += 1;
	count -= 1;

	if (count < 0) {
		return false;
	}

	const isUpdated = await checkBlockTransactions(blockNum, count, tokens);

	return !!isUpdated;
};


const isBlockChanged = (tokens) => async (dispatch, getState) => {
	const blockNum = (await fetchChain(GLOBAL_ID_1)).get('head_block_number');

	const stateBlockNum = getState().global.get('headBlockNum');

	if (stateBlockNum === 0) {
		dispatch(GlobalReducer.actions.set({ field: 'headBlockNum', value: blockNum }));
		return false;
	}

	if (blockNum === stateBlockNum) {
		return false;
	}

	let isUpdated = false;

	isUpdated = await checkBlockTransactions(stateBlockNum, blockNum - stateBlockNum, tokens);

	dispatch(GlobalReducer.actions.set({ field: 'headBlockNum', value: blockNum }));

	return isUpdated;
};

export const updateTokens = () => async (dispatch, getState) => {
	const tokens = getState().balance.get('tokens');

	try {
		if (!(await dispatch(isBlockChanged(tokens)))) {
			return false;
		}

		let tokensDetails = [];

		tokens.mapKeys((contractId) => {
			const accountId = tokens.getIn([contractId, 'accountId']);
			tokensDetails.push(getTokenDetails(contractId, accountId));
		});

		tokensDetails = await Promise.all(tokensDetails);

		let stateTokens = tokens;

		tokens.mapEntries(([contractId], index) => {
			stateTokens = stateTokens
				.setIn([contractId, 'symbol'], tokensDetails[index].symbol)
				.setIn([contractId, 'precision'], tokensDetails[index].precision)
				.setIn([contractId, 'balance'], tokensDetails[index].balance);
		});

		if (stateTokens !== tokens) {
			dispatch(BalanceReducer.actions.set({ field: 'tokens', value: stateTokens }));
		}
	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));

		return false;
	}

	return true;
};

export const removeToken = (contractId) => async (dispatch, getState) => {
	const networkName = getState().global.getIn(['network', 'name']);

	const tokens = await dispatch(getCryptoInfo('tokens', networkName));

	const accountId = getState().global.getIn(['account', 'id']);

	tokens[accountId] = tokens[accountId].filter((id) => contractId.split('.')[2] !== id);

	dispatch(setCryptoInfo('tokens', tokens));


	const stateTokens = getState().balance.get('tokens');
	let stateTmpTokens = new Map({});

	stateTokens.mapEntries(([id, value]) => {
		if (contractId !== id) {
			stateTmpTokens = stateTmpTokens.set(id, value);
		}
	});

	dispatch(BalanceReducer.actions.set({ field: 'tokens', value: stateTmpTokens }));
};

/**
 *  @method sendRedirect
 *
 * 	On wallet balance choose redirect from wallet to send
 *
 * 	@param {String} balanceId
 */
export const sendRedirect = (balanceId) => (dispatch) => {
	dispatch(setValue(FORM_SEND, 'selectedBalance', balanceId));

	history.push(SEND_PATH);
};

/**
 *  @method setAssetFormValue
 *
 * 	Set asset form value
 *
 * 	@param {String} form
 * 	@param {String} field
 * 	@param {String} value
 */
export const setAssetFormValue = (form, field, value) => (dispatch, getState) => {
	const selectedBalance = getState().form.getIn([FORM_SEND, 'selectedBalance']);

	if (field === 'selectedBalance' && selectedBalance) {
		return null;
	}

	dispatch(setValue(form, field, value));

	return null;
};
