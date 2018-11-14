import { Map, List } from 'immutable';
import { batchActions } from 'redux-batched-actions';

import { initCrypto, setCryptoInfo, getCryptoInfo, removeCryptoInfo } from './CryptoActions';

import history from '../history';

import { setFormError, toggleLoading } from './FormActions';
import { disconnect, connect } from './ChainStoreAction';
import { initAssetsBalances, removeBalances } from './BalanceActions';
import { loadRequests } from './SignActions';

import ValidateNetworkHelper from '../helpers/ValidateNetworkHelper';
import FormatHelper from '../helpers/FormatHelper';

import GlobalReducer from '../reducers/GlobalReducer';

import {
	ACCOUNT_COLORS,
	BASE_ICON,
	BASE_ICON_COLOR,
	ICON_COLORS_COUNT,
	ICONS_COUNT,
	NETWORKS,
} from '../constants/GlobalConstants';
import {
	CREATE_ACCOUNT_PATH,
	SUCCESS_ADD_NETWORK_PATH,
	INDEX_PATH, WALLET_PATH,
} from '../constants/RouterConstants';
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
const set = (field, value) => (dispatch) => dispatch(GlobalReducer.actions.set({ field, value }));


/**
 *  @method sidebarToggle
 *
 * 	Toggle sidebar visibility
 *
 * 	@param {Boolean} value
 */
export const sidebarToggle = (value) => (dispatch) => {
	dispatch(GlobalReducer.actions.sidebarToggle({ value }));
};

/**
 *  @method initAccount
 *
 * 	Initialize account
 *
 * 	@param {String} name
 * 	@param {Number} icon
 * 	@param {String} iconColor
 */
export const initAccount = ({ name, icon, iconColor }) => async (dispatch) => {
	dispatch(set('loading', true));

	try {
		const account = await fetchChain(name);

		dispatch(set('account', new Map({
			id: account.get('id'), name, icon, iconColor,
		})));

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
	const networkName = getState().global.getIn(['network', 'name']);
	const accounts = getState().global.get('accounts').get(networkName);

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
export const addAccount = (name, keys, networkName) => async (dispatch, getState) => {
	try {
		const account = await fetchChain(name);

		let accounts = getState().global.get('accounts');
		accounts =
			accounts.set(networkName, accounts.get(networkName).map((i) => ({ ...i, active: false })));

		let icon = BASE_ICON;
		let iconColor = BASE_ICON_COLOR;

		if (accounts.get(networkName).size) {
			icon = Math.floor(Math.random() * ICONS_COUNT) + 1;
			iconColor = ACCOUNT_COLORS[Math.floor(Math.random() * ICON_COLORS_COUNT)];
		}

		accounts = accounts.set(networkName, accounts.get(networkName).push({
			id: account.get('id'), active: true, icon, iconColor, name, keys,
		}));

		await dispatch(setCryptoInfo('accounts', accounts.get(networkName)));
		dispatch(set('accounts', accounts));

		dispatch(initAccount({ name, icon, iconColor }));
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
		const networkName = getState().global.getIn(['network', 'name']);
		let accounts = getState().global.get('accounts');

		const { keys, id } = accounts.get(networkName).find((i) => i.name === name);

		dispatch(removeBalances(id));

		await Promise.all(keys.map((key) => dispatch(removeCryptoInfo(key))));

		accounts = accounts.set(networkName, accounts.get(networkName).filter((i) => i.name !== name));
		await dispatch(setCryptoInfo('accounts', accounts.get(networkName)));
		dispatch(set('accounts', accounts));
		if (accountName !== name) {
			return false;
		}

		if (!accounts.get(networkName).size) {
			dispatch(GlobalReducer.actions.logout());
			history.push(CREATE_ACCOUNT_PATH);
			return false;
		}

		accounts = accounts.set(
			networkName,
			accounts.get(networkName).set(0, { ...accounts.getIn([networkName, 0]), active: true }),
		);

		await dispatch(setCryptoInfo('accounts', accounts.get(networkName)));
		dispatch(set('accounts', accounts));

		dispatch(initAccount(accounts.getIn([networkName, 0])));
	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));
	}

	return true;
};

/**
 *  @method switchAccount
 *
 * 	Switch account
 *
 * 	@param {String} name
 */
export const switchAccount = (name) => async (dispatch, getState) => {
	const networkName = getState().global.getIn(['network', 'name']);
	let accounts = getState().global.get('accounts');
	accounts = accounts.set(
		networkName,
		accounts.get(networkName).map((i) => ({ ...i, active: i.name === name })),
	);

	try {
		await dispatch(setCryptoInfo('accounts', accounts.get(networkName)));
		dispatch(set('accounts', accounts));

		dispatch(initAccount(accounts.get(networkName).find((i) => i.active)));

		history.push(WALLET_PATH);
	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));
	}
};

/**
 *  @method loadInfo
 *
 * 	Load info from storage after unlock crypto
 */
export const loadInfo = () => async (dispatch, getState) => {
	const networks = getState().global.get('networks');
	let accountsNetworks = new Map();

	const accountsPromises = networks.concat(NETWORKS).map(async (network) => {
		const accounts = await dispatch(getCryptoInfo('accounts', network.name));
		return [network.name, accounts];
	});

	const resultAccounts = await Promise.all(accountsPromises);

	resultAccounts.forEach(([networkName, accounts]) => {
		accountsNetworks = accountsNetworks.set(networkName, new List(accounts));
	});

	dispatch(set('accounts', accountsNetworks));


	const accounts = await dispatch(getCryptoInfo('accounts'));

	if (accounts && accounts.length) {
		await dispatch(initAccount(accounts.find((account) => account.active)));
		const path = getState().global.getIn(['crypto', 'goTo']) || INDEX_PATH;
		history.push(path);
	} else {
		history.push(CREATE_ACCOUNT_PATH);
	}

	dispatch(loadRequests());
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
		await dispatch(loadInfo());
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
		await storage.set('custom_networks', networks.toJSON());
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
		await storage.set('custom_networks', networks.toJSON());

		const currentNetworkName = getState().global.getIn(['network', 'name']);

		await storage.remove(network.name);

		if (currentNetworkName === network.name) {
			await storage.remove('current_network');
			await dispatch(connect());
			await dispatch(loadInfo());
		}

		dispatch(set('networks', networks));

		history.push(INDEX_PATH);
	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));
	}
};

/**
 *  @method switchAccountNetwork
 *
 * 	Switch account on another network
 *
 *  @param {String} accountName
 *  @param {Object} network
 */
export const switchAccountNetwork = (accountName, network) => async (dispatch) => {
	await dispatch(changeNetwork(network));

	await dispatch(switchAccount(accountName));

	return true;
};

/**
 *  @method globalInit
 *
 *  Initialize crypto and connect to blockchain
 */
export const globalInit = () => async (dispatch) => {
	await dispatch(connect());
	await dispatch(initCrypto());
};

/**
 *  @method changeAccountIcon
 *
 * 	Change account icon and it's color
 *
 *  @param {Number} icon
 *  @param {String} iconColor
 */
export const changeAccountIcon = (icon, iconColor) => async (dispatch, getState) => {
	const networkName = getState().global.getIn(['network', 'name']);
	let account = getState().global.get('account');
	let accounts = getState().global.get('accounts');

	accounts = accounts.set(
		networkName,
		accounts.get(networkName).map((i) => {
			if (i.name === account.get('name')) {
				return { ...i, icon, iconColor };
			}
			return i;
		}),
	);

	account = account.set('icon', icon).set('iconColor', iconColor);

	try {
		dispatch(setCryptoInfo('accounts', accounts.get(networkName)));

		dispatch(batchActions([
			GlobalReducer.actions.set({ field: 'accounts', value: accounts }),
			GlobalReducer.actions.set({ field: 'account', value: account }),
		]));

		history.push(INDEX_PATH);
	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));
	}
};
