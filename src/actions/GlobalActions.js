import { Map } from 'immutable';

import { setCryptoInfo, removeCryptoInfo } from './CryptoActions';

import history from '../history';

import { setFormError, toggleLoading } from './FormActions';
import { disconnect, connect } from './ChainStoreAction';
import { initAssetsBalances, removeBalances } from './BalanceActions';

import ValidateNetworkHelper from '../helpers/ValidateNetworkHelper';
import FormatHelper from '../helpers/FormatHelper';

import GlobalReducer from '../reducers/GlobalReducer';

import { NETWORKS } from '../constants/GlobalConstants';
import { FORM_ADD_NETWORK } from '../constants/FormConstants';
import { SUCCESS_ADD_NETWORK_PATH, CREATE_ACCOUNT_PATH } from '../constants/RouterConstants';

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

		await dispatch(initAssetsBalances());
	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));
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
	const accounts = getState().global.get('accounts');

	return !!(accounts && accounts.find((i) => i.name === name));
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
	try {
		const account = await fetchChain(name);

		let accounts = getState().global.get('accounts');
		accounts = accounts.map((i) => ({ ...i, active: false }));
		const icon = Math.floor(Math.random() * 15) + 1;
		accounts = accounts.push({
			id: account.get('id'), active: true, icon, name, keys,
		});

		await dispatch(setCryptoInfo('accounts', accounts));
		dispatch(set('accounts', accounts));

		dispatch(initAccount({ name, icon }));
	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));
	}
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

	try {
		let accounts = getState().global.get('accounts');

		const { keys, id } = accounts.find((i) => i.name === name);

		dispatch(removeBalances(id));

		await Promise.all(keys.map((key) => dispatch(removeCryptoInfo(key))));

		accounts = accounts.filter((i) => i.name !== name);
		await dispatch(setCryptoInfo('accounts', accounts));
		dispatch(set('accounts', accounts));
		if (accountName !== name) { return; }

		if (!accounts.size) {
			dispatch(GlobalReducer.actions.logout());
			history.push(CREATE_ACCOUNT_PATH);
			return;
		}

		accounts = accounts.set(0, { ...accounts.get(0), active: true });

		await dispatch(setCryptoInfo('accounts', accounts));
		dispatch(set('accounts', accounts));

		dispatch(initAccount(accounts.get(0)));
	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));
	}

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

	try {
		await dispatch(setCryptoInfo('accounts', accounts));
		dispatch(set('accounts', accounts));

		dispatch(initAccount(accounts.find((i) => i.active)));
	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));
	}
};

/**
 *  @method changeNetwork
 *
 * 	Connect to new network and disconnect from old network
 *
 * 	@param {Object} network
 */
export const changeNetwork = (network) => async (dispatch, getState) => {
	try {
		const oldNetworkUrl = getState().global.getIn(['network', 'url']);

		await dispatch(disconnect(oldNetworkUrl));

		await storage.set('current_network', network);
		await dispatch(connect());
	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));
	}
};

/**
 *  @method addNetwork
 *
 * 	Add new network to storage and connect to it
 */
export const addNetwork = () => async (dispatch, getState) => {
	try {
		dispatch(toggleLoading(FORM_ADD_NETWORK, true));

		let networks = getState().global.get('networks');

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

		if (networks.concat(NETWORKS).find((i) => i.name === network.name)) {
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

		networks = networks.push(network);
		await storage.set('custom_networks', networks);
		dispatch(set('networks', networks));

		await dispatch(changeNetwork(network));
		history.push(SUCCESS_ADD_NETWORK_PATH);
	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));
		return null;
	} finally {
		dispatch(toggleLoading(FORM_ADD_NETWORK, 'loading', false));
	}
	return null;
};

/**
 *  @method deleteNetwork
 *
 * 	Delete custom network from storage
 *
 *  @param {Object} network
 */
export const deleteNetwork = (network) => async (dispatch, getState) => {
	let networks = getState().global.get('networks');
	networks = networks.filter((i) => i.name !== network.name);

	try {
		await storage.set('custom_networks', networks);

		const currentNetworkName = getState().global.getIn(['network', 'name']);

		await storage.remove(network.name);

		if (currentNetworkName === network.name) {
			await storage.remove('current_network');
			dispatch(connect());
		}

		dispatch(set('networks', networks));
	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));
	}
};
