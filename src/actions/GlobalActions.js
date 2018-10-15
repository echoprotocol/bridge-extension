import history from '../history';

import { getPreviewBalances, initBalances } from './BalanceActions';

import { SUCCESS_ADD_NETWORK_PATH } from '../constants/RouterConstants';


import { setFormError, toggleLoading } from './FormActions';
import { disconnect, connect } from './ChainStoreAction';

import ValidateNetworkHelper from '../helpers/ValidateNetworkHelper';

import GlobalReducer from '../reducers/GlobalReducer';

import { NETWORKS } from '../constants/GlobalConstants';
import { FORM_ADD_NETWORK } from '../constants/FormConstants';

import { fetchChain } from '../api/ChainApi';

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

		const fetchedAccount = await fetchChain(accountName);

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

/**
 * connect to new network and disconnect from old network
 * @param {Object} network
 * @returns {Function}
 */
export const changeNetwork = (network) => async (dispatch, getState) => {
	dispatch(GlobalReducer.actions.set({ field: 'loading', value: true }));

	try {
		const oldNetworkUrl = getState().global.getIn(['network', 'url']);

		await dispatch(disconnect(oldNetworkUrl));

		localStorage.setItem('current_network', JSON.stringify(network));
		dispatch(connect());
	} catch (e) {
		return;
	} finally {
		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
	}

};

/**
 * add new network to storage and connect to it
 * @returns {Function}
 */
export const addNetwork = () => async (dispatch, getState) => {
	try {
		dispatch(toggleLoading(FORM_ADD_NETWORK, true));

		const networks = getState().global.get('networks');

		const form = getState().form.get(FORM_ADD_NETWORK);

		const address = form.get('address');
		const name = form.get('name');
		const registrator = form.get('registrator');

		const network = {
			url: address.value.trim(),
			name: name.value.trim(),
			registrator: registrator.value.trim(),
		};

		let nameError = ValidateNetworkHelper.validateNetworkName(network.name);

		if (NETWORKS.concat(networks.toJS()).find((i) => i.name === network.name)) {
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

		if (nameError || addressError || registratorError) { return null; }

		let customNetworks = localStorage.getItem('custom_networks');
		customNetworks = customNetworks ? JSON.parse(customNetworks) : [];
		customNetworks.push(network);

		localStorage.setItem('custom_networks', JSON.stringify(customNetworks));

		dispatch(GlobalReducer.actions.set({
			field: 'networks',
			value: networks.push(network),
		}));

		await dispatch(changeNetwork(network));
		history.push(SUCCESS_ADD_NETWORK_PATH);
	} catch (e) {
		return null;
	} finally {
		dispatch(toggleLoading(FORM_ADD_NETWORK, 'loading', false));
	}
	return null;
};

/**
 * delete custom network from storage
 * @param {Object} network
 * @returns {Function}
 */
export const deleteNetwork = (network) => (dispatch, getState) => {
	let customNetworks = localStorage.getItem('custom_networks');
	customNetworks = customNetworks ? JSON.parse(customNetworks) : [];
	customNetworks = customNetworks.filter((i) => i.name !== network.name);

	localStorage.setItem('custom_networks', JSON.stringify(customNetworks));

	const currentNetworkName = getState().global.getIn(['network', 'name']);

	localStorage.removeItem(`accounts_${network.name}`);

	if (currentNetworkName === network.name) {
		localStorage.removeItem('current_network');
		dispatch(connect());
	}

	const networks = getState().global.get('networks').filter((i) => i.name !== network.name);

	dispatch(GlobalReducer.actions.set({
		field: 'networks',
		value: networks,
	}));
};
