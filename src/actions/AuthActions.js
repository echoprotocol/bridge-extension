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
import WelcomeReducer from '../reducers/WelcomeReducer';

/**
 * Create account through account name
 * @param {accountName}
 * @returns {Function}
 */
export const createAccount = ({ accountName }) => async (dispatch, getState) => {

	let accountNameError = ValidateAccountHelper.validateAccountName(accountName);

	if (accountNameError) {
		dispatch(setFormError(FORM_SIGN_UP, 'accountName', { example: '', errorText: accountNameError }));
		return false;
	}

	try {
		const instance = getState().echojs.getIn(['system', 'instance']);
		const registrator = getState().global.getIn(['network', 'registrator']);
		const networkName = getState().global.getIn(['network', 'name']);

		dispatch(GlobalReducer.actions.set({ field: 'accountLoading', value: true }));

		accountNameError = await validateAccountExist(instance, accountName);

		if (accountNameError.errorText) {
			dispatch(setFormError(FORM_SIGN_UP, 'accountName', accountNameError));
			return false;
		}

		if (userCrypto.isLocked()) {
			dispatch(GlobalReducer.actions.set({ field: 'cryptoError', value: 'Account locked' }));
			return false;
		}

		const wif = await createWallet(registrator, accountNameError.example || accountName);

		userCrypto.importByWIF(wif);

		// dispatch(WelcomeReducer.actions.set({ field: 'wif', value: wif }));

		dispatch(addAccount(accountName, networkName));

		return wif;

	} catch (err) {
		dispatch(setValue(FORM_SIGN_UP, 'error', err));
	} finally {
		dispatch(GlobalReducer.actions.set({ field: 'accountLoading', value: false }));
	}
	return true;
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

		dispatch(GlobalReducer.actions.set({ field: 'accountLoading', value: true }));

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
		dispatch(GlobalReducer.actions.set({ field: 'accountLoading', value: false }));
	}

	return true;
};
