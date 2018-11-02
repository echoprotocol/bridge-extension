import BN from 'bignumber.js';

import BalanceReducer from '../reducers/BalanceReducer';

import { fetchChain } from '../api/ChainApi';
import { FORM_SEND } from '../constants/FormConstants';
import { setFormError, toggleLoading } from './FormActions';
import ValidateSendHelper from '../helpers/ValidateSendHelper';
import { getTransactionFee } from './SignActions';
import { CORE_ID } from '../constants/GlobalConstants';
import echoService from '../services/echo';

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

const checkFeePool = (echo, asset, fee) => {
	if (echo.id === asset.id) { return true; }

	let feePool = new BN(asset.dynamic.fee_pool).div(10 ** echo.precision);

	const { quote, base } = asset.options.core_exchange_rate;
	const precision = echo.precision - asset.precision;
	const price = new BN(quote.amount).div(base.amount).times(10 ** precision);
	feePool = price.times(feePool).times(10 ** asset.precision);

	return feePool.gt(fee);
};

export const send = () => async (dispatch, getState) => {
	const form = getState().form.get(FORM_SEND);

	const amount = Number(form.get('amount').value).toString();

	const to = form.get('to');
	let fee = form.get('fee');
	const note = form.get('note');

	if (to.error || form.get('amount').error || fee.error || note.error) {
		return false;
	}

	const selectedBalance = getState().form.getIn([FORM_SEND, 'selectedBalance']);
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
	}

	const fromAccount = await fetchChain(getState().global.getIn(['account', 'name']));
	const toAccount = await fetchChain(to.value);

	const options = {
		amount: {
			amount,
			asset: assets.get(balances.getIn([selectedBalance, 'asset_type'])),
		},
		fee: {
			amount: fee.value || 0,
			asset: assets.get(balances.getIn([selectedBalance, 'asset_type'])),
		},
		from: fromAccount,
		to: toAccount,
		type: 'transfer',
	};

	if (!fee.value) {
		fee = await getTransactionFee(options);
	}

	if (!checkFeePool(assets.get(CORE_ID).toJS(), options.fee.asset.toJS(), fee.amount)) {
		dispatch(setFormError(
			FORM_SEND,
			'fee',
			`${options.fee.asset.get('symbol')} fee pool balance is less than fee amount`,
		));
		return false;
	}

	if (options.amount.asset.get('id') === options.fee.asset.get('id')) {
		const total = new BN(amount).times(10 ** options.amount.asset.get('precision')).plus(fee.amount);

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

	dispatch(toggleLoading(FORM_SEND, 'loading', true));

	const { TransactionBuilder } = await echoService.getChainLib();
	const tr = new TransactionBuilder();

	// tr.add_type_operation('transfer', transactionOptions);

	await tr.set_required_fees(options.asset_id);
	// tr.add_signer(privateKey);

	await tr.broadcast();

	return true;
};
