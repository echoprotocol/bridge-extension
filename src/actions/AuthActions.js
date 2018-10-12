import { EchoJSActions } from 'echojs-redux';

import ValidateAccountHelper from '../helpers/ValidateAccountHelper';

import { setValue } from './FormActions';
import { addAccount, isAccountAdded, userCrypto } from './GlobalActions';

import { FORM_SIGN_UP, FORM_SIGN_IN } from '../constants/FormConstants';

import {
	validateAccountExist,
	createWallet,
	importWallet,
	validateImportAccountExist,
} from '../api/WalletApi';

import GlobalReducer from '../reducers/GlobalReducer';

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
		const instance = getState().echojs.getIn(['system', 'instance']);
		const registrator = getState().global.getIn(['network', 'registrator']);
		const networkName = getState().global.getIn(['network', 'name']);

		dispatch(GlobalReducer.actions.set({ field: 'loading', value: true }));

		({ error, example } = await validateAccountExist(instance, name));

		if (error) {
			dispatch(setValue(FORM_SIGN_UP, 'accountName', { error, example }));
			return null;
		}

		// if (userCrypto.isLocked()) {
		// 	dispatch(GlobalReducer.actions.set({ field: 'cryptoError', value: 'Account locked' }));
		// 	return null;
		// }

		const wif = await createWallet(registrator, name);

		// userCrypto.importByWIF(wif);

		dispatch(addAccount(name, networkName));

		return wif;

	} catch (err) {
		dispatch(setValue(FORM_SIGN_UP, 'error', err));

		return null;

	} finally {
		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
	}

};

/**
 *  @method importAccount
 *
 * 	Import account from desktop app or sign in
 *
 * 	@param {String} name
 * 	@param {String} password
 *
 * 	@return {Boolean} success
 */
export const importAccount = (name, password) => async (dispatch, getState) => {
	let nameError = ValidateAccountHelper.validateAccountName(name);
	let passwordError = ValidateAccountHelper.validatePassword(password);

	if (nameError) {
		dispatch(setValue(FORM_SIGN_IN, 'nameError', nameError));
		return false;
	}

	if (passwordError) {
		dispatch(setValue(FORM_SIGN_IN, 'passwordError', passwordError));
		return false;
	}

	try {
		const instance = getState().echojs.getIn(['system', 'instance']);
		const networkName = getState().global.getIn(['network', 'name']);

		dispatch(GlobalReducer.actions.set({ field: 'loading', value: true }));

		nameError = await validateImportAccountExist(instance, name, true);

		if (!nameError) {
			nameError = isAccountAdded(name, networkName);
		}

		if (nameError) {
			dispatch(setValue(FORM_SIGN_IN, 'nameError', nameError));
			return false;
		}

		// if (userCrypto.isLocked()) {
		// 	dispatch(GlobalReducer.actions.set({ field: 'cryptoError', value: 'Account locked' }));
		// 	return false;
		// }

		if (userCrypto.isWIF(password)) {
			passwordError = importWallet(password);
		} else {
			const account = await dispatch(EchoJSActions.fetch(name));

			passwordError = importWallet(password, account);
		}

		if (passwordError) {
			dispatch(setValue(FORM_SIGN_IN, 'passwordError', passwordError));
			return false;
		}

		// if (userCrypto.isWIF(password)) {
		// 	userCrypto.importByWIF(password);
		// }
		// userCrypto.importByPassword(name, password);

		dispatch(addAccount(name, networkName));

		return true;
	} catch (err) {
		dispatch(setValue(FORM_SIGN_IN, 'error', err.message));

		return false;
	} finally {
		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
	}
};
