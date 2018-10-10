import { EchoJSActions } from 'echojs-redux';
import { Map } from 'immutable';

import history from '../history';

import { getPreviewBalances, initBalances } from './BalanceActions';

import GlobalReducer from '../reducers/GlobalReducer';
import WelcomeReducer from '../reducers/WelcomeReducer';

import { IMPORT_ACCOUNT_PATH, WIF_PATH, INDEX_PATH } from '../constants/RouterConstants';
import { NETWORKS } from '../constants/GlobalConstants';

import Crypto from '../services/crypto';

export const userCrypto = new Crypto();

export const initAccount = (accountName, networkName) => async (dispatch) => {
	dispatch(GlobalReducer.actions.setGlobalLoading({ globalLoading: true }));

	try {
		let accounts = localStorage.getItem(`accounts_${networkName}`);
		let icon = null;

		accounts = accounts ? JSON.parse(accounts) : [];
		accounts = accounts.map((i) => {
			i.active = false;
			if (i.name === accountName) {
				i.active = true;
				({ icon } = i);
			}
			return i;
		});

		localStorage.setItem(`accounts_${networkName}`, JSON.stringify(accounts));

		const fetchedAccount = await dispatch(EchoJSActions.fetch(accountName));

		dispatch(GlobalReducer.actions.setIn({
			field: 'activeUser',
			params: { id: fetchedAccount.get('id'), name: fetchedAccount.get('name'), icon },
		}));

		await dispatch(initBalances(networkName));
	} catch (err) {
		dispatch(GlobalReducer.actions.set({ field: 'error', value: err }));
	} finally {
		dispatch(GlobalReducer.actions.setGlobalLoading({ globalLoading: false }));
	}
};

export const addAccount = (accountName, networkName) => (dispatch) => {
	let accounts = localStorage.getItem(`accounts_${networkName}`);
	accounts = accounts ? JSON.parse(accounts) : [];
	accounts.push({ name: accountName, active: false, icon: Math.floor(Math.random() * 15) + 1 });

	localStorage.setItem(`accounts_${networkName}`, JSON.stringify(accounts));

	dispatch(initAccount(accountName, networkName));

	if (INDEX_PATH.includes(history.location.pathname)) {
		dispatch(WelcomeReducer.actions.set({ field: 'isCreate', value: true }));
	}
	// history.push(WIF_PATH);
};

export const connection = () => async (dispatch) => {
	dispatch(GlobalReducer.actions.setGlobalLoading({ globalLoading: true }));

	let network = localStorage.getItem('current_network');

	if (!network) {
		[network] = NETWORKS;
		localStorage.setItem('current_network', JSON.stringify(network));
	} else {
		network = JSON.parse(network);
	}

	dispatch(GlobalReducer.actions.set({ field: 'network', value: new Map(network) }));

	try {
		if (IMPORT_ACCOUNT_PATH !== history.location.pathname) {
			history.push(IMPORT_ACCOUNT_PATH);
		}
		await dispatch(EchoJSActions.connect(network.url));
		let accounts = localStorage.getItem(`accounts_${network.name}`);

		accounts = accounts ? JSON.parse(accounts) : [];

		const active = accounts.find((i) => i.active) || accounts[0];
		await dispatch(initAccount(active.name, network.name));
	} catch (err) {
		dispatch(GlobalReducer.actions.set({ field: 'error', value: err }));
	} finally {
		dispatch(GlobalReducer.actions.setGlobalLoading({ globalLoading: false }));
	}
};

export const isAccountAdded = (accountName, networkName) => {
	let accounts = localStorage.getItem(`accounts_${networkName}`);
	accounts = accounts ? JSON.parse(accounts) : [];

	if (accounts.find(({ name }) => name === accountName)) {
		return 'Account already added';
	}

	return null;
};

export const removeAccount = (accountName, networkName) => async (dispatch, getState) => {
	const activeAccountName = getState().global.getIn(['activeUser', 'name']);

	let accounts = localStorage.getItem(`accounts_${networkName}`);
	accounts = accounts ? JSON.parse(accounts) : [];

	accounts = accounts.filter(({ name }) => name !== accountName);
	localStorage.setItem(`accounts_${networkName}`, JSON.stringify(accounts));

	if (activeAccountName === accountName && accounts[0]) {
		dispatch(GlobalReducer.actions.setGlobalLoading({ globalLoading: true }));

		dispatch(initAccount(accounts[0].name, networkName));
	} else if (!accounts.length) {
		dispatch(GlobalReducer.actions.logout());
		dispatch(getPreviewBalances(networkName));
	} else {
		dispatch(getPreviewBalances(networkName));
	}
};
