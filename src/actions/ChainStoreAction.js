import { Map, List } from 'immutable';
import { ChainStore } from 'echojs-lib';
import { batchActions } from 'redux-batched-actions';

import history from '../history';

import GlobalReducer from '../reducers/GlobalReducer';
import BlockchainReducer from '../reducers/BlockchainReducer';
import BalanceReducer from '../reducers/BalanceReducer';

import { initAccount } from './GlobalActions';
import { initCrypto } from './CryptoActions';
import { initAssetsBalances } from './BalanceActions';

import { fetchChain, connectToAddress, disconnectFromAddress } from '../api/ChainApi';

import { NETWORKS } from '../constants/GlobalConstants';
import { CREATE_ACCOUNT_PATH, INDEX_PATH } from '../constants/RouterConstants';
import ChainStoreCacheNames from '../constants/ChainStoreConstants';

/**
 * copy object from ChainStore lib to redux every time when triggered
 * @returns {Function}
 */
export const subscribe = () => (dispatch, getState) => {
	ChainStoreCacheNames.forEach(({ origin, custom: field }) => {
		const value = ChainStore[origin];

		dispatch(BlockchainReducer.actions.set({ field, value }));
	});

	const activeUserName = getState().global.getIn(['activeUser', 'name']);

	if (activeUserName) {
		dispatch(initAssetsBalances(activeUserName));
	}
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

	let network = localStorage.getItem('current_network');

	if (!network) {
		[network] = NETWORKS;
		localStorage.setItem('current_network', JSON.stringify(network));
	} else {
		network = JSON.parse(network);
	}

	dispatch(GlobalReducer.actions.set({ field: 'network', value: new Map(network) }));

	let networks = localStorage.getItem('custom_networks');
	networks = networks ? JSON.parse(networks) : [];

	dispatch(GlobalReducer.actions.set({ field: 'networks', value: new List(networks) }));

	// TODO REMOVE BRG-21
	dispatch(initCrypto());

	const subscribeCb = () => dispatch(subscribe());
	try {
		await connectToAddress(network.url, subscribeCb);

		dispatch(GlobalReducer.actions.set({ field: 'connected', value: true }));

		await fetchChain('2.1.0');

		let accounts = localStorage.getItem(`accounts_${network.name}`);
		accounts = accounts ? JSON.parse(accounts) : [];

		if (!accounts.length) {
			history.push(CREATE_ACCOUNT_PATH);
		} else {
			const active = accounts.find((i) => i.active) || accounts[0];
			await dispatch(initAccount(active.name, network.name));
			history.push(INDEX_PATH);
		}
	} catch (err) {
		dispatch(batchActions([
			GlobalReducer.actions.set({ field: 'error', value: err }),
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
	await disconnectFromAddress(address);
	dispatch(batchActions([
		BlockchainReducer.actions.disconnect(),
		GlobalReducer.actions.disconnect(),
		BalanceReducer.actions.reset(),
		GlobalReducer.actions.set({ field: 'connected', value: false }),
	]));
};

