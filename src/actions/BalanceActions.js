import { List } from 'immutable';

import BalanceReducer from '../reducers/BalanceReducer';

import { fetchChain } from '../api/ChainApi';

export const getAssetsBalances = (assets) => async (dispatch) => {
	let balances = [];

	if (assets && Object.keys(assets).length) {
		balances = Object.entries(assets).map(async (asset) => {
			const balance = await fetchChain(asset[1]);
			asset = (await fetchChain(asset[0]));
			return {
				id: balance.get('id'),
				balance: balance.get('balance'),
				precision: asset.get('precision'),
				symbol: asset.get('symbol'),
			};
		});

		balances = await Promise.all(balances);
	}

	dispatch(BalanceReducer.actions.set({
		field: 'assets',
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

	const fetchedAsset = await fetchChain('1.3.0');

	const balances = accounts.map(async ({ name, icon }) => {
		const account = await fetchChain(name);
		const balance = account.getIn(['balances', '1.3.0']);

		const preview = {
			balance: {
				amount: 0,
				symbol: fetchedAsset.get('symbol'),
				precision: fetchedAsset.get('precision'),
			},
			name,
			icon,
		};

		if (account && account.get('balances') && balance) {
			const balanceAmount = (await fetchChain(balance)).get('balance');
			preview.balance.amount = balanceAmount || 0;
			preview.balance.id = balance;
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

export const initBalances = (networkName, balances) => async (dispatch) => {
	await dispatch(getPreviewBalances(networkName));

	await dispatch(getAssetsBalances(balances));
};

// export const getObject = (subscribeObject) => async (dispatch, getState) => {
// 	const accountId = getState().global.getIn(['activeUser', 'id']);
// 	const instance = getState().echojs.getIn(['system', 'instance']);
//
// 	if (!accountId || !instance) return;
// 	switch (subscribeObject.type) {
// 		case 'objects': {
// 			const objectId = subscribeObject.value.get('id');
// 			const balances = getState().echojs.getIn(['data', 'accounts', accountId, 'balances']);
// 			const assets = getState().balance.get('assets');
//
// 			if (
// 				balances && (
// 					balances.toArray().includes(objectId) || balances.size !== assets.size
// 				)
// 			) {
// 				await dispatch(getAssetsBalances(balances.toObject()));
// 			}
//
// 			const preview = getState().balance.get('preview');
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
// 			const balances = subscribeObject.value.get('balances');
//
// 			const accountName = getState().global.getIn(['activeUser', 'name']);
//
// 			if (accountName === name) {
// 				dispatch(getAssetsBalances(balances.toObject()));
// 			}
//
// 			break;
// 		}
// 		default:
// 	}
// };
