import BalanceReducer from '../reducers/BalanceReducer';

import { fetchChain } from '../api/ChainApi';

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
