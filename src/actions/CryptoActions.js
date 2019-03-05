/* eslint-disable no-empty */
import { batchActions } from 'redux-batched-actions';
import history from '../history';

import storage from '../services/storage';
import echoService from '../services/echo';

import GlobalReducer from '../reducers/GlobalReducer';

import {
	CREATE_PIN_PATH,
	UNLOCK_PATH,
	INDEX_PATH,
	SIGN_TRANSACTION_PATH,
	SUCCESS_SEND_PATH,
	ERROR_SEND_PATH,
	WELCOME_PATH,
	NETWORK_ERROR_SEND_PATH,
	FORM_TYPES,
} from '../constants/RouterConstants';
import { DRAFT_STORAGE_KEY, NETWORKS, POPUP_WINDOW_TYPE } from '../constants/GlobalConstants';
import { setValue } from './FormActions';
import { loadInfo, set, addAccount, storageGetDraft } from './GlobalActions';
import { globals } from './SignActions';

import FormatHelper from '../helpers/FormatHelper';
import ValidatePinHelper from '../helpers/ValidatePinHelper';
import { FORM_SEND } from '../constants/FormConstants';


/**
 *  @method changeCrypto
 *
 * 	Change crypto object in GlobalReducer
 *
 * 	@param {Object} params
 */
const changeCrypto = (params) => (dispatch) => {
	dispatch(GlobalReducer.actions.setIn({ field: 'crypto', params }));
};

/**
 *  @method lockCrypto
 *
 * 	Lock crypto in GlobalReducer and redirect to unlock
 */
const lockCrypto = () => (dispatch) => {
	dispatch(batchActions([
		GlobalReducer.actions.set({ field: 'loading', value: false }),
		GlobalReducer.actions.lock({
			goTo: INDEX_PATH,
		}),
	]));
	try {
		history.push(UNLOCK_PATH);
	} catch (e) {}
};

/**
 *  @const crypto
 *
 * 	Instance of Сrypto class
 */
export const getCrypto = () => echoService.getCrypto();

/**
 *  @method unlockCrypto
 *
 * 	Validate PIN and try to unlock
 * 	Load encrypted info
 *
 * 	@param {String} form
 * 	@param {String} pin
 */
export const unlockCrypto = (form, pin) => async (dispatch) => {

	const crypto = echoService.getCrypto();
	const error = ValidatePinHelper.validatePin(pin);

	if (error) {
		dispatch(setValue(form, 'error', error));
		return false;
	}

	try {
		dispatch(setValue(form, 'loading', true));

		await crypto.unlock(pin);

		dispatch(changeCrypto({ isLocked: false }));

		await dispatch(loadInfo());

		if (
			globals.WINDOW_TYPE === POPUP_WINDOW_TYPE
			&& ![SUCCESS_SEND_PATH, ERROR_SEND_PATH, NETWORK_ERROR_SEND_PATH]
				.includes(history.location.pathname)
		) {
			history.push(SIGN_TRANSACTION_PATH);
		}
		return true;
	} catch (err) {
		dispatch(setValue(form, 'error', FormatHelper.formatError(err)));
		return false;
	} finally {
		dispatch(setValue(form, 'loading', false));
	}
};

/**
 *  @method unlockResponse
 *
 * 	Unlock crypto response
 */
export const unlockResponse = () => async (dispatch) => {
	dispatch(changeCrypto({ isLocked: false }));

	await dispatch(loadInfo());

	if (
		globals.WINDOW_TYPE === POPUP_WINDOW_TYPE
		&& ![SUCCESS_SEND_PATH, ERROR_SEND_PATH, NETWORK_ERROR_SEND_PATH]
			.includes(history.location.pathname)
	) {
		history.push(SIGN_TRANSACTION_PATH);
	}
	return true;
};

/**
 *  @method lockResponse
 *
 * 	Lock crypto response
 */
export const lockResponse = () => (dispatch) => {
	dispatch(lockCrypto());
};

/**
 *  @method initCrypto
 *
 * 	Check is pin setted
 * 	If it doesn't exist, redirect to create pin. Otherwise - to unlock
 * 	Set subscribe on lock event
 */
export const initCrypto = () => async (dispatch) => {

	const crypto = echoService.getCrypto();

	try {

		if (!crypto.isLocked()) {
			dispatch(changeCrypto({ isLocked: false }));
			await dispatch(loadInfo());

			const account = await storage.get('account');
			if (account && account.name) {

				dispatch(addAccount(account.name, account.keys, account.networkName, WELCOME_PATH));

				return null;
			}

			if (globals.WINDOW_TYPE !== POPUP_WINDOW_TYPE) {
				const draft = await storageGetDraft();

				if (draft) {
					const draftForm = Object.keys(draft)[0];
					const draftKey = Object.values(draft)[0];

					const path = draftKey.loading === false
						? SUCCESS_SEND_PATH
						: FORM_TYPES[draftForm];

					history.push(path);

					if (draftForm === FORM_SEND && draftKey.loading === false) {
						await storage.remove(DRAFT_STORAGE_KEY);
					}
				} else {
					history.push(INDEX_PATH);
				}
			} else {
				history.push(SIGN_TRANSACTION_PATH);
			}
		} else {
			const isFirstTime = await crypto.isFirstTime();

			history.push(isFirstTime ? CREATE_PIN_PATH : UNLOCK_PATH);
		}
	} catch (err) {
		console.warn('Crypto initialization error', err);
		dispatch(changeCrypto({ error: FormatHelper.formatError(err) }));
	}
	return null;
};

/**
 *  @method setCryptoInfo
 *
 *  Set value by field in network storage
 *
 * 	@param {String} field
 * 	@param {*} value
 * 	@param {String?} networkName
 */
export const setCryptoInfo = (field, value, networkName) => async (dispatch, getState) => {
	const crypto = echoService.getCrypto();
	try {
		if (!networkName) {
			networkName = getState().global.getIn(['network', 'name']);
		}

		await crypto.setInByNetwork(networkName, field, value);
	} catch (err) {
		dispatch(changeCrypto({ error: FormatHelper.formatError(err) }));
	}
};

/**
 *  @method getCryptoInfo
 *
 *  Get value by field in network storage
 *
 * 	@param {String} field
 * 	@param {String} networkName
 */
export const getCryptoInfo = (field, networkName) => async (dispatch, getState) => {
	const crypto = echoService.getCrypto();

	try {
		if (!networkName) {
			networkName = getState().global.getIn(['network', 'name']);
		}

		const value = await crypto.getInByNetwork(networkName, field);

		return value;
	} catch (err) {
		dispatch(changeCrypto({ error: FormatHelper.formatError(err) }));
		return null;
	}
};


/**
 *  @method transitPublicKey
 *
 */
export const transitPublicKey = () => async (dispatch, getState) => {

	try {
		const keys = [];
		let wifs = [];
		const networkName = getState().global.getIn(['network', 'name']);
		const account = getState().global.get('account');

		if (!account) {
			return null;
		}

		const accountId = getState().global.getIn(['account', 'id']);

		const accountChain = [];
		try {
			const accountInfo = (await echoService.getChainLib().api.getAccounts([accountId]))[0];
			if (accountInfo) {
				accountInfo.active.key_auths.forEach((key) => {
					accountChain.push(key[0]);
				});
			}
		} catch (err) {
			console.warn('Crypto transitPublicKey: ', err);
		}

		for (let i = 0; i < accountChain.length; i += 1) {
			const wif = getCrypto().getWIFByPublicKey(networkName, accountChain[i]);
			wifs.push(wif);
		}

		wifs = await Promise.all(wifs);

		for (let i = 0; i < accountChain.length; i += 1) {
			if (wifs[i]) {
				keys.push({ publicKey: accountChain[i], wif: wifs[i] });
			}
		}

		return keys;
	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));
		return null;
	}
};

/**
 *  @method removeCryptoInfo
 *
 *  Remove value by field in network storage
 *
 * 	@param {String} field
 */
export const removeCryptoInfo = (field, networkName) => async (dispatch, getState) => {

	const crypto = echoService.getCrypto();

	try {
		if (!networkName) {
			networkName = getState().global.getIn(['network', 'name']);
		}

		await crypto.removeInByNetwork(networkName, field);
	} catch (err) {
		dispatch(changeCrypto({ error: FormatHelper.formatError(err) }));
	}
};

/**
 *  @method wipeCrypto
 *
 *  Remove all info
 */
export const wipeCrypto = () => async (dispatch, getState) => {
	const networks = getState().global.get('networks');

	const promises = networks.concat(NETWORKS).map(({ name }) => storage.remove(name));
	promises.push(storage.remove('randomKey'));

	await Promise.all(promises);

	history.push(CREATE_PIN_PATH);
};

export const userLockCrypto = () => () => {
	const crypto = echoService.getCrypto();
	crypto.lock();
};
