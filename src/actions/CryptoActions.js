import history from '../history';
import Crypto from '../services/crypto';

import storage from '../services/storage';

import GlobalReducer from '../reducers/GlobalReducer';

import { CREATE_PIN_PATH, UNLOCK_PATH } from '../constants/RouterConstants';
import { NETWORKS } from '../constants/GlobalConstants';

import { setValue } from './FormActions';
import { loadInfo } from './GlobalActions';

import FormatHelper from '../helpers/FormatHelper';
import ValidatePinHelper from '../helpers/ValidatePinHelper';

const changeCrypto = (params) => (dispatch) => {
	dispatch(GlobalReducer.actions.setIn({ field: 'crypto', params }));
};

const lockCrypto = () => (dispatch) => {
	dispatch(GlobalReducer.actions.lock());
	history.push(UNLOCK_PATH);
};

export const crypto = new Crypto();

export const initCrypto = () => async (dispatch) => {
	try {
		const isFirstTime = await crypto.isFirstTime();

		history.push(isFirstTime ? CREATE_PIN_PATH : UNLOCK_PATH);

		crypto.on('locked', () => dispatch(lockCrypto()));
	} catch (err) {
		dispatch(changeCrypto({ error: FormatHelper.formatError(err) }));
	}
};

export const unlockCrypto = (form, pin) => async (dispatch) => {
	const error = ValidatePinHelper.validatePin(pin);

	if (error) {
		dispatch(setValue(form, 'error', error));
		return;
	}

	try {
		dispatch(setValue(form, 'loading', true));

		await crypto.unlock(pin);
		dispatch(changeCrypto({ isLocked: false }));
		await dispatch(loadInfo());
	} catch (err) {
		dispatch(setValue(form, 'error', FormatHelper.formatError(err)));
	} finally {
		dispatch(setValue(form, 'loading', false));
	}
};

export const setCryptoInfo = (field, value) => async (dispatch, getState) => {
	try {
		const networkName = getState().global.getIn(['network', 'name']);

		await crypto.setInByNetwork(networkName, field, value);
	} catch (err) {
		dispatch(changeCrypto({ error: FormatHelper.formatError(err) }));
	}
};

export const getCryptoInfo = (field) => async (dispatch, getState) => {
	try {
		const networkName = getState().global.getIn(['network', 'name']);

		const value = await crypto.getInByNetwork(networkName, field);

		return value;
	} catch (err) {
		dispatch(changeCrypto({ error: FormatHelper.formatError(err) }));
		return null;
	}
};

export const removeCryptoInfo = (field) => async (dispatch, getState) => {
	try {
		const networkName = getState().global.getIn(['network', 'name']);

		await crypto.removeInByNetwork(networkName, field);
	} catch (err) {
		dispatch(changeCrypto({ error: FormatHelper.formatError(err) }));
	}
};

export const wipeCrypto = () => async (dispatch, getState) => {
	const networks = getState().global.get('networks');

	networks.concat(NETWORKS).forEach(async ({ name }) => {
		await storage.remove(name);
	});

	await storage.remove('randomKey');

	history.push(CREATE_PIN_PATH);
};
