import history from '../history';

import storage from '../services/storage';
import echoService from '../services/echo';

import GlobalReducer from '../reducers/GlobalReducer';

import { CREATE_PIN_PATH, UNLOCK_PATH, INDEX_PATH } from '../constants/RouterConstants';
import { NETWORKS } from '../constants/GlobalConstants';

import { setValue } from './FormActions';
import { loadInfo } from './GlobalActions';

import FormatHelper from '../helpers/FormatHelper';
import ValidatePinHelper from '../helpers/ValidatePinHelper';

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
	dispatch(GlobalReducer.actions.lock());
	history.push(UNLOCK_PATH);
};

/**
 *  @const crypto
 *
 * 	Instance of Сrypto class
 */
export const getCrypto = () => echoService.getCrypto();

/**
 *  @method initCrypto
 *
 * 	Check is pin setted
 * 	If it doesn't exist, redirect to create pin. Otherwise - to unlock
 * 	Set subscribe on lock event
 */
export const initCrypto = () => async (dispatch) => {
	try {
		if (!getCrypto().isLocked()) {
			dispatch(changeCrypto({ isLocked: false }));

			history.push(INDEX_PATH);
		} else {
			const isFirstTime = await getCrypto().isFirstTime();

			history.push(isFirstTime ? CREATE_PIN_PATH : UNLOCK_PATH);
		}
		getCrypto().removeAllListeners();
		getCrypto().on('locked', () => dispatch(lockCrypto()));
	} catch (err) {
		dispatch(changeCrypto({ error: FormatHelper.formatError(err) }));
	}
};

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
	const error = ValidatePinHelper.validatePin(pin);

	if (error) {
		dispatch(setValue(form, 'error', error));
		return false;
	}

	try {
		dispatch(setValue(form, 'loading', true));

		await getCrypto().unlock(pin);
		dispatch(changeCrypto({ isLocked: false }));
		await dispatch(loadInfo());
		return true;
	} catch (err) {
		dispatch(setValue(form, 'error', FormatHelper.formatError(err)));
		return false;
	} finally {
		dispatch(setValue(form, 'loading', false));
	}
};

/**
 *  @method setCryptoInfo
 *
 *  Set value by field in network storage
 *
 * 	@param {String} field
 * 	@param {Any} value
 * 	@param {String?} networkName
 */
export const setCryptoInfo = (field, value, networkName) => async (dispatch, getState) => {
	try {
		if (!networkName) {
			networkName = getState().global.getIn(['network', 'name']);
		}

		await getCrypto().setInByNetwork(networkName, field, value);
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
	try {
		if (!networkName) {
			networkName = getState().global.getIn(['network', 'name']);
		}

		const value = await getCrypto().getInByNetwork(networkName, field);

		return value;
	} catch (err) {
		dispatch(changeCrypto({ error: FormatHelper.formatError(err) }));
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
	try {
		if (!networkName) {
			networkName = getState().global.getIn(['network', 'name']);
		}

		await getCrypto().removeInByNetwork(networkName, field);
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
