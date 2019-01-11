import { PrivateKey } from 'echojs-lib';

import ValidateAccountHelper from '../helpers/ValidateAccountHelper';
import FormatHelper from '../helpers/FormatHelper';

import { setValue } from './FormActions';
import { addAccount, isAccountAdded, addKeyToAccount, isPublicKeyAdded } from './GlobalActions';
import { getCrypto } from './CryptoActions';

import { FORM_SIGN_UP, FORM_SIGN_IN } from '../constants/FormConstants';
import { ACTIVE_KEY, MEMO_KEY } from '../constants/GlobalConstants';

import {
	validateAccountExist,
	createWallet,
	validateImportAccountExist,
} from '../api/WalletApi';
import { fetchChain, getAccountRefsOfKey } from '../api/ChainApi';

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

	const isConnected = getState().global.get('connected');

	if (!isConnected) {
		dispatch(setValue(FORM_SIGN_UP, 'accountName', { error: 'Network error', example }));
		return null;
	}

	try {
		getCrypto().pauseLockTimeout();

		const registrator = getState().global.getIn(['network', 'registrator']);
		const networkName = getState().global.getIn(['network', 'name']);

		dispatch(toggleLoading(FORM_SIGN_UP, true));

		({ error, example } = await validateAccountExist(name));

		if (error) {
			dispatch(setValue(FORM_SIGN_UP, 'accountName', { error, example }));
			return null;
		}
		const wif = getCrypto().generateWIF();

		await createWallet(registrator, name, wif);

		await getCrypto().importByWIF(networkName, wif);

		const key = PrivateKey.fromWif(wif).toPublicKey().toString();

		await dispatch(addAccount(name, [key, key], networkName));

		return wif;

	} catch (err) {
		dispatch(setValue(FORM_SIGN_UP, 'error', FormatHelper.formatError(err)));

		return null;
	} finally {
		dispatch(toggleLoading(FORM_SIGN_UP, false));
		getCrypto().resumeLockTimeout();
	}

};

// todo: вынести errors в imortErrors()
// todo: не отображаются ключи в бэкапе после importByPassword

/**
 *  @method importByPassword
 *
 * 	Import account from desktop app params (name and password)
 *
 *  @param {String} networkName
 * 	@param {String} name
 * 	@param {String} password
 *
* 	@return {Boolean} successStatus
 *  @return {Boolean} isNewAccount
 */
const importByPassword = (networkName, name, password) => async (dispatch) => {

	const nameError = ValidateAccountHelper.validateAccountName(name);
	const existError = await validateImportAccountExist(name, true, networkName);

	const account = await fetchChain(name);
	const active = getCrypto().getPublicKey(name, password);
	const [accountId] = await getAccountRefsOfKey(active);

	let fieldError = 'nameError';
	let isNewAccount = true;

	if (nameError || existError) {
		const error = nameError || existError;

		dispatch(setValue(FORM_SIGN_IN, fieldError, error));
		return { successStatus: false, isNewAccount };
	}

	let addedError = '';


	if (dispatch(isAccountAdded(name))) {
		isNewAccount = false;

		if (!await dispatch(isPublicKeyAdded(accountId, active))) {

			await dispatch(addKeyToAccount(accountId, active));
			return { successStatus: true, isNewAccount };
		}

		fieldError = 'passwordError';
		addedError = 'WIF already added';
	}


	if (addedError.length) {
		const error = addedError;

		dispatch(setValue(FORM_SIGN_IN, fieldError, error));
		return { successStatus: false, isNewAccount };
	}

	const keys = account.getIn(['active', 'key_auths']);

	let hasKey = false;

	keys.find((
		(key) => {
			key = key.get('0');
			if (key === active) {
				hasKey = true;
				return null;
			}
			return null;
		}));

	console.log('hasKey: ', hasKey);


	if (!hasKey) {
		dispatch(setValue(FORM_SIGN_IN, 'passwordError', 'Invalid password'));
		return { successStatus: false, isNewAccount };
	}

	await getCrypto().importByPassword(
		networkName,
		name,
		password,
		account.getIn(['options', 'memo_key']),
	);

	return { successStatus: true, isNewAccount: true };
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

	const isConnected = getState().global.get('connected');

	if (!isConnected) {
		dispatch(setValue(FORM_SIGN_IN, 'nameError', 'Network error'));
		return false;
	}

	try {
		getCrypto().pauseLockTimeout();
		dispatch(toggleLoading(FORM_SIGN_IN, true));

		let success = true;
		let keys = [];

		let isAccAdded = false;

		if (getCrypto().isWIF(password)) {

			const active = PrivateKey.fromWif(password).toPublicKey().toString();

			const [accountId] = await getAccountRefsOfKey(active);

			if (!accountId) {
				dispatch(setValue(FORM_SIGN_IN, 'passwordError', 'Invalid WIF'));
				return false;
			}

			if (await dispatch(isPublicKeyAdded(accountId, active))) {
				dispatch(setValue(FORM_SIGN_IN, 'passwordError', 'WIF already added'));
				return false;
			}

			const account = await fetchChain(accountId);
			name = account.get('name');

			await getCrypto().importByWIF(networkName, password);

			if (dispatch(isAccountAdded(name))) {
				isAccAdded = true;
				await dispatch(addKeyToAccount(accountId, active));

				return { name, isAccAdded };
			}

			const memo = account.getIn(['options', 'memo_key']);

			if (active === memo) {
				keys = [active, memo];
			} else {
				keys = [active];
			}

		} else {

			const {
				successStatus,
				isNewAccount,
			} = await dispatch(importByPassword(networkName, name, password));

			isAccAdded = isNewAccount;
			success = successStatus;

			console.log('isNewAccount ???: ', isNewAccount);


			if (successStatus && !isAccAdded) {
				console.log('Я тут?');

				return { name, isAccAdded };
			}


			keys = [
				getCrypto().getPublicKey(name, password, ACTIVE_KEY),
				getCrypto().getPublicKey(name, password, MEMO_KEY),
			];

		}

		if (success) {

			console.log('from addAccount - isAccAdded: ', isAccAdded);

			await dispatch(addAccount(name, keys, networkName));
		}

		console.log('from return - isAccAdded: ', isAccAdded);
		return success ? { name, isAccAdded: !isAccAdded } : null;

	} catch (err) {

		dispatch(setValue(FORM_SIGN_IN,	'error', FormatHelper.formatError(err)));

		return false;
	} finally {
		dispatch(toggleLoading(FORM_SIGN_IN, false));
		getCrypto().resumeLockTimeout();
	}
};
