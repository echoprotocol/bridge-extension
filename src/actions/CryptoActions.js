import history from '../history';
import Crypto from '../services/crypto';

import storage from '../services/storage';

import GlobalReducer from '../reducers/GlobalReducer';

import { FORM_UNLOCK } from '../constants/FormConstants';
import { CREATE_PIN_PATH, UNLOCK_PATH } from '../constants/RouterConstants';
import { NETWORKS } from '../constants/GlobalConstants';

import { setValue } from './FormActions';
import { loadInfo } from './GlobalActions';

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
		dispatch(changeCrypto({ error: err instanceof Error ? err.message : err }));
	}
};

export const unlockCrypto = (pin) => async (dispatch) => {
	dispatch(setValue(FORM_UNLOCK, 'loading', true));

	try {
		await crypto.unlock(pin);
		dispatch(changeCrypto({ isLocked: false }));
		await dispatch(loadInfo());
	} catch (err) {
		dispatch(setValue(FORM_UNLOCK, 'error', err instanceof Error ? err.message : err));
	} finally {
		dispatch(setValue(FORM_UNLOCK, 'loading', false));
	}
};

export const setCryptoInfo = (field, value) => async (dispatch, getState) => {
	try {
		const networkName = getState().global.getIn(['network', 'name']);

		await crypto.setInByNetwork(networkName, field, value);
	} catch (err) {
		dispatch(changeCrypto({ error: err instanceof Error ? err.message : err }));
	}
};

export const getCryptoInfo = (field) => async (dispatch, getState) => {
	try {
		const networkName = getState().global.getIn(['network', 'name']);

		const value = await crypto.getInByNetwork(networkName, field);

		return value;
	} catch (err) {
		dispatch(changeCrypto({ error: err instanceof Error ? err.message : err }));
		return null;
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
