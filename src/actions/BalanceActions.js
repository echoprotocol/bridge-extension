import { List } from 'immutable';

import BalanceReducer from '../reducers/BalanceReducer';

import { fetchChain } from '../api/ChainApi';

export const setAssetBalance = (balanceId, balance) => (dispatch) => {
	dispatch(BalanceReducer.actions.update({ field: 'assets', param: balanceId, value: { balance } }));

	dispatch(BalanceReducer.actions.update({ field: 'preview', param: balanceId, value: { balance } }));
};

export const initAssetsBalances = (assets) => async (dispatch) => {
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

export const initPreviewBalances = (networkName) => async (dispatch) => {
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
			balance: 0,
			symbol: fetchedAsset.get('symbol'),
			precision: fetchedAsset.get('precision'),
			accountName: name,
			icon,
		};

		if (account && account.get('balances') && balance) {
			const balanceAmount = (await fetchChain(balance)).get('balance');
			preview.balance = balanceAmount || 0;
			preview.id = balance;
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
	await dispatch(initPreviewBalances(networkName));

	await dispatch(initAssetsBalances(balances));
};
