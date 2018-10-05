import { EchoJSActions } from 'echojs-redux';

import history from '../history';

import GlobalReducer from '../reducers/GlobalReducer';

import { INDEX_PATH, WIF_PATH } from '../constants/RouterConstants';

export const connection = () => async (dispatch) => {
	dispatch(GlobalReducer.actions.setGlobalLoading({ globalLoading: true }));

	try {
		await dispatch(EchoJSActions.connect('wss://echo-devnet-node.pixelplex.io/ws'));
	} catch (err) {
		dispatch(GlobalReducer.actions.set({ field: 'error', value: err }));
	} finally {
		dispatch(GlobalReducer.actions.setGlobalLoading({ globalLoading: false }));
	}
};

export const initAccount = (accountName, networkName) => async (dispatch) => {
	dispatch(GlobalReducer.actions.setGlobalLoading({ globalLoading: true }));

	try {
		let accounts = localStorage.getItem(`accounts_${networkName}`);

		accounts = accounts ? JSON.parse(accounts) : [];
		accounts = accounts.map((i) => {
			i.active = i.name === accountName;
			return i;
		});

		localStorage.setItem(`accounts_${networkName}`, JSON.stringify(accounts));

		const { id, name } = (await dispatch(EchoJSActions.fetch(accountName))).toJS();

		dispatch(GlobalReducer.actions.setIn({ field: 'activeUser', params: { id, name } }));

		if (INDEX_PATH.includes(history.location.pathname)) {
			history.push(WIF_PATH);
		}
	} catch (err) {
		dispatch(GlobalReducer.actions.set({ field: 'error', value: err }));
	} finally {
		setTimeout(() => {
			dispatch(GlobalReducer.actions.setGlobalLoading({ globalLoading: false }));
		}, 1000);
	}
};

export const addAccount = (accountName, networkName) => (dispatch) => {
	let accounts = localStorage.getItem(`accounts_${networkName}`);
	accounts = accounts ? JSON.parse(accounts) : [];
	accounts.push({ name: accountName, active: false });

	localStorage.setItem(`accounts_${networkName}`, JSON.stringify(accounts));

	dispatch(initAccount(accountName, networkName));
};
