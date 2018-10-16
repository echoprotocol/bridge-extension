import { List } from 'immutable';

import BalanceReducer from '../reducers/BalanceReducer';

import { fetchChain } from '../api/ChainApi';

/**
 *  @method initAssetsBalances
 *
 * 	Initialization user's assets
 *
 * 	@param {String} activeUserName
 */
export const initAssetsBalances = (activeUserName) => async (dispatch, getState) => {
	const userBalances = (await fetchChain(activeUserName)).get('balances');

	const balancesPromises = [];
	const assetsPromises = [];
	const balancesState = getState().balance;
	const stateAssets = balancesState.get('assets');
	const stateBalances = balancesState.get('balances');

	userBalances.forEach((value) => balancesPromises.push(fetchChain(value)));

	userBalances.mapKeys((value) => assetsPromises.push(fetchChain(value)));

	let balances = stateBalances;
	let assets = stateAssets;


	const balancesPromise = Promise.all(balancesPromises);
	const assetsPromise = Promise.all(assetsPromises);

	const [balancesResult, assetsResult] = await Promise.all([balancesPromise, assetsPromise]);

	balancesResult.forEach((value) => {
		balances = balances.set(value.get('id'), value);
	});
	assetsResult.forEach((value) => {
		assets = assets.set(value.get('id'), value);
	});

	if ((stateAssets !== assets) || (stateBalances !== balances)) {
		dispatch(BalanceReducer.actions.setAssets({
			balances,
			assets,
		}));
	}

};

/**
 *  @method initPreviewBalances
 *
 * 	Reset active user's assets
 *
 */
export const resetAssets = () => (dispatch) => {
	dispatch(BalanceReducer.actions.resetAssets());
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
			preview.balanceId = balance;
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

export const updatePreviewBalances = (networkName) => async (dispatch) => {

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
