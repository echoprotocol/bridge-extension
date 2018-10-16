import { Map, List } from 'immutable';
import { ChainStore } from 'echojs-lib';
import { batchActions } from 'redux-batched-actions';

import history from '../history';

import GlobalReducer from '../reducers/GlobalReducer';
import BlockchainReducer from '../reducers/BlockchainReducer';
import BalanceReducer from '../reducers/BalanceReducer';

import { initAccount } from './GlobalActions';
import { initCrypto, getCryptoInfo } from './CryptoActions';

import { fetchChain, connectToAddress, disconnectFromAddress } from '../api/ChainApi';

import { NETWORKS } from '../constants/GlobalConstants';
import { CREATE_ACCOUNT_PATH } from '../constants/RouterConstants';
import { ChainStoreCacheNames } from '../constants/ChainStoreConstants';

import storage from '../services/storage';

/**
 * copy object from ChainStore lib to redux every time when triggered
 * @returns {Function}
 */
export const subscribe = () => (dispatch) => {
	ChainStoreCacheNames.forEach(({ origin, custom: field }) => {
		const value = ChainStore[origin];
		dispatch(BlockchainReducer.actions.set({ field, value }));
	});
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

		// TODO remove in BRG-21
		dispatch(initCrypto());

		const networks = await storage.get('custom_networks');

		if (networks) {
			dispatch(GlobalReducer.actions.set({ field: 'networks', value: new List(networks) }));
		}

		const subscribeCb = () => dispatch(subscribe());

		await connectToAddress(network.url, subscribeCb);

		dispatch(GlobalReducer.actions.set({ field: 'connected', value: true }));

		await fetchChain('2.1.0');

		const accounts = await dispatch(getCryptoInfo('accounts'));

		if (accounts) {
			dispatch(GlobalReducer.actions.set({
				field: 'accounts',
				value: new List(accounts),
			}));

			await dispatch(initAccount(accounts.find((i) => i.active)));
		} else {
			history.push(CREATE_ACCOUNT_PATH);
		}

	} catch (err) {
		dispatch(batchActions([
			GlobalReducer.actions.set({
				field: 'error',
				value: err instanceof Error ? err.message : err,
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
		await disconnectFromAddress(address);
		dispatch(batchActions([
			BlockchainReducer.actions.disconnect(),
			GlobalReducer.actions.disconnect(),
			BalanceReducer.actions.reset(),
			GlobalReducer.actions.set({ field: 'connected', value: false }),
		]));
	} catch (err) {
		dispatch(GlobalReducer.actions.set({
			field: 'error',
			value: err instanceof Error ? err.message : err,
		}));
	}
};
