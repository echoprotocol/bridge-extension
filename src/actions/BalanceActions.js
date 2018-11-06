import BN from 'bignumber.js';

import { setFormError, setValue, setFormValue } from './FormActions';
import { getTransactionFee } from './SignActions';

import { fetchChain, lookupAccounts } from '../api/ChainApi';

import { FORM_SEND } from '../constants/FormConstants';
import { CORE_ID } from '../constants/GlobalConstants';
import { ERROR_SEND_PATH, SUCCESS_SEND_PATH } from '../constants/RouterConstants';

import echoService from '../services/echo';
import { formatToSend } from '../services/operation';

import FormatHelper from '../helpers/FormatHelper';
import ValidateSendHelper from '../helpers/ValidateSendHelper';

import BalanceReducer from '../reducers/BalanceReducer';
import GlobalReducer from '../reducers/GlobalReducer';

import history from '../history';

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

	const options = {
		amount: {
			amount,
			asset: assets.get(balances.getIn([selectedBalance, 'asset_type'])),
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

	dispatch(GlobalReducer.actions.set({ field: 'loading', value: true }));

	const isAccount = await dispatch(checkAccount(activeUserName, to.value));

	if (!isAccount) {
		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));

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
			dispatch(setFormError(FORM_SEND, 'fee', 'Insufficient funds for fee'));
			return false;
		}
	} else {
		const feeBalance = balances.find((val) => val.get('asset_type') === options.fee.asset.get('id')).get('balance');

		if (new BN(fee.value).gt(feeBalance)) {
			dispatch(setFormError(FORM_SEND, 'fee', 'Insufficient funds for fee'));
			return false;
		}
	}

	try {
		const transactionOptions = formatToSend('transfer', options);

		const publicKey = fromAccount.getIn(['active', 'key_auths', '0', '0']);

		const networkName = getState().global.getIn(['network', 'name']);

		const { TransactionBuilder } = await echoService.getChainLib();
		let tr = new TransactionBuilder();
		tr = await echoService.getCrypto().sign(networkName, tr, publicKey);

		if (memo.value) {

			transactionOptions.memo = await echoService.getCrypto().encryptMemo(
				networkName,
				fromAccount.getIn(['options', 'memo_key']),
				toAccount.getIn(['options', 'memo_key']),
				memo.value,
			);
		}

		transactionOptions.amount.amount *= (10 ** options.amount.asset.get('precision'));

		tr.add_type_operation('transfer', transactionOptions);
		await tr.set_required_fees(transactionOptions.fee.asset_id);

		await tr.broadcast();

		history.push(SUCCESS_SEND_PATH);
	} catch (err) {
		dispatch(setValue(FORM_SEND, 'error', FormatHelper.formatError(err)));

		history.push(ERROR_SEND_PATH);

		return false;
	} finally {
		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
	}

	return true;
};
