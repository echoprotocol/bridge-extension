import { EchoJSActions } from 'echojs-redux';
import { List } from 'immutable';

import BalanceReducer from '../reducers/BalanceReducer';
import { checkBlockTransaction, checkTransactionResult } from '../helpers/ContractHelper';
import { getContractResult, getTokenBalance } from '../api/ContractApi';

export const getAssetsBalances = (assets) => async (dispatch) => {
	let balances = [];

	if (assets && Object.keys(assets).length) {
		balances = Object.entries(assets).map(async (asset) => {
			const stats = (await dispatch(EchoJSActions.fetch(asset[1]))).toJS();
			asset = (await dispatch(EchoJSActions.fetch(asset[0]))).toJS();
			return { balance: stats.balance, ...asset };
		});

		balances = await Promise.all(balances);
	}

	dispatch(BalanceReducer.actions.set({
		field: 'assets',
		value: new List(balances),
	}));
};

export const updateTokenBalances = () => async (dispatch, getState) => {

	const tokens = getState().balance.get('tokens');
	const accountId = getState().global.getIn(['activeUser', 'id']);
	const instance = getState().echojs.getIn(['system', 'instance']);

	if (!tokens.size || !accountId || !instance) return;
	let balances = tokens.map(async (value) => {
		const balance = await getTokenBalance(instance, accountId, value.id);
		return { ...value, balance };
	});

	balances = await Promise.all(balances);

	dispatch(BalanceReducer.actions.set({
		field: 'tokens',
		value: new List(balances),
	}));
};

export const getPreviewBalances = (networkName) => async (dispatch) => {
	/**
     *  Preview structure
     *  preview: [{
     *  	balance: {
     *  		id,
     *  		amount,
     *  	 	symbol,
     *  		precision,
     *  	},
     *  	name,
	 *  	icon,
     *  }]
     */

	let accounts = localStorage.getItem(`accounts_${networkName}`);
	accounts = accounts ? JSON.parse(accounts) : [];

	const { symbol, precision } = (await dispatch(EchoJSActions.fetch('1.3.0'))).toJS();

	const balances = accounts.map(async ({ name, icon }) => {
		const account = (await dispatch(EchoJSActions.fetch(name))).toJS();

		const preview = {
			balance: {
				amount: 0,
				symbol,
				precision,
			},
			name,
			icon,
		};

		if (account && account.balances && account.balances['1.3.0']) {
			const stats = (await dispatch(EchoJSActions.fetch(account.balances['1.3.0']))).toJS();
			preview.balance.amount = stats.balance || 0;
			preview.balance.id = account.balances['1.3.0'];
		}

		return preview;
	});

	balances.reduce(
		(resolved, balance) =>
			resolved.then((array) => balance.then((result) => [...array, result]).catch(() => array)),
		Promise.resolve([]),
	).then((result) => {
		dispatch(BalanceReducer.actions.set({ field: 'preview', value: new List(result) }));
	});
};

export const initBalances = (networkName) => async (dispatch) => {
	await dispatch(getPreviewBalances(networkName));
};

const checkTransactionLogs = async (r, instance, accountId) => {
	if (typeof r[1] === 'object' || !r[1].startsWith('1.17')) return false;

	const result = await getContractResult(instance, r[1]);

	return checkTransactionResult(accountId, result);
};

export const getObject = (subscribeObject) => async (dispatch, getState) => {
	const accountId = getState().global.getIn(['activeUser', 'id']);
	const instance = getState().echojs.getIn(['system', 'instance']);

	if (!accountId || !instance) return;
	switch (subscribeObject.type) {
		case 'block': {
			const tokens = getState().balance.get('tokens');
			const { transactions } = subscribeObject.value;
			if (!transactions || !tokens.size || !transactions.length) return;

			const isNeedUpdate = transactions.some((tr) =>
				tr.operations.some((op) => checkBlockTransaction(accountId, op, tokens)) ||
				tr.operations_results.some(async (r) => {
					const result = await checkTransactionLogs(r, instance, accountId);
					return result;
				}));

			if (isNeedUpdate) await dispatch(updateTokenBalances());
			break;
		}
		case 'objects': {
			const objectId = subscribeObject.value.get('id');
			const balances = getState().echojs.getIn(['data', 'accounts', accountId, 'balances']);
			const assets = getState().balance.get('assets');

			if (
				balances && (
					Object.values(balances.toJS()).includes(objectId) || balances.size !== assets.size
				)
			) {
				await dispatch(getAssetsBalances(balances.toJS(), true));
			}

			const preview = getState().balance.get('preview').toJS();
			const networkName = getState().global.getIn(['network', 'name']);

			if (preview.find((i) => i.balance.id === objectId)) {
				await dispatch(getPreviewBalances(networkName));
			}

			break;
		}
		case 'accounts': {
			const name = subscribeObject.value.get('name');
			const balances = subscribeObject.value.get('balances').toJS();

			const accountName = getState().global.getIn(['activeUser', 'name']);

			if (accountName === name) {
				dispatch(getAssetsBalances(balances, true));
			}

			break;
		}
		default:
	}
};
