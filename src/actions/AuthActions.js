import { PrivateKey, ChainStore } from 'echojs-lib';

import ValidateAccountHelper from '../helpers/ValidateAccountHelper';
import FormatHelper from '../helpers/FormatHelper';

import { setValue } from './FormActions';
import { addAccount, isAccountAdded } from './GlobalActions';
import { crypto } from './CryptoActions';

import { FORM_SIGN_UP, FORM_SIGN_IN } from '../constants/FormConstants';
import { ACTIVE_KEY, MEMO_KEY } from '../constants/GlobalConstants';

import {
	validateAccountExist,
	createWallet,
	validateImportAccountExist,
} from '../api/WalletApi';
import { fetchChain } from '../api/ChainApi';

import GlobalReducer from '../reducers/GlobalReducer';

/**
 *  @method toggleLoading
 *
 * 	Toggle global and form loading
 *
 * 	@param {String} form
 * 	@param {Boolean} value
 */
const toggleLoading = (form, value) => (dispatch) => {
	dispatch(GlobalReducer.actions.set({ field: 'loading', value }));
	dispatch(setValue(form, 'loading', value));
};

/**
 *  @method createAccount
 *
 * 	Create account through account name
 *
 * 	@param {String} name
 *
 * 	@return {String} wif
 */
export const createAccount = (name) => async (dispatch, getState) => {
	let error = null;
	let example = '';

	dispatch(setValue(FORM_SIGN_UP, 'accountName', { error, example }));

	error = ValidateAccountHelper.validateAccountName(name);

	if (error) {
		dispatch(setValue(FORM_SIGN_UP, 'accountName', { error, example }));
		return null;
	}

	try {
		const registrator = getState().global.getIn(['network', 'registrator']);
		const networkName = getState().global.getIn(['network', 'name']);

		dispatch(toggleLoading(FORM_SIGN_UP, true));

		({ error, example } = await validateAccountExist(name));

		if (error) {
			dispatch(setValue(FORM_SIGN_UP, 'accountName', { error, example }));
			return null;
		}
		const wif = crypto.generateWIF();

		await createWallet(registrator, name, wif);

		await crypto.importByWIF(networkName, wif);

		const key = PrivateKey.fromWif(wif).toPublicKey().toString();
		await dispatch(addAccount(name, [key, key], networkName));

		return wif;

	} catch (err) {
		dispatch(setValue(FORM_SIGN_UP, 'error', FormatHelper.formatError(err)));

		return null;
	} finally {
		dispatch(toggleLoading(FORM_SIGN_UP, false));
	}

};

/**
 *  @method importByPassword
 *
 * 	Import account from desktop app params (name and password)
 *
 *  @param {String} networkName
 * 	@param {String} name
 * 	@param {String} password
 *
 * 	@return {Boolean} success
 */
const importByPassword = (networkName, name, password) => async (dispatch) => {

	const nameError = ValidateAccountHelper.validateAccountName(name);
	const addedError = dispatch(isAccountAdded(name)) ? 'Account already added' : null;
	const existError = await validateImportAccountExist(name, true);

	if (nameError || addedError || existError) {
		const error = nameError || addedError || existError;

		dispatch(setValue(FORM_SIGN_IN, 'nameError', error));
		return false;
	}

	const account = await fetchChain(name);

	const active = crypto.getPublicKey(name, password);

	if (account.getIn(['active', 'key_auths', '0', '0']) !== active) {
		dispatch(setValue(FORM_SIGN_IN, 'passwordError', 'Invalid password'));
		return false;
	}

	await crypto.importByPassword(
		networkName,
		name,
		password,
		account.getIn(['options', 'memo_key']),
	);

	return true;
};

/**
 *  @method importAccount
 *
 * 	Import account from desktop app or sign in
 *
 * 	@param {String} name
 * 	@param {String} password
 *
 * 	@return {String} name
 */
export const importAccount = (name, password) => async (dispatch, getState) => {
	const networkName = getState().global.getIn(['network', 'name']);

	const passwordError = ValidateAccountHelper.validatePassword(password);

	if (passwordError) {
		dispatch(setValue(FORM_SIGN_IN, 'passwordError', passwordError));
		return false;
	}

	try {
		dispatch(toggleLoading(FORM_SIGN_IN, true));

		let success = true;
		let keys = [];
		if (crypto.isWIF(password)) {
			const active = PrivateKey.fromWif(password).toPublicKey().toString();

			const [accountId] = await ChainStore.FetchChain('getAccountRefsOfKey', active);

			if (!accountId) {
				dispatch(setValue(FORM_SIGN_IN, 'passwordError', 'Invalid WIF'));
				return false;
			}

			const account = await fetchChain(accountId);

			if (dispatch(isAccountAdded(account.get('name')))) {
				dispatch(setValue(FORM_SIGN_IN, 'passwordError', 'Account already added'));
				return false;
			}

			await crypto.importByWIF(networkName, password);

			name = account.get('name');
			const memo = account.getIn(['options', 'memo_key']);
			keys = [active, active === memo ? memo : null];
		} else {
			success = await dispatch(importByPassword(networkName, name, password));

			keys = [
				crypto.getPublicKey(name, password, ACTIVE_KEY),
				crypto.getPublicKey(name, password, MEMO_KEY),
			];
		}

		if (success) {
			await dispatch(addAccount(name, keys, networkName));
		}

		return success ? name : null;
	} catch (err) {
		dispatch(setValue(FORM_SIGN_IN,	'error', FormatHelper.formatError(err)));

		return false;
	} finally {
		dispatch(toggleLoading(FORM_SIGN_IN, false));
	}
};
