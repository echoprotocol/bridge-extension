import moment from 'moment';
import { Map, OrderedMap } from 'immutable';
import { validators } from 'echojs-lib';

import GlobalReducer from '../reducers/GlobalReducer';

import operations from '../constants/TransactionConstants';
import { CORE_SYMBOL, CORE_ID } from '../constants/GlobalConstants';
import { historyOperations } from '../constants/OperationConstants';

import FormatHelper from '../helpers/FormatHelper';

import echoService from '../services/echo';

// import { isAssetsChanged } from './BalanceActions';


/**
 *  @method formatOperation
 *
 * 	Formatting one transaction of account history
 *
 * 	@param {Object} data
 * 	@param {Object} result
 */
const formatOperation = async (data, result, accountName) => {

	const type = data.getIn(['op', '0']);
	const operation = data.getIn(['op', '1']);

	const block = await echoService.getChainLib().api.getBlock(data.get('block_num'));

	const { name, options } = Object.values(operations).find((i) => i.value === type);

	const typeOperation = historyOperations.find((item) => item.value.includes(name));

	result = result.set('id', data.get('id'))
		.setIn(['transaction', 'type'], typeOperation ? typeOperation.type : 'Transaction')
		.setIn(['transaction', 'typeName'], name)
		.setIn(['transaction', 'blockNumber'], block.round)
		.setIn(['transaction', 'date'], moment.utc(block.timestamp).local().format('DD MMM, HH:mm'))
		.setIn(['transaction', 'value'], 0)
		.setIn(['transaction', 'currency'], CORE_SYMBOL);

	if (operation.getIn(['fee', 'asset_id'])) {
		const asset = await echoService.getChainLib().api.getObject(operation.getIn(['fee', 'asset_id']));
		result = result
			.setIn(['content', 'fee'], FormatHelper.formatAmount(operation.getIn(['fee', 'amount']), asset.precision))
			.setIn(['content', 'feeCurrency'], asset.symbol);
	}

	if (options.subject) {
		if (options.subject[1]) {
			const request = operation.get(options.subject[0]);

			const response = await echoService.getChainLib().api.getObject(request);

			result = result.setIn(['content', 'receiver'], response[options.subject[1]]);
		} else {
			result = result.setIn(['content', 'receiver'], operation.get(options.subject[0]));
		}
	}

	if (options.from) {

		const request = operation.get(options.from);

		if (!validators.isContractId(request)) {
			const response = await echoService.getChainLib().api.getObject(request);
			result = result.setIn(['content', 'sender'], response.name);
		} else {
			result = result.setIn(['content', 'sender'], request);
		}

	}

	let numberSign = '-';

	if (result.getIn(['content', 'receiver']) && result.getIn(['content', 'receiver']) === accountName) {
		numberSign = '+';

		if (result.getIn(['transaction', 'type']) === 'Sent') {
			result = result.setIn(['transaction', 'type'], 'Recieved')
				.setIn(['transaction', 'typeName'], 'Received');
		}
	}

	if (options.value) {
		const value = operation.getIn(options.value.split('.'));
		const request = options.asset ? operation.getIn(options.asset.split('.')) : CORE_ID;
		const response = await echoService.getChainLib().api.getObject(request);

		let resultValue = value !== 0 ? `${numberSign} ` : '';
		resultValue = `${resultValue}${FormatHelper.formatAmount(value, response.precision)}`;

		result = result.setIn(['transaction', 'value'], resultValue);
		result = result.setIn(['transaction', 'currency'], response.symbol);
	}

	if (type === operations.contract_create.value) {
		result = result.setIn(['content', 'receiver'], data.getIn(['result', '1']));
	}

	return result;
};

/**
 *  @method formatHistory
 *
 * 	Formatting account transaction history
 *
 * 	@param {Object} history
 */
const formatHistory = (history) => async (dispatch, getState) => {

	if (!history || !history.size) { return; }

	try {
		const formattedHistory = getState().global.get('formattedHistory');
		const accountName = getState().global.getIn(['account', 'name']);

		const arr = history.toArray();

		const rows = [];

		for (let j = 0; j < arr.length; j += 1) {
			const row = arr[j];
			const id = row.get('id');
			const map = formattedHistory.get(id) || new Map({});

			try {
				/* eslint-disable no-await-in-loop */
				const result = await formatOperation(row, map, accountName);
				rows.push(result);
			} catch (e) {
				console.warn('Formating history error:', e);
			}
		}

		let ordered = new OrderedMap({});

		rows.forEach((row) => {
			ordered = ordered.set(row.get('id'), row);
		});

		dispatch(GlobalReducer.actions.set({ field: 'formattedHistory', value: ordered }));
	} catch (err) {
		dispatch(GlobalReducer.actions.set({
			field: 'error',
			value: FormatHelper.formatError(err),
		}));
	}
};

/**
 *  @method updateHistory
 *
 * 	Update user's history
 */
export const updateHistory = () => async (dispatch, getState) => {
	const accountName = getState().global.getIn(['account', 'name']);

	if (!accountName) {
		return false;
	}

	const stateHistory = getState().global.get('history');

	try {
		const currentAccountId = getState().global.getIn(['account', 'id']);
		const history = getState().blockchain.getIn(['fullAccounts', currentAccountId, 'history']);

		if (!history.equals(stateHistory)) {
			dispatch(GlobalReducer.actions.set({ field: 'history', value: history }));
			dispatch(formatHistory(history));
		}
		// TODO::
		// const assets = getState().balance.get('assets');

		// const isChanged = await isAssetsChanged(assets);
		// console.log('isChanged', isChanged);
		// if (isChanged) {
		// 	dispatch(formatHistory(history));
		// }

	} catch (err) {
		console.warn('Update history error', err);
		dispatch(GlobalReducer.actions.set({
			field: 'error',
			value: FormatHelper.formatError(err),
		}));
	}

	return true;
};

/**
 * @method initHistory
 *
 * Init user's history
 */
export const initHistory = () => (dispatch, getState) => {

	try {
		const accountName = getState().global.getIn(['account', 'name']);
		if (!accountName) {
			return false;
		}

		const currentAccountId = getState().global.getIn(['account', 'id']);
		const history = echoService.getChainLib().cache.fullAccounts.getIn([currentAccountId, 'history']);

		dispatch(GlobalReducer.actions.set({
			field: 'history',
			value: history,
		}));
		dispatch(formatHistory(history));
	} catch (err) {
		console.warn('Init history error', err);
		dispatch(GlobalReducer.actions.set({
			field: 'error',
			value: FormatHelper.formatError(err),
		}));
	}

	return true;
};
