import { Map, List } from 'immutable';
import { batchActions } from 'redux-batched-actions';

import GlobalReducer from '../reducers/GlobalReducer';
import BlockchainReducer from '../reducers/BlockchainReducer';
import BalanceReducer from '../reducers/BalanceReducer';

import { initAssetsBalances } from './BalanceActions';

import { fetchChain, connectToAddress, disconnectFromAddress, checkConnection } from '../api/ChainApi';

import echoService from '../services/echo';

import { NETWORKS, GLOBAL_ID, LOGIN_INTERVAL } from '../constants/GlobalConstants';
import ChainStoreCacheNames from '../constants/ChainStoreConstants';

import storage from '../services/storage';

import FormatHelper from '../helpers/FormatHelper';

let INTERVAL_LOGIN_CALL = null;

const resetInterval = () => {
	if (INTERVAL_LOGIN_CALL) {
		clearInterval(INTERVAL_LOGIN_CALL);
	}
};

/**
 * copy object from ChainStore lib to redux every time when triggered, check connection
 * @returns {Function}
 */
export const subscribe = () => (dispatch) => {
	const { ChainStore } = echoService.getChainLib();
	ChainStoreCacheNames.forEach(({ origin, custom: field }) => {
		const value = ChainStore[origin];

		dispatch(BlockchainReducer.actions.set({ field, value }));
	});

	dispatch(initAssetsBalances());
};

/**
 * connect socket current network
 * @returns {Function}
 */
export const connect = () => async (dispatch) => {
	dispatch(batchActions([
		GlobalReducer.actions.set({ field: 'loading', value: true }),
		GlobalReducer.actions.set({ field: 'connected', value: false }),
	]));

	try {
		let network = await storage.get('current_network');

		if (!network) {
			[network] = NETWORKS;
			await storage.set('current_network', network);
		}

		dispatch(GlobalReducer.actions.set({ field: 'network', value: new Map(network) }));

		const networks = await storage.get('custom_networks');

		if (networks) {
			dispatch(GlobalReducer.actions.set({ field: 'networks', value: new List(networks) }));
		}

		const subscribeCb = () => dispatch(subscribe());

		await connectToAddress(network.url, subscribeCb);

		resetInterval();

		INTERVAL_LOGIN_CALL = setInterval((() => {
			dispatch(checkConnection(network.url));
		}), LOGIN_INTERVAL);

		dispatch(GlobalReducer.actions.set({ field: 'connected', value: true }));

		await fetchChain(GLOBAL_ID);
	} catch (err) {
		dispatch(batchActions([
			GlobalReducer.actions.set({
				field: 'error',
				value: FormatHelper.formatError(err),
			}),
			GlobalReducer.actions.set({ field: 'connected', value: false }),
		]));
	} finally {
		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
	}
};

/**
 * disconnect socket from address
 * @param {String} address
 * @returns {Function}
 */
export const disconnect = (address) => async (dispatch) => {
	try {
		resetInterval();

		await disconnectFromAddress(address);
		dispatch(batchActions([
			BlockchainReducer.actions.disconnect(),
			BalanceReducer.actions.reset(),
			GlobalReducer.actions.set({ field: 'connected', value: false }),
		]));
	} catch (err) {
		dispatch(GlobalReducer.actions.set({
			field: 'error',
			value: FormatHelper.formatError(err),
		}));
	}
};
