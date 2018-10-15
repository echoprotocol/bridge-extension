import { Map, List } from 'immutable';

import { initBalances } from './BalanceActions';
import { initCrypto, setCryptoInfo, getCryptoInfo } from './CryptoActions';

import history from '../history';

import { setFormError, toggleLoading } from './FormActions';
import { disconnect, connect } from './ChainStoreAction';

import ValidateNetworkHelper from '../helpers/ValidateNetworkHelper';

import GlobalReducer from '../reducers/GlobalReducer';

import { SUCCESS_ADD_NETWORK_PATH } from '../constants/RouterConstants';
import { NETWORKS } from '../constants/GlobalConstants';
import { FORM_ADD_NETWORK } from '../constants/FormConstants';

import { fetchChain } from '../api/ChainApi';

import storage from '../services/storage';

/**
 *  @method set
 *
 * 	Set in GlobalReducer
 *
 * 	@param {String} field
 * 	@param {Any} value
 */
const set = (field, value) => (dispatch) => {
	dispatch(GlobalReducer.actions.set({ field, value }));
};

/**
 *  @method initAccount
 *
 * 	Initialize account
 *
 * 	@param {String} name
 * 	@param {String} icon
 */
export const initAccount = ({ name, icon }) => async (dispatch) => {
	dispatch(set('loading', true));

	try {
		const account = await fetchChain(name);

		dispatch(set('account', new Map({ id: account.get('id'), name, icon })));

		await dispatch(initBalances());
	} catch (err) {
		dispatch(set('error', err));
	} finally {
		dispatch(set('loading', false));
	}
};

/**
 *  @method isAccountAdded
 *
 * 	Check is account already added
 *
 * 	@param {String} name
 */
export const isAccountAdded = (name) => (dispatch, getState) => {
	const accounts = getState().global.getIn(['info', 'accounts']);

	if (accounts && accounts.find((i) => i.name === name)) {
		return 'Account already added';
	}

	return null;
};

/**
 *  @method addAccount
 *
 * 	Add account
 *
 * 	@param {String} name
 * 	@param {Array} keys
 */
export const addAccount = (name, keys) => async (dispatch, getState) => {
	let accounts = getState().global.get('accounts');
	accounts = accounts.map((i) => ({ ...i, active: false }));
	const icon = Math.floor(Math.random() * 15) + 1;
	accounts = accounts.push({
		active: true, icon, name, keys,
	});

	await dispatch(setCryptoInfo('accounts', accounts));
	dispatch(set('accounts', accounts));

	dispatch(initAccount({ name, icon }));
};

/**
 *  @method removeAccount
 *
 * 	Remove account
 *
 * 	@param {String} name
 */
export const removeAccount = (name) => async (dispatch, getState) => {
	const accountName = getState().global.getIn(['account', 'name']);

	let accounts = getState().global.get('accounts');
	accounts = accounts.filter((i) => i.name !== name);
	await dispatch(setCryptoInfo('accounts', accounts));
	dispatch(set('accounts', accounts));

	if (accountName !== name) { return; }

	if (!accounts.length) {
		dispatch(GlobalReducer.actions.logout());
		return;
	}

	accounts = accounts.set(0, { ...accounts.get(0), active: true });
	await dispatch(setCryptoInfo('accounts', accounts));
	dispatch(set('accounts', accounts));

	dispatch(initAccount(accounts.get(0)));
};

/**
 *  @method switchAccount
 *
 * 	Switch account
 *
 * 	@param {String} name
 */
export const switchAccount = (name) => async (dispatch, getState) => {
	let accounts = getState().global.get('accounts');
	accounts = accounts.map((i) => ({ ...i, active: i.name === name }));
	await dispatch(setCryptoInfo('accounts', accounts));
	dispatch(set('accounts', accounts));

	dispatch(initAccount(accounts.find((i) => i.active)));
};


/**
 *  @method connection
 *
 * 	Connect ws and load global data
 */
export const connection = () => async (dispatch) => {
	dispatch(set('loading', true));

	let network = await storage.get('current_network');

	if (!network) {
		[network] = NETWORKS;
		await storage.set('current_network', network);
	}

	dispatch(set('network', new Map(network)));

	// TODO remove in BRG-21
	dispatch(initCrypto());

	try {
		await dispatch(connect(network.url));

		const accounts = await dispatch(getCryptoInfo('accounts'));

		if (accounts) {
			dispatch(set('accounts', new List(accounts)));
			await dispatch(initAccount(accounts.find((i) => i.active)));
		}
	} catch (err) {
		dispatch(set('error', err.message));
	} finally {
		dispatch(set('loading', false));
	}
};

/**
 * connect to new network and disconnect from old network
 * @param {Object} network
 * @returns {Function}
 */
export const changeNetwork = (network) => async (dispatch, getState) => {
	try {
		const oldNetworkUrl = getState().global.getIn(['network', 'url']);

		await dispatch(disconnect(oldNetworkUrl));

		localStorage.setItem('current_network', JSON.stringify(network));
		await dispatch(connect());
	} catch (err) {
		GlobalReducer.actions.set({ field: 'error', value: err });
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
