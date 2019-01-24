import { Map, List } from 'immutable';
import { batchActions } from 'redux-batched-actions';

import GlobalReducer from '../reducers/GlobalReducer';
import BalanceReducer from '../reducers/BalanceReducer';
import BlockchainReducer from '../reducers/BlockchainReducer';

import { initAssetsBalances, updateTokens } from './BalanceActions';

import echoService from '../services/echo';

import { NETWORKS } from '../constants/GlobalConstants';
import ChainStoreCacheNames from '../constants/ChainStoreConstants';

import storage from '../services/storage';

import FormatHelper from '../helpers/FormatHelper';
import { updateHistory } from './HistoryActions';

/**
 * copy object from ChainStore lib to redux every time when triggered, check connection
 * @returns {Function}
 */
export const subscribe = () => (dispatch) => {
	ChainStoreCacheNames.forEach(({ custom: field }) => {
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

		await echoService.getChainLib().connect('ws://195.201.164.54:6311', {
			connectionTimeout: 10000,
			maxRetries: 20,
			pingTimeout: 10000,
			pingInterval: 10000,
			debug: false,
			apis: ['database', 'network_broadcast', 'history', 'registration', 'asset', 'login', 'network_node'],
		});

		echoService.getChainLib().subscriber.setGlobalSubscribe(() => dispatch(subscribe()));


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
