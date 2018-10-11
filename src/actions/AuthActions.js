import { EchoJSActions } from 'echojs-redux';

import ValidateAccountHelper from '../helpers/ValidateAccountHelper';

import { setFormError, toggleLoading, setValue } from './FormActions';
import { addAccount, isAccountAdded, userCrypto } from './GlobalActions';

import { FORM_SIGN_UP, FORM_SIGN_IN } from '../constants/FormConstants';

import {
	validateAccountExist,
	createWallet,
	importWallet,
	validateImportAccountExist,
} from '../api/WalletApi';

import GlobalReducer from '../reducers/GlobalReducer';

export const createAccount = ({ accountName }) => async (dispatch, getState) => {

	let accountNameError = ValidateAccountHelper.validateAccountName(accountName);

	dispatch(toggleLoading(FORM_SIGN_UP, true));

	if (accountNameError) {
		dispatch(setFormError(FORM_SIGN_UP, 'accountName', { example: '', errorText: accountNameError }));
		dispatch(toggleLoading(FORM_SIGN_UP, false));
		return;
	}

	try {
		const instance = getState().echojs.getIn(['system', 'instance']);
		const network = getState().global.getIn(['network']).toJS();

		accountNameError = await validateAccountExist(instance, accountName);

		if (accountNameError.errorText) {
			dispatch(setFormError(FORM_SIGN_UP, 'accountName', accountNameError));
			return;
		}

		if (userCrypto.isLocked()) {
			dispatch(GlobalReducer.actions.set({ field: 'cryptoError', value: 'Account locked' }));
			return;
		}

		const wif = await createWallet(network.registrator, accountNameError.example || accountName);

		userCrypto.importByWIF(wif);

		dispatch(setValue(FORM_SIGN_UP, 'wif', wif));

		dispatch(addAccount(accountName, network.name));

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
		dispatch(toggleLoading(FORM_SIGN_IN, false));
		return;
	}

	if (passwordError) {
		dispatch(setFormError(FORM_SIGN_IN, 'password', passwordError));
		dispatch(toggleLoading(FORM_SIGN_IN, false));
		return;
	}

	try {
		const instance = getState().echojs.getIn(['system', 'instance']);
		const network = getState().global.getIn(['network']).toJS();

		accountNameError = await validateImportAccountExist(instance, accountName, true);

		if (!accountNameError) {
			accountNameError = isAccountAdded(accountName, network.name);
		}

		if (accountNameError) {
			dispatch(setFormError(FORM_SIGN_IN, 'accountName', accountNameError));
			return;
		}

		const account = await dispatch(EchoJSActions.fetch(accountName));

		if (userCrypto.isLocked()) {
			dispatch(GlobalReducer.actions.set({ field: 'cryptoError', value: 'Account locked' }));
			return;
		}

		passwordError = importWallet(account, password);

		if (passwordError) {
			dispatch(setFormError(FORM_SIGN_IN, 'password', passwordError));
			return;
		}

		if (userCrypto.isWIF(password)) {
			userCrypto.importByWIF(password);
		}
		userCrypto.importByPassword(accountName, password);

		dispatch(addAccount(accountName, network.name));

	} catch (err) {
		dispatch(setValue(FORM_SIGN_IN, 'error', err));
	} finally {
		dispatch(toggleLoading(FORM_SIGN_IN, false));
	}

};
