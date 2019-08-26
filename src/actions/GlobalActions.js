import { Map, List } from 'immutable';
import { batchActions } from 'redux-batched-actions';

import { initCrypto, setCryptoInfo, getCryptoInfo, removeCryptoInfo } from './CryptoActions';

import history from '../history';

import { setFormError, setValue, toggleLoading } from './FormActions';
import { disconnect, connect, checkActiveLoading } from './ChainStoreAction';
import { getTokenDetails, initAssetsBalances, removeBalances } from './BalanceActions';
import { globals, loadRequests } from './SignActions';

import ValidateNetworkHelper from '../helpers/ValidateNetworkHelper';
import FormatHelper from '../helpers/FormatHelper';

import GlobalReducer from '../reducers/GlobalReducer';

import echoService from '../services/echo';

import {
	ACCOUNT_COLORS,
	BASE_ICON,
	BASE_ICON_COLOR,
	DRAFT_STORAGE_KEY,
	ICON_COLORS_COUNT,
	ICONS_COUNT,
	NETWORKS,
	POPUP_WINDOW_TYPE,
} from '../constants/GlobalConstants';
import {
	CREATE_ACCOUNT_PATH,
	SUCCESS_ADD_NETWORK_PATH,
	INDEX_PATH,
	WALLET_PATH,
	EMPTY_PATH,
	SUCCESS_SEND_PATH,
	ERROR_SEND_PATH,
	NETWORK_ERROR_SEND_PATH,
} from '../constants/RouterConstants';
import { FORM_ADD_NETWORK, FORM_SIGN_UP } from '../constants/FormConstants';
import { SIGN_MEASSAGE_CANCELED } from '../constants/ErrorsConstants';

import storage from '../services/storage';
import BalanceReducer from '../reducers/BalanceReducer';
import Listeners from '../services/listeners';

/**
 *  @method set
 *
 * 	Set in GlobalReducer
 *
 * 	@param {String} field
 * 	@param {*} value
 */

export const set = (field, value) => (dispatch) =>
	dispatch(GlobalReducer.actions.set({ field, value }));


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
 *  @method setIn
 *
 * 	Set params in field from GlobalReducer
 *
 * 	@param {String} field
 * 	@param {Object} params
 */
export const setIn = (field, params) => (dispatch) => {
	dispatch(GlobalReducer.actions.setIn({ field, params }));
};

/**
 *  @method deleteIn
 *
 * 	Delete params in field from GlobalReducer
 *
 * 	@param {String} field
 * 	@param {Array} params
 */
export const deleteIn = (field, params) => (dispatch) => {
	dispatch(GlobalReducer.actions.deleteIn({ field, params }));
};


/**
 *  @method loadSignMessageRequests
 *
 * 	Load sign message requests
 *
 */
export const loadSignMessageRequests = () => (dispatch) => {
	const requests = new Map(echoService.getSignMessageRequests());

	if (!requests.size) {
		return;
	}

	dispatch(set('signMessageRequests', requests));
};
/**
 *  @method signMessageRequest
 *
 * 	Add new sign message request
 *
 */
export const addSignMessageRequest = (id, origin, signer, message) => (dispatch) => {
	dispatch(setIn('signMessageRequests', { [id]: { origin, signer, message } }));
};

/**
 *  @method removeSignMessageRequest
 *
 * 	Remove sign message request
 *
 */
export const removeSignMessageRequest = (id) => (dispatch) => {
	const requests = new Map(echoService.getSignMessageRequests());
	if (!requests.size) {
		history.push(INDEX_PATH);
	}
	dispatch(deleteIn('signMessageRequests', [id]));

};


/**
 *  @method loadProviderRequests
 *
 * 	Load provider requests
 *
 */
export const loadProviderRequests = () => (dispatch) => {
	const requests = new Map(echoService.getProviderRequests());
	if (!requests.size) {
		return;
	}

	dispatch(set('providerRequests', requests));
};

/**
 *  @method addProviderRequest
 *
 * 	Add new provider request
 *
 */
export const addProviderRequest = (id, origin) => (dispatch) => {
	dispatch(setIn('providerRequests', { [id]: origin }));
};


/**
 *  @method removeProviderRequest
 *
 * 	Remove provider request
 *
 */
export const removeProviderRequest = (id) => (dispatch) => {
	dispatch(deleteIn('providerRequests', [id]));
	const requests = new Map(echoService.getProviderRequests());

	if (!requests.size) {
		history.push(INDEX_PATH);
	}
};

/**
 *  @method chooseProviderAccess
 *
 * 	Choose provider access
 *
 * 	@param {String} id
 * 	@param {Boolean} status
 */
export const chooseProviderAccess = (id, status) => (dispatch) => {
	const emitter = echoService.getEmitter();

	try {
		const error = status ? null : { isAccess: false };
		emitter.emit('providerResponse', error, id, status);
	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));
	}
};

/**
 *  @method chooseSignMessageResponse
 *
 * 	Choose provider access
 *
 * 	@param {String} id
 * 	@param {Boolean} status
 */
export const chooseSignMessageResponse = (id, status, message, signer) => (dispatch) => {
	const emitter = echoService.getEmitter();

	try {
		const error = status ? null : SIGN_MEASSAGE_CANCELED;
		emitter.emit('signMessageResponse', error, id, status, message, signer);
	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));
	}
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
		const account = await echoService.getChainLib().api.getAccountByName(name);

		dispatch(set('account', new Map({
			id: account.id, name, icon, iconColor,
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
 *  @param {String} networkName
 *  @param {String?} path
 */
export const addAccount = (name, keys, networkName, path) => async (dispatch, getState) => {
	const emitter = echoService.getEmitter();
	storage.remove('account');

	try {

		const account = await echoService.getChainLib().api.getAccountByName(name);
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
			id: account.id, active: true, icon, iconColor, name, keys,
		}));

		await dispatch(setCryptoInfo('accounts', accounts.get(networkName), networkName));

		dispatch(set('accounts', accounts));
		await dispatch(initAccount({ name, icon, iconColor }));

		emitter.emit('activeAccountResponse', {
			id: account.id, active: true, icon, iconColor, name, keys,
		});

		if (path) {
			history.push(path);
		}

	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));
	}
};

/**
 *  @method addAccountError
 *
 * 	Add account
 *
 * 	@param {String} error
 */
export const addAccountError = (error) => (dispatch) => {
	dispatch(setValue(FORM_SIGN_UP, 'accountName', { error, example: '' }));
};


/**
 *  @method removeAccount
 *
 * 	Remove account
 *
 * 	@param {String} name
 */
export const removeAccount = (name) => {
	const emitter = echoService.getEmitter();

	emitter.emit('logout', name);
};

/**
 *  @method onLogout
 *
 * 	Logout into the all windows
 *
 * 	@param {String} name
 */
export const onLogout = (name) => async (dispatch, getState) => {

	const emitter = echoService.getEmitter();
	const accountName = getState().global.getIn(['account', 'name']);
	const networkName = getState().global.getIn(['network', 'name']);
	let accounts = getState().global.get('accounts');

	try {

		const { keys, id } = accounts.get(networkName).find((i) => i.name === name);

		dispatch(removeBalances(id));

		await Promise.all(keys.map((k) => dispatch(removeCryptoInfo(k, networkName))));

		accounts = accounts.set(networkName, accounts.get(networkName).filter((i) => i.name !== name));
		await dispatch(setCryptoInfo('accounts', accounts.get(networkName), networkName));
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

		await dispatch(setCryptoInfo('accounts', accounts.get(networkName), networkName));
		dispatch(set('accounts', accounts));

		await dispatch(initAccount(accounts.getIn([networkName, 0])));

		emitter.emit('activeAccountResponse', accounts.getIn([networkName, 0]));
		history.push(CREATE_ACCOUNT_PATH);
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
	const emitter = echoService.getEmitter();
	const networkName = getState().global.getIn(['network', 'name']);
	let accounts = getState().global.get('accounts');
	accounts = accounts.set(
		networkName,
		accounts.get(networkName).map((i) => ({ ...i, active: i.name === name })),
	);

	try {
		await dispatch(setCryptoInfo('accounts', accounts.get(networkName), networkName));
		dispatch(set('accounts', accounts));

		const account = accounts.get(networkName).find((i) => i.active);
		await dispatch(initAccount(account));

		emitter.emit('activeAccountResponse', account);

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

	try {
		const networks = getState().global.get('networks');
		const currentNetworkName = getState().global.getIn(['network', 'name']);
		let accountsNetworks = new Map();

		const resultPromises = networks.concat(NETWORKS).map(async (network) => {
			const accounts = await dispatch(getCryptoInfo('accounts', network.name));
			const tokens = await dispatch(getCryptoInfo('tokens', network.name));
			return [network.name, accounts, tokens];
		});

		const result = await Promise.all(resultPromises);

		let stateTokens = new Map({});
		result.forEach(([networkName, accounts, tokens]) => {
			accountsNetworks = accountsNetworks.set(networkName, new List(accounts));

			if (!tokens) {
				return null;
			}

			Object.entries(tokens).forEach(([accountId, tokensArray]) => {
				tokensArray.forEach((id) => {
					stateTokens = stateTokens.setIn([accountId, `1.9.${id}`], new Map({}));
				});
			});

			return null;
		});

		dispatch(set('accounts', accountsNetworks));

		const tokensDetails = [];

		stateTokens.mapEntries(([accountId, tokensArr]) => {
			const tokenPromises = [];
			tokensArr.mapKeys((contractId) => {
				tokenPromises.push(getTokenDetails(contractId, accountId));
			});
			tokensDetails.push(Promise.all(tokenPromises));
		});

		Promise.all(tokensDetails).then((resTokensDetails) => {
			if (resTokensDetails) {
				stateTokens.mapEntries(([accountId, tokensArr], i) => {
					tokensArr.mapEntries(([contractId], j) => {
						stateTokens = stateTokens
							.setIn([accountId, contractId, 'symbol'], resTokensDetails[i][j].symbol)
							.setIn([accountId, contractId, 'precision'], resTokensDetails[i][j].precision)
							.setIn([accountId, contractId, 'balance'], resTokensDetails[i][j].balance);
					});
				});
			}

			dispatch(BalanceReducer.actions.set({ field: 'tokens', value: stateTokens }));
		});


		const accounts = await dispatch(getCryptoInfo('accounts', currentNetworkName));

		if (accounts && accounts.length) {
			await dispatch(initAccount(accounts.find((account) => account.active)));

			let path = getState().global.getIn(['crypto', 'goTo']) || INDEX_PATH;

			if (globals.WINDOW_TYPE === POPUP_WINDOW_TYPE
				&& ![SUCCESS_SEND_PATH, ERROR_SEND_PATH, NETWORK_ERROR_SEND_PATH].includes(path)) {
				path = EMPTY_PATH;
			}

			history.push(path);
		} else {
			history.push(CREATE_ACCOUNT_PATH);
		}

		await dispatch(loadRequests());

		dispatch(loadProviderRequests());
		dispatch(loadSignMessageRequests());

	} catch (err) {
		console.warn('Global loading information error', err);
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
		if (echoService.getChainLib().isConnected) {
			await dispatch(disconnect());
		}

		const currentNetwork = getState().global.get('network');
		const emitter = echoService.getEmitter();
		await emitter.emit('switchNetwork', network || {
			name: currentNetwork.get('name'),
			url: currentNetwork.get('url'),
		});

		if (network) {
			await storage.set('current_network', network);
		}

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

		const network = {
			url: address.value.trim(),
			name: name.value.trim(),
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

		if (nameError || addressError) { return null; }

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
 *  @method setNetworkInfo
 *
 * 	Add new network to storage and connect to it
 *
 *  @param {Object} network
 */
export const setNetworkInfo = (network) => async (dispatch) => {
	dispatch(GlobalReducer.actions.set({
		field: 'networkInfo',
		value: network,

	}));
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
			if (echoService.getChainLib().isConnected) {
				await dispatch(disconnect());
			}

			await storage.remove('current_network');

			await dispatch(connect());

			const currentNetwork = getState().global.getIn(['network']);

			await echoService.getEmitter().emit('switchNetwork', {
				name: currentNetwork.get('name'),
				url: currentNetwork.get('url'),
			});
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
 *
 *  @param {Boolean} isRecreate - when trying to manual reconnect
 */
export const globalInit = () => async (dispatch) => {
	await dispatch(connect());
	dispatch(checkActiveLoading());
	await dispatch(initCrypto());
};

/**
 *  @method initListeners
 *
 *  Initialize emitter listeners
 */
export const initListeners = () => (dispatch) => {
	const listeners = new Listeners();
	listeners.initListeners(dispatch);
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
		dispatch(setCryptoInfo('accounts', accounts.get(networkName), networkName));

		dispatch(batchActions([
			GlobalReducer.actions.set({ field: 'accounts', value: accounts }),
			GlobalReducer.actions.set({ field: 'account', value: account }),
		]));

	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));
	}
};


/**
 *  @method isPublicKeyAdded
 *
 *  Check is Public Key was Added
 *
 *  @param {String} accountId
 *  @param {String} active
 */

export const isPublicKeyAdded = (accountId, active) => async (dispatch, getState) => {

	const networkName = getState().global.getIn(['network', 'name']);
	const accounts = getState().global.getIn(['accounts', networkName]);
	const account = getState().global.get('account');

	if (!account || (accounts.findIndex((i) => i.id === accountId) < 0)) {
		return false;
	}

	const publicKeys = accounts.find((item) => item.id === accountId).keys;

	return !!publicKeys.find((key) => key === active);
};


/**
 *  @method addKeyToAccount
 *
 *  Add public key to account
 *
 * 	@param {String} accountId
 *  @param {String} active
 */
export const addKeyToAccount = (accountId, active) => async (dispatch, getState) => {

	const networkName = getState().global.getIn(['network', 'name']);
	let accounts = getState().global.get('accounts');

	accounts = accounts.set(networkName, accounts.get(networkName).map((account) => {

		if (account.id === accountId && !account.keys.includes(active)) {
			account.keys.push(active);
		}

		return {
			...account,
			keys: [...account.keys],
		};

	}));

	await dispatch(setCryptoInfo('accounts', accounts.get(networkName).toJS(), networkName));
	dispatch(set('accounts', accounts));

};

export const storageSetDraft = async (form, field, value) => {
	let data = await storage.get(DRAFT_STORAGE_KEY);

	if (data) {
		data[form] = {
			...data[form],
			[field]: value,
		};
	} else {
		data = {
			[form]: {
				[field]: value,
			},
		};
	}

	if (Object.values(data[form]).find((v) => !!v && typeof v === 'string')) {
		await storage.set(DRAFT_STORAGE_KEY, data);

		return null;
	}

	await storage.remove(DRAFT_STORAGE_KEY);

	return null;
};

export const storageGetDraft = () => storage.get(DRAFT_STORAGE_KEY);

export const storageRemoveDraft = () => storage.remove(DRAFT_STORAGE_KEY);
