import ValidateAccountHelper from '../helpers/ValidateAccountHelper';

import { setFormError, toggleLoading, setValue } from './FormActions';

import { FORM_SIGN_UP, FORM_SIGN_IN } from '../constants/FormConstants';

import { validateAccountExist, createWallet } from '../api/WalletApi';

export const createAccount = (accountName) => async (dispatch, getState) => {
	let accountNameError = ValidateAccountHelper.validateAccountName(accountName);

	if (accountNameError) {
		dispatch(setFormError(FORM_SIGN_UP, 'accountName', accountNameError));
		return;
	}

	try {
		const instance = getState().echojs.getIn(['system', 'instance']);

		dispatch(toggleLoading(FORM_SIGN_UP, true));

		accountNameError = await validateAccountExist(instance, accountName, false);

		if (accountNameError) {
			dispatch(setFormError(FORM_SIGN_UP, 'accountName', accountNameError));
			return;
		}

		const wif = await createWallet(accountName);

		dispatch(setValue(FORM_SIGN_UP, 'wif', wif));

	} catch (err) {
		dispatch(setValue(FORM_SIGN_UP, 'error', err));
	} finally {
		dispatch(toggleLoading(FORM_SIGN_UP, false));
	}

};

export const authUser = ({ accountName, password }) => async (dispatch, getState) => {
	let accountNameError = ValidateAccountHelper.validateAccountName(accountName);
	const passwordError = ValidateAccountHelper.validatePassword(password);

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
		accountNameError = await validateAccountExist(instance, accountName, true);

		if (!accountNameError) {
			accountNameError = isAccountAdded(accountName, networkName);
		}

		if (accountNameError) {
			dispatch(setFormError(FORM_SIGN_IN, 'accountName', accountNameError));
			return;
		}

		dispatch(toggleLoading(FORM_SIGN_IN, true));

		const account = await dispatch(EchoJSActions.fetch(accountName));

		const { owner, active, memo } = await unlockWallet(account, password);

		if (!owner && !active && !memo) {
			dispatch(setFormError(FORM_SIGN_IN, 'password', 'Invalid password'));
			return;
		}

		if (owner) {
			dispatch(setKey(owner, accountName, password, 'owner'));
		}

		if (active) {
			dispatch(setKey(active, accountName, password, 'active'));
		}

		if (memo) {
			dispatch(setKey(memo, accountName, password, 'memo'));
		}

		dispatch(addAccount(accountName, networkName));

	} catch (err) {
		dispatch(setValue(FORM_SIGN_IN, 'error', err));
	} finally {
		dispatch(toggleLoading(FORM_SIGN_IN, false));
	}

};
