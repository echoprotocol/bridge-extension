import { List } from 'immutable';

import BalanceReducer from '../reducers/BalanceReducer';

import { fetchChain } from '../api/ChainApi';

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

	const { symbol, precision } = (await fetchChain('1.3.0')).toJS();

	const balances = accounts.map(async ({ name, icon }) => {
		const account = (await fetchChain(name)).toJS();

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
			const stats = (await fetchChain(account.balances['1.3.0'])).toJS();
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
