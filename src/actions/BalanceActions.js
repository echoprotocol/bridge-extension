import { Map, List } from 'immutable';

import BalanceReducer from '../reducers/BalanceReducer';

import { fetchChain } from '../api/ChainApi';

/**
 *  @method initAssetsBalances
 *
 * 	Initialization user's assets
 *
 * 	@param {Object} userBalances
 */
export const initAssetsBalances = (userBalances) => async (dispatch, getState) => {
	const arr = [];
	const arrAssets = [];
	const stateAssets = getState().balance.get('assets');
	const stateBalances = getState().balance.get('balances');

	userBalances.forEach((value) => arr.push(fetchChain(value)));
	userBalances.mapKeys((value) => arrAssets.push(fetchChain(value)));

	let balances = new Map();
	let assets = new Map();

	(await Promise.all(arr)).forEach((bal, key) => {
		balances = balances.set(key.toString(), bal);
	});
	(await Promise.all(arrAssets)).forEach((asset, key) => {
		assets = assets.set(key.toString(), asset);
	});

	if (!stateAssets.equals(assets) && !stateBalances.equals(balances)) {
		dispatch(BalanceReducer.actions.setAssets({
			balances,
			assets,
		}));
	}
};

/**
 *  @method initPreviewBalances
 *
 * 	Initialization list of users
 *
 * 	@param {String} networkName
 */
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

/**
 *  @method initBalances
 *
 * 	Initialization list of users and assets
 *
 * 	@param {String} networkName
 * 	@param {Object} balances
 */
export const initBalances = (networkName, balances) => async (dispatch) => {
	await dispatch(initPreviewBalances(networkName));

	await dispatch(initAssetsBalances(balances));
};
