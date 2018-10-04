import { List } from 'immutable';
import { EchoJSActions } from 'echojs-redux';

import BalanceReducer from '../reducers/BalanceReducer';

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
     *  }]
     */

	let accounts = localStorage.getItem(`accounts_${networkName}`);
	accounts = accounts ? JSON.parse(accounts) : [];

	const { symbol, precision } = (await dispatch(EchoJSActions.fetch('1.3.0'))).toJS();

	const balances = accounts.map(async ({ name }) => {
		const account = (await dispatch(EchoJSActions.fetch(name))).toJS();

		const preview = {
			balance: {
				amount: 0,
				symbol,
				precision,
			},
			name,
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

// export const getObject = (subscribeObject) => async (dispatch, getState) => {
// 	const accountId = getState().global.getIn(['activeUser', 'id']);
// 	const instance = getState().echojs.getIn(['system', 'instance']);
//
// 	if (!accountId || !instance) return;
// 	switch (subscribeObject.type) {
// 		case 'block': {
// 			const tokens = getState().balance.get('tokens');
// 			const { transactions } = subscribeObject.value;
// 			if (!transactions || !tokens.size || !transactions.length) return;
//
// 			const isNeedUpdate = transactions.some((tr) =>
// 				tr.operations.some((op) => checkBlockTransaction(accountId, op, tokens)) ||
//                 tr.operation_results.some(async (r) => {
//                 	const result = await checkTransactionLogs(r, instance, accountId);
//                 	return result;
//                 }));
// 			if (isNeedUpdate) await dispatch(updateTokenBalances());
// 			break;
// 		}
// 		case 'objects': {
// 			const objectId = subscribeObject.value.get('id');
// 			const balances = getState().echojs.getIn(['data', 'accounts', accountId, 'balances']);
// 			const assets = getState().balance.get('assets');
//
// 			if (
// 				balances && (
// 					Object.values(balances.toJS()).includes(objectId) || balances.size !== assets.size
// 				)
// 			) {
// 				await dispatch(getAssetsBalances(balances.toJS(), true));
// 			}
//
// 			const preview = getState().balance.get('preview').toJS();
// 			const networkName = getState().global.getIn(['network', 'name']);
//
// 			if (preview.find((i) => i.balance.id === objectId)) {
// 				await dispatch(getPreviewBalances(networkName));
// 			}
//
// 			break;
// 		}
// 		case 'accounts': {
// 			const name = subscribeObject.value.get('name');
// 			const balances = subscribeObject.value.get('balances').toJS();
//
// 			const accountName = getState().global.getIn(['activeUser', 'name']);
//
// 			if (accountName === name) {
// 				dispatch(getAssetsBalances(balances, true));
// 			}
//
// 			break;
// 		}
// 		default:
// 	}
// };

export const resetBalance = () => (dispatch) => {
	dispatch(BalanceReducer.actions.reset());
};
