import { PrivateKey } from 'echojs-lib';
import { EchoJSActions } from 'echojs-redux';

import ValidateAccountHelper from '../helpers/ValidateAccountHelper';

import { setFormError, toggleLoading, setValue } from './FormActions';
import { addAccount, isAccountAdded } from './GlobalActions';
import { crypto } from './CryptoActions';

import { FORM_SIGN_UP, FORM_SIGN_IN } from '../constants/FormConstants';

import {
	validateAccountExist,
	createWallet,
	validateImportAccountExist,
} from '../api/WalletApi';

export const createAccount = ({ accountName }) => async (dispatch, getState) => {
	let accountNameError = ValidateAccountHelper.validateAccountName(accountName);

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

		const wif = crypto.generateWIF();

		await createWallet(
			network.registrator,
			accountNameError.example || accountName,
			wif,
		);

		await crypto.importByWIF(wif);

		dispatch(setValue(FORM_SIGN_UP, 'wif', wif));

		dispatch(addAccount(accountName, network.name));

	} catch (err) {
		dispatch(setValue(FORM_SIGN_UP, 'error', err.message));
	} finally {
		dispatch(toggleLoading(FORM_SIGN_UP, false));
	}

};

export const importAccount = ({ accountName, password }) => async (dispatch, getState) => {
	let accountNameError = ValidateAccountHelper.validateAccountName(accountName);
	const passwordError = ValidateAccountHelper.validatePassword(password);

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

		if (crypto.isWIF(password)) {
			const active = PrivateKey.fromWif(password).toPublicKey().toString();

			if (account.getIn(['active', 'key_auths', '0', '0']) !== active) {
				dispatch(setFormError(FORM_SIGN_IN, 'password', 'Invalid WIF'));
				return;
			}

			await crypto.importByWIF(password);
		} else {
			const active = crypto.getPublicKey(accountName, password);

			if (account.getIn(['active', 'key_auths', '0', '0']) !== active) {
				dispatch(setFormError(FORM_SIGN_IN, 'password', 'Invalid password'));
				return;
			}

			await crypto.importByPassword(accountName, password, account.getIn(['options', 'memo_key']));
		}

		dispatch(addAccount(accountName, network.name));

	} catch (err) {
		dispatch(setValue(FORM_SIGN_IN, 'error', err.message));
	} finally {
		dispatch(toggleLoading(FORM_SIGN_IN, false));
	}

};
