import { EchoJSActions } from 'echojs-redux';
import { Map, List } from 'immutable';

import { initBalances } from './BalanceActions';
import { initCrypto, setCryptoInfo, getCryptoInfo } from './CryptoActions';

import GlobalReducer from '../reducers/GlobalReducer';

import { NETWORKS } from '../constants/GlobalConstants';

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
		const account = await dispatch(EchoJSActions.fetch(name));

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
		await dispatch(EchoJSActions.connect(network.url));

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
