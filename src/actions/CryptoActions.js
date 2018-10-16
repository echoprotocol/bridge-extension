import Crypto from '../services/crypto';

import GlobalReducer from '../reducers/GlobalReducer';

const changeCrypto = (params) => (dispatch) => {
	dispatch(GlobalReducer.actions.setIn({ field: 'crypto', params }));
};

export const crypto = new Crypto();

// TODO remove default pin value in BRG-21
export const initCrypto = (pin = '123456') => async (dispatch) => {
	try {
		await crypto.unlock(pin);
		dispatch(changeCrypto({ isLocked: false }));

		crypto.on('locked', () => {
			dispatch(changeCrypto({ isLocked: true }));
		});
	} catch (err) {
		dispatch(changeCrypto({ error: err instanceof Error ? err.message : err }));
	}
};

// TODO remove default pin value in BRG-21
export const unlockCrypto = (pin = '123456') => async (dispatch) => {
	try {
		await crypto.unlock(pin);
		dispatch(changeCrypto({ isLocked: false }));
	} catch (err) {
		dispatch(changeCrypto({ error: err instanceof Error ? err.message : err }));
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
