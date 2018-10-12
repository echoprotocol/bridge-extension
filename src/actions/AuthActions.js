import { EchoJSActions } from 'echojs-redux';

import ValidateAccountHelper from '../helpers/ValidateAccountHelper';

import { setFormError, setValue } from './FormActions';
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
 * Import account from desktop app or sign in
 * @param {accountName, password}
 * @returns {Function}
 */
export const importAccount = ({ accountName, password }) => async (dispatch, getState) => {
	let accountNameError = ValidateAccountHelper.validateAccountName(accountName);
	let passwordError = ValidateAccountHelper.validatePassword(password);

	if (accountNameError) {
		dispatch(setFormError(FORM_SIGN_IN, 'accountName', accountNameError));
		return false;
	}

	if (passwordError) {
		dispatch(setFormError(FORM_SIGN_IN, 'password', passwordError));
		return false;
	}

	try {
		const instance = getState().echojs.getIn(['system', 'instance']);
		const networkName = getState().global.getIn(['network', 'name']);

		dispatch(GlobalReducer.actions.set({ field: 'loading', value: true }));

		accountNameError = await validateImportAccountExist(instance, accountName, true);

		if (!accountNameError) {
			accountNameError = isAccountAdded(accountName, networkName);
		}

		if (accountNameError) {
			dispatch(setFormError(FORM_SIGN_IN, 'accountName', accountNameError));
			return false;
		}

		const account = await dispatch(EchoJSActions.fetch(accountName));

		if (userCrypto.isLocked()) {
			dispatch(GlobalReducer.actions.set({ field: 'cryptoError', value: 'Account locked' }));
			return false;
		}

		if (userCrypto.isWIF(password)) {
			passwordError = importWallet(password);
		} else {
			passwordError = importWallet(account, password);
		}

		if (passwordError) {
			dispatch(setFormError(FORM_SIGN_IN, 'password', passwordError));
			return false;
		}

		if (userCrypto.isWIF(password)) {
			userCrypto.importByWIF(password);
		}
		userCrypto.importByPassword(accountName, password);

		dispatch(addAccount(accountName, networkName));

	} catch (err) {
		dispatch(setValue(FORM_SIGN_IN, 'error', err));
	} finally {
		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
	}

	return true;
};
