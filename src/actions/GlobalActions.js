import { EchoJSActions } from 'echojs-redux';
import { Map, List } from 'immutable';

import history from '../history';

import { getPreviewBalances, initBalances } from './BalanceActions';
import { setFormError, clearForm } from './FormActions';

import ValidateNetworkHelper from '../helpers/ValidateNetworkHelper';

import GlobalReducer from '../reducers/GlobalReducer';

import { INDEX_PATH, WIF_PATH } from '../constants/RouterConstants';
import { NETWORKS } from '../constants/GlobalConstants';
import { FORM_ADD_NETWORK } from '../constants/FormConstants';

export const initAccount = (accountName, networkName) => async (dispatch) => {
	dispatch(GlobalReducer.actions.setGlobalLoading({ globalLoading: true }));

	try {
		let accounts = localStorage.getItem(`accounts_${networkName}`);

		accounts = accounts ? JSON.parse(accounts) : [];
		accounts = accounts.map((i) => {
			i.active = i.name === accountName;
			return i;
		});

		localStorage.setItem(`accounts_${networkName}`, JSON.stringify(accounts));

		const { id, name } = (await dispatch(EchoJSActions.fetch(accountName))).toJS();

		// EchoJSActions.setSubscribe({ types: ['objects', 'block', 'accounts'], method: getObject });

		dispatch(GlobalReducer.actions.setIn({ field: 'activeUser', params: { id, name } }));

		if (INDEX_PATH.includes(history.location.pathname)) {
			history.push(WIF_PATH);
		}

		await dispatch(initBalances(networkName));
	} catch (err) {
		dispatch(GlobalReducer.actions.set({ field: 'error', value: err }));
	} finally {
		setTimeout(() => {
			dispatch(GlobalReducer.actions.setGlobalLoading({ globalLoading: false }));
		}, 1000);
	}
};

export const addAccount = (accountName, networkName) => (dispatch) => {
	let accounts = localStorage.getItem(`accounts_${networkName}`);
	accounts = accounts ? JSON.parse(accounts) : [];
	accounts.push({ name: accountName, active: false });

	localStorage.setItem(`accounts_${networkName}`, JSON.stringify(accounts));

	dispatch(initAccount(accountName, networkName));
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

export const disconnection = (address) => async (dispatch, getState) => {
	const isConnected = getState().echojs.getIn(['system', 'isConnected']);

	if (isConnected) {
		await dispatch(EchoJSActions.disconnect(address));
	}

	// dispatch(clearTable(HISTORY_TABLE));
	// dispatch(resetBalance());
	dispatch(GlobalReducer.actions.disconnect());
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
	} else {
		dispatch(getPreviewBalances(networkName));
	}
};

export const changeNetwork = (network) => async (dispatch, getState) => {
	dispatch(GlobalReducer.actions.setGlobalLoading({ globalLoading: true }));

	const oldNetwork = getState().global.get('network').toJS();

	await dispatch(disconnection(oldNetwork.url));

	localStorage.setItem('current_network', JSON.stringify(network));
	dispatch(connection());
};

export const addNetwork = () => (dispatch, getState) => {
	const networks = getState().global.get('networks').toJS();
	const {
		address, name, registrator,
	} = getState().form.get(FORM_ADD_NETWORK).toJS();

	const network = {
		url: address.value.trim(),
		name: name.value.trim(),
		registrator: registrator.value.trim(),
	};

	let nameError = ValidateNetworkHelper.validateNetworkName(network.name);

	if (NETWORKS.concat(networks).find((i) => i.name === network.name)) {
		nameError = `Network "${network.name}" already exists`;
	}

	if (nameError) {
		dispatch(setFormError(FORM_ADD_NETWORK, 'name', nameError));
	}

	const addressError = ValidateNetworkHelper.validateNetworkAddress(network.url);

	if (addressError) {
		dispatch(setFormError(FORM_ADD_NETWORK, 'address', addressError));
	}

	const registratorError = ValidateNetworkHelper.validateNetworkRegistrator(network.registrator);

	if (registratorError) {
		dispatch(setFormError(FORM_ADD_NETWORK, 'registrator', registratorError));
	}

	if (nameError || addressError || registratorError) { return; }

	let customNetworks = localStorage.getItem('custom_networks');
	customNetworks = customNetworks ? JSON.parse(customNetworks) : [];
	customNetworks.push(network);

	localStorage.setItem('custom_networks', JSON.stringify(customNetworks));

	networks.push(network);

	dispatch(GlobalReducer.actions.set({
		field: 'networks',
		value: new List(networks),
	}));

	dispatch(clearForm(FORM_ADD_NETWORK));

	// history.push();
};

export const deleteNetwork = (network) => (dispatch, getState) => {
	let customNetworks = localStorage.getItem('custom_networks');
	customNetworks = customNetworks ? JSON.parse(customNetworks) : [];
	customNetworks = customNetworks.filter((i) => i.name !== network.name);

	localStorage.setItem('custom_networks', JSON.stringify(customNetworks));

	const currentNetwork = getState().global.get('network').toJS();
	if (currentNetwork.name === network.name) {
		localStorage.removeItem('current_network');
		dispatch(connection());
		// return;
	}

	let networks = getState().global.get('networks').toJS();
	networks = networks.filter((i) => i.name !== network.name);

	dispatch(GlobalReducer.actions.set({
		field: 'networks',
		value: new List(networks),
	}));
};
