import moment from 'moment';
import { Map, OrderedMap } from 'immutable';

import GlobalReducer from '../reducers/GlobalReducer';

import operations from '../constants/TransactionConstants';
import { CORE_SYMBOL } from '../constants/GlobalConstants';
import { historyOperations } from '../constants/OperationConstants';

import FormatHelper from '../helpers/FormatHelper';

import echoService from '../services/echo';

import { isAssetsChanged } from './BalanceActions';

/**
 *  @method decryptNote
 *
 * 	Decodes note for transaction details
 *
 * 	@param {String} index
 */
export const decryptNote = (index) => async (dispatch, getState) => new Promise((resolve) => {

	const networkName = getState().global.getIn(['network', 'name']);
	const memo = getState().global.getIn(['formattedHistory', index, 'content', 'memo']);

	if (!memo) {
		return resolve(null);
	}

	return setTimeout(async () => {
		let note = null;
		try {
			note = await echoService.getCrypto().decryptMemo(networkName, memo);
		} catch (err) {
			return resolve(null);
		}

		return resolve(note);
	}, 0);

});

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

	const feeAsset = await echoService.getChainLib().api.getObject(operation.getIn(['fee', 'asset_id']));

	const { name, options } = Object.values(operations).find((i) => i.value === type);

	const typeOperation = historyOperations.find((item) => item.value.includes(name));

	result = result.set('id', data.get('id'))
		.setIn(['transaction', 'type'], typeOperation ? typeOperation.type : 'Transaction')
		.setIn(['transaction', 'typeName'], name)
		.setIn(['transaction', 'date'], moment.utc(block.timestamp).local().format('DD MMM, HH:mm'))
		.setIn(['transaction', 'value'], 0)
		.setIn(['transaction', 'currency'], CORE_SYMBOL)
		.setIn(['content', 'fee'], FormatHelper.formatAmount(operation.getIn(['fee', 'amount']), feeAsset.precision))
		.setIn(['content', 'feeCurrency'], feeAsset.symbol);

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
		const response = await echoService.getChainLib().api.getObject(request);

		result = result.setIn(['content', 'sender'], response.name);
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
		result = result.setIn(['transaction', 'value'], operation.getIn(options.value.split('.')));
	}

	if (options.asset) {
		const request = operation.getIn(options.asset.split('.'));

		const response = await echoService.getChainLib().api.getObject(request);

		const resultValue = result.getIn(['transaction', 'value']) !== 0 ? `${numberSign} ${FormatHelper.formatAmount(result.getIn(['transaction', 'value']), response.precision)}` :
			FormatHelper.formatAmount(result.getIn(['transaction', 'value']), response.precision);
		result = result.setIn(['transaction', 'value'], resultValue);
		result = result.setIn(['transaction', 'currency'], response.symbol);
	}

	if (type === operations.contract.value) {
		result = result.setIn(['content', 'receiver'], data.getIn(['result', '1']));
	}

	if (type === operations.transfer.value && operation.get('memo') && operation.getIn(['memo', 'message'])) {
		result = result.setIn(['content', 'memo'], operation.get('memo'));
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

		let rows = history.map(async (row) => {
			const id = row.get('id');

			return formatOperation(row, formattedHistory.get(id) || new Map({}), accountName);
		});

		rows = await Promise.all(rows);

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
	} finally {
		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
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

		if (history !== stateHistory) {
			dispatch(GlobalReducer.actions.set({ field: 'history', value: history }));

			dispatch(formatHistory(history));
		}

		const assets = getState().balance.get('assets');

		const isChanged = await isAssetsChanged(assets);

		if (isChanged) {
			dispatch(formatHistory(history));
		}
	} catch (err) {
		dispatch(GlobalReducer.actions.set({
			field: 'error',
			value: FormatHelper.formatError(err),
		}));
	}

	return true;
};
