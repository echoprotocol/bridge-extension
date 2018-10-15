import { EchoJSActions } from 'echojs-redux';
import { Map } from 'immutable';

import history from '../history';

import { getObject, getPreviewBalances, initBalances } from './BalanceActions';
import { initCrypto } from './CryptoActions';

import GlobalReducer from '../reducers/GlobalReducer';

import { IMPORT_ACCOUNT_PATH, WALLET_PATH } from '../constants/RouterConstants';


import { NETWORKS } from '../constants/GlobalConstants';

export const initAccount = (accountName, networkName) => async (dispatch) => {
	dispatch(GlobalReducer.actions.set({ field: 'loading', value: true }));

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

		EchoJSActions.setSubscribe({ types: ['objects', 'accounts'], method: getObject });

		const fetchedAccount = await dispatch(EchoJSActions.fetch(accountName));

		dispatch(GlobalReducer.actions.setIn({
			field: 'activeUser',
			params: { id: fetchedAccount.get('id'), name: fetchedAccount.get('name'), icon },
		}));

		await dispatch(initBalances(networkName, fetchedAccount.get('balances').toObject()));
	} catch (err) {
		dispatch(GlobalReducer.actions.set({ field: 'error', value: err }));
	} finally {
		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
	}
};

export const addAccount = (accountName, keys, networkName) => (dispatch) => {
	let accounts = localStorage.getItem(`accounts_${networkName}`);
	accounts = accounts ? JSON.parse(accounts) : [];
	accounts.push({
		name: accountName,
		active: false,
		icon: Math.floor(Math.random() * 15) + 1,
		keys,
	});

	localStorage.setItem(`accounts_${networkName}`, JSON.stringify(accounts));

	dispatch(initAccount(accountName, networkName));
};

export const connection = () => async (dispatch) => {
	dispatch(GlobalReducer.actions.set({ field: 'loading', value: true }));

	let network = localStorage.getItem('current_network');

	if (!network) {
		[network] = NETWORKS;
		localStorage.setItem('current_network', JSON.stringify(network));
	} else {
		network = JSON.parse(network);
	}

	dispatch(GlobalReducer.actions.set({ field: 'network', value: new Map(network) }));

	// TODO remove in BRG-21
	dispatch(initCrypto());

	try {
		await dispatch(EchoJSActions.connect(network.url));
		let accounts = localStorage.getItem(`accounts_${network.name}`);

		accounts = accounts ? JSON.parse(accounts) : [];

		if (!accounts.length) {
			history.push(IMPORT_ACCOUNT_PATH);
		} else {
			const active = accounts.find((i) => i.active) || accounts[0];
			await dispatch(initAccount(active.name, network.name));
			history.push(WALLET_PATH);
		}
	} catch (err) {
		dispatch(GlobalReducer.actions.set({ field: 'error', value: err.message }));
	} finally {
		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
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
		dispatch(GlobalReducer.actions.set({ field: 'loading', value: true }));

		dispatch(initAccount(accounts[0].name, networkName));
	} else if (!accounts.length) {
		dispatch(GlobalReducer.actions.logout());
		dispatch(getPreviewBalances(networkName));
	} else {
		dispatch(getPreviewBalances(networkName));
	}
};
