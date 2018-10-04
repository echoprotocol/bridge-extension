import { EchoJSActions } from 'echojs-redux';

import ValidateAccountHelper from '../helpers/ValidateAccountHelper';

import { setFormError, toggleLoading, setValue } from './FormActions';
import { addAccount, isAccountAdded } from './GlobalActions';

import { FORM_SIGN_UP, FORM_SIGN_IN } from '../constants/FormConstants';

import {
	validateAccountExist,
	createWallet,
	importWallet,
	validateImportAccountExist,
} from '../api/WalletApi';

export const createAccount = ({ accountName }) => async (dispatch, getState) => {
	let accountNameError = ValidateAccountHelper.validateAccountName(accountName);

	if (accountNameError) {
		dispatch(setFormError(FORM_SIGN_UP, 'accountName', { example: '', errorText: accountNameError }));
		return;
	}

	try {
		const instance = getState().echojs.getIn(['system', 'instance']);

		dispatch(toggleLoading(FORM_SIGN_UP, true));

		accountNameError = await validateAccountExist(instance, accountName, false);

		if (accountNameError.errorText) {
			dispatch(setFormError(FORM_SIGN_UP, 'accountName', accountNameError));
			return;
		}

		const wif = await createWallet(accountNameError.example || accountName);

		dispatch(setValue(FORM_SIGN_UP, 'wif', wif));

		dispatch(addAccount(accountName, 'devnet'));

	} catch (err) {
		dispatch(setValue(FORM_SIGN_UP, 'error', err));
	} finally {
		dispatch(toggleLoading(FORM_SIGN_UP, false));
	}

};

export const importAccount = ({ accountName, password }) => async (dispatch, getState) => {
	let accountNameError = ValidateAccountHelper.validateAccountName(accountName);
	let passwordError = ValidateAccountHelper.validatePassword(password);

	if (accountNameError) {
		dispatch(setFormError(FORM_SIGN_IN, 'accountName', accountNameError));
		return;
	}

	if (passwordError) {
		dispatch(setFormError(FORM_SIGN_IN, 'password', passwordError));
		return;
	}

	try {
		const instance = getState().echojs.getIn(['system', 'instance']);
		accountNameError = await validateImportAccountExist(instance, accountName, true);

		if (!accountNameError) {
			accountNameError = isAccountAdded(accountName, 'devnet');
		}

		if (accountNameError) {
			dispatch(setFormError(FORM_SIGN_IN, 'accountName', accountNameError));
			return;
		}

		dispatch(toggleLoading(FORM_SIGN_IN, true));

		const account = await dispatch(EchoJSActions.fetch(accountName));

		passwordError = importWallet(account, password);

		if (passwordError) {
			dispatch(setFormError(FORM_SIGN_IN, 'password', passwordError));
		}

		dispatch(addAccount(accountName, 'devnet'));

	} catch (err) {
		dispatch(setValue(FORM_SIGN_IN, 'error', err));
	} finally {
		dispatch(toggleLoading(FORM_SIGN_IN, false));
	}

};
