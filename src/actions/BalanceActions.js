import { List } from 'immutable';

import BalanceReducer from '../reducers/BalanceReducer';

import { fetchChain } from '../api/ChainApi';

import { CORE_ID } from '../constants/GlobalConstants';

export const getPreviewBalances = () => async (dispatch, getState) => {
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

	const accounts = getState().global.get('accounts');

	if (!accounts) { return; }

	const fetchedAsset = await fetchChain(CORE_ID);

	const balances = accounts.map(async ({ name, icon }) => {
		const account = await fetchChain(name);
		const balance = account.getIn(['balances', CORE_ID]);

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

export const initBalances = () => async (dispatch) => {
	await dispatch(getPreviewBalances());
};
