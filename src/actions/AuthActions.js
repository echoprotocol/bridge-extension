import { PrivateKey } from 'echojs-lib';

import echoService from '../services/echo';

import ValidateAccountHelper from '../helpers/ValidateAccountHelper';
import FormatHelper from '../helpers/FormatHelper';

import { setValue } from './FormActions';
import { addAccount, isAccountAdded, addKeyToAccount, isPublicKeyAdded } from './GlobalActions';
import { getCrypto } from './CryptoActions';

import { FORM_SIGN_UP, FORM_SIGN_IN } from '../constants/FormConstants';
import { ACTIVE_KEY, MEMO_KEY } from '../constants/GlobalConstants';

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

export const validateAccountExist = async (
	accountName,
	requestsCount = 0,
) => {

	if (requestsCount === 10) {
		return {
			example: '',
			error: 'Account with such name already exists.',
		};
	}

	const result = await echoService.getChainLib().api.lookupAccounts(accountName);

	if (result.find((i) => i[0] === accountName)) {

		const matches = accountName.match(/\d+$/);
		if (matches) {
			accountName =
				accountName.substr(0, matches.index) + (parseInt(matches[0], 10) + 1);
		} else {
			accountName += 1;
		}

		const { example, error } = await validateAccountExist(
			accountName,
			requestsCount += 1,
		);

		return { example, error };
	}

	if (requestsCount === 0) {
		accountName = null;
	}

	return {
		example: accountName,
		error: accountName && 'Account with such name already exists.',
	};
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
	const example = '';

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

		const networkName = getState().global.getIn(['network', 'name']);

		dispatch(toggleLoading(FORM_SIGN_UP, true));

		const emitter = echoService.getEmitter();
		emitter.emit('createWallet', name);

		const wif = getCrypto().generateWIF();

		const echoRandKey = getCrypto().generateEchoRandKey();

		const key = PrivateKey.fromWif(wif).toPublicKey().toString();

		await echoService.getChainLib().api.registerAccount(name, key, key, key, echoRandKey);

		await getCrypto().importByWIF(networkName, wif);

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

/**
 *  @method offerName
 *
 * 	Create account through account name
 *
 * 	@param {String} name
 *
 * 	@return {String} wif
 */
export const offerName = (error, example) => async (dispatch) => {
	dispatch(setValue(FORM_SIGN_UP, 'accountName', { error, example }));
};


const validateImportAccountExist = async (
	accountName,
	networkName,
) => {
	const result = await echoService.getChainLib().api.lookupAccounts(accountName);

	if (!result.find((i) => i[0] === accountName)) {

		return `This account does not exist on ${networkName}`;
	}
	return null;
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
* 	@return {Boolean} successStatus
 *  @return {Boolean} isNewAccount
 */
const importByPassword = (networkName, name, password) => async (dispatch) => {

	const nameError = ValidateAccountHelper.validateAccountName(name);
	const existError = await validateImportAccountExist(name, true, networkName);
	const fieldError = 'nameError';
	let isAccAddedByPas = false;

	if (nameError || existError) {
		const error = nameError || existError;

		dispatch(setValue(FORM_SIGN_IN, fieldError, error));
		return { successStatus: false, isAccAddedByPas };
	}

	const account = await echoService.getChainLib().api.getAccountByName(name);
	const active = getCrypto().getPublicKey(name, password);
	const [[accountId]] = await echoService.getChainLib().api.getKeyReferences(active);

	const keys = account.active.key_auths;

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

	if (!hasKey) {
		dispatch(setValue(FORM_SIGN_IN, 'passwordError', 'Invalid password'));
		return { successStatus: false, isAccAddedByPas };
	}

	if (dispatch(isAccountAdded(name))) {
		isAccAddedByPas = true;

		if (!await dispatch(isPublicKeyAdded(accountId, active))) {

			await dispatch(addKeyToAccount(accountId, active));
			await getCrypto().importByPassword(
				networkName,
				name,
				password,
				account.options.memo_key,
			);

			return { successStatus: true, isAccAddedByPas };
		}


		dispatch(setValue(FORM_SIGN_IN, 'passwordError', 'WIF already added'));

		return { successStatus: false, isAccAddedByPas };
	}


	await getCrypto().importByPassword(
		networkName,
		name,
		password,
		account.options.memo_key,
	);

	return { successStatus: true, isAccAddedByPas };
};

/**
 *  @method importAccount
 *
 * 	Import account from desktop app or sign in
 *
 * 	@param {String} name
 * 	@param {String} password
 *
 * 	@return {Object} name, isAccAdded
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

			const [[accountId]] = await echoService.getChainLib().api.getKeyReferences([active]);

			if (!accountId) {
				dispatch(setValue(FORM_SIGN_IN, 'passwordError', 'Invalid WIF'));
				return false;
			}

			if (await dispatch(isPublicKeyAdded(accountId, active))) {
				dispatch(setValue(FORM_SIGN_IN, 'passwordError', 'WIF already added'));
				return false;
			}


			const [account] = await echoService.getChainLib().api.getAccounts([accountId]);

			const publicKeys = account.active.key_auths;

			const activeKey = publicKeys.find((key) => key[0] === active);

			if (!activeKey) {
				dispatch(setValue(FORM_SIGN_IN, 'passwordError', 'WIF is not active key.'));
				return false;
			}

			name = account.name; // eslint-disable-line prefer-destructuring

			await getCrypto().importByWIF(networkName, password);

			if (dispatch(isAccountAdded(name))) {

				isAccAdded = true;
				await dispatch(addKeyToAccount(accountId, active));

				return { name, isAccAdded };
			}
			keys = [active];

		} else {

			const {
				successStatus,
				isAccAddedByPas,
			} = await dispatch(importByPassword(networkName, name, password));

			isAccAdded = isAccAddedByPas;
			success = successStatus;

			if (success && isAccAddedByPas) {

				return { name, isAccAdded };
			}

			keys = [
				getCrypto().getPublicKey(name, password, ACTIVE_KEY),
				getCrypto().getPublicKey(name, password, MEMO_KEY),
			];

		}

		if (success) {

			await dispatch(addAccount(name, keys, networkName));
		}

		return success ? { name, isAccAdded } : null;

	} catch (err) {
		dispatch(setValue(FORM_SIGN_IN,	'error', FormatHelper.formatError(err)));

		return false;
	} finally {
		dispatch(toggleLoading(FORM_SIGN_IN, false));
		getCrypto().resumeLockTimeout();
	}
};
