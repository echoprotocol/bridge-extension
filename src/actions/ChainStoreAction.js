import { Map, List } from 'immutable';
import { ChainStore } from 'echojs-lib';

import history from '../history';

import GlobalReducer from '../reducers/GlobalReducer';
import BlockchainReducer from '../reducers/BlockchainReducer';

import { initAccount } from './GlobalActions';

import { fetchChain, connectToAddress, disconnectFromAddress } from '../api/ChainApi';

import { NETWORKS } from '../constants/GlobalConstants';
import { ChainStoreCacheNames } from '../constants/ChainStoreConstants';
import { IMPORT_ACCOUNT_PATH } from '../constants/RouterConstants';

export const subscribe = () => (dispatch) => {
	ChainStoreCacheNames.forEach(({ origin, custom }) => {
		const value = ChainStore[origin];
		dispatch(BlockchainReducer.actions.set({ custom, value }));
	});
};

export const connect = () => async (dispatch) => {
	dispatch(GlobalReducer.actions.setGlobalLoading({ globalLoading: true }));

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

	const subscribeCb = () => dispatch(subscribe());
	try {
		await connectToAddress(network.url, subscribeCb);
		let accounts = localStorage.getItem(`accounts_${network.name}`);

		accounts = accounts ? JSON.parse(accounts) : [];
		const value = await fetchChain('2.1.0');

		if (!accounts.length) {
			// history.push(IMPORT_ACCOUNT_PATH);
			return;
		}

		const active = accounts.find((i) => i.active) || accounts[0];

		await dispatch(initAccount(active.name, network.name));
	} catch (err) {
		dispatch(GlobalReducer.actions.set({ field: 'error', value: err }));
	} finally {
		dispatch(GlobalReducer.actions.setGlobalLoading({ globalLoading: false }));
	}
};

export const disconnect = (address) => async (dispatch) => {

	await disconnectFromAddress(address);
	dispatch(BlockchainReducer.actions.disconnect());
	dispatch(GlobalReducer.actions.disconnect());
};

