import ValidateAccountHelper from '../helpers/ValidateAccountHelper';

import { setFormError, toggleLoading, setValue } from './FormActions';
import { initAccount } from './GlobalActions';

import { FORM_SIGN_UP } from '../constants/FormConstants';

import { validateAccountExist, createWallet } from '../api/WalletApi';

const createAccount = ({ accountName }) => async (dispatch, getState) => {
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

		dispatch(initAccount(accountName, 'devnet'));

	} catch (err) {
		dispatch(setValue(FORM_SIGN_UP, 'error', err));
	} finally {
		dispatch(toggleLoading(FORM_SIGN_UP, false));
	}

};

export default createAccount;
