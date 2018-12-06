import moment from 'moment';

import { fetchChain } from '../api/ChainApi';

import GlobalReducer from '../reducers/GlobalReducer';

import operations from '../constants/TransactionConstants';

import FormatHelper from '../helpers/FormatHelper';
import { CORE_SYMBOL } from '../constants/GlobalConstants';

import echoService from '../services/echo';

export const decryptNote = (index) => async (dispatch, getState) => {
	const networkName = getState().global.getIn(['network', 'name']);
	const { memo } = getState().global.get('formattedHistory').find((val) => val.id === index).content;

	if (!memo) {
		dispatch(GlobalReducer.actions.set({ field: 'historyNote', value: '' }));

		return null;
	}

	let note = '';

	try {
		note = await echoService.getCrypto().decryptMemo(networkName, memo);

		dispatch(GlobalReducer.actions.set({ field: 'historyNote', value: note }));
	} catch (err) {
		dispatch(GlobalReducer.actions.set({
			field: 'error',
			value: err,
		}));

		return null;
	}

	return note;
};

const formatOperation = async (data, index) => {
	const type = data.getIn(['op', '0']);
	const operation = data.getIn(['op', '1']);

	const block = await fetchChain(data.get('block_num'));

	const feeAsset = await fetchChain(operation.getIn(['fee', 'asset_id']));

	const { name, options } = Object.values(operations).find((i) => i.value === type);

	const result = {
		id: index,
		transaction: {
			type: name,
			typeName: name,
			date: moment.utc(block.timestamp).local().format('DD MMM, hh:mm'),
			value: 0,
			currency: CORE_SYMBOL,
		},
		content: {
			fee: FormatHelper.formatAmount(operation.getIn(['fee', 'amount']), feeAsset.get('precision')),
			feeCurrency: feeAsset.get('symbol'),
		},
	};

	if (options.subject) {
		if (options.subject[1]) {
			const request = operation.get(options.subject[0]);
			const response = await fetchChain(request);

			result.content.receiver = response.get(options.subject[1]);
		} else {
			result.content.receiver = operation.get(options.subject[0]);
		}
	}

	if (options.value) {
		result.transaction.value = operation.getIn(options.value.split('.'));
	}

	if (options.asset) {
		const request = operation.getIn(options.asset.split('.'));
		const response = await fetchChain(request);

		result.transaction.value = FormatHelper.formatAmount(result.transaction.value, response.get('precision'));
		result.transaction.currency = response.get('symbol');
	}

	if (type === 47) {
		result.content.receiver = data.getIn(['result', '1']);
	}

	if (type === 0 && operation.get('memo') && operation.getIn(['memo', 'message'])) {
		result.content.memo = operation.get('memo');
	}

	return result;
};

const formatHistory = (activity) => async (dispatch) => {
	if (!activity.size) { return; }

	try {
		let rows = activity.map((row, i) => formatOperation(row, i));
		rows = await Promise.all(rows);
		dispatch(GlobalReducer.actions.set({ field: 'formattedHistory', value: rows }));
	} catch (err) {
		dispatch(GlobalReducer.actions.set({
			field: 'error',
			value: FormatHelper.formatError(err),
		}));
	} finally {
		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
	}
};

export const updateHistory = () => async (dispatch, getState) => {
	const accountName = getState().global.getIn(['account', 'name']);

	if (!accountName) {
		return false;
	}

	const stateHistory = getState().global.get('history');
	const historyAccount = (await fetchChain(accountName)).get('history');

	if (stateHistory !== historyAccount) {
		dispatch(GlobalReducer.actions.set({ field: 'history', value: historyAccount }));
		dispatch(formatHistory(historyAccount));
	}

	return true;
};
