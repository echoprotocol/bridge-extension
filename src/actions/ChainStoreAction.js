import { Map, List } from 'immutable';
import { batchActions } from 'redux-batched-actions';

import GlobalReducer from '../reducers/GlobalReducer';
import BalanceReducer from '../reducers/BalanceReducer';
import BlockchainReducer from '../reducers/BlockchainReducer';

import { initAssetsBalances, updateTokens } from './BalanceActions';

import echoService from '../services/echo';

import {
	CONNECT_STATUS,
	NETWORKS,
} from '../constants/GlobalConstants';
import ChainStoreCacheNames from '../constants/ChainStoreConstants';
import { CONNECTION_ERROR_PATH } from '../constants/RouterConstants';

import storage from '../services/storage';
import history from '../history';

import FormatHelper from '../helpers/FormatHelper';
import { updateHistory } from './HistoryActions';

/**
 * copy object from ChainStore lib to redux every time when triggered, check connection
 * @returns {Function}
 */
export const subscribe = () => (dispatch) => {
	ChainStoreCacheNames.forEach((field) => {
		const value = echoService.getChainLib().cache[field];

		dispatch(BlockchainReducer.actions.set({ field, value }));
	});

	dispatch(initAssetsBalances());
	dispatch(updateTokens());
	dispatch(updateHistory());
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

		if (echoService.getChainLib()._ws._connected) { // eslint-disable-line no-underscore-dangle
			dispatch(GlobalReducer.actions.set({ field: 'connected', value: true }));
		}
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
export const disconnect = () => async (dispatch) => {
	try {
		await echoService.getChainLib().disconnect();

		dispatch(batchActions([
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

export const onStatusConnected = (status) => (dispatch, getState) => {
	const currentPath = getState().router.location.pathname;
	const isConnected = status === CONNECT_STATUS;

	dispatch(GlobalReducer.actions.set({ field: 'connected', value: isConnected }));

	if (currentPath === CONNECTION_ERROR_PATH && isConnected) {
		history.goBack();
	}
};
