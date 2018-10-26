import FormatHelper from '../helpers/FormatHelper';

import { operationFields } from '../constants/OperationConstants';

export const getFetchMap = (type, options) => {
	const operation = operationFields[type];

	return Object.entries(operation).reduce((obj, [key, value]) => {
		if (!options[key]) { return obj; }

		if (['account_id', 'asset_id'].includes(value)) {
			obj[key] = options[key];
		}

		if (value === 'asset_object') {
			obj.asset = options[key].asset_id;
		}

		return obj;
	}, {});
};

export const formatToShow = (type, options) => {
	const operation = operationFields[type];

	return Object.entries(operation).reduce((obj, [key, value]) => {
		if (!options[key]) {
			return obj;
		}

		switch (value) {
			case 'account_id':
				obj[key] = options[key].get('name');
				break;
			case 'asset_id':
				obj[key] = options[key].get('symbol');
				break;
			case 'asset_object':
				obj[key] = FormatHelper.formatAmount(
					options[key].amount,
					options[key].asset.get('precision'),
					options[key].asset.get('symbol'),
				);
				break;
			default: obj[key] = options[key];
		}

		return obj;

	}, {});
};

export const formatToSend = (type, options) => {
	const operation = operationFields[type];

	return Object.entries(operation).reduce((obj, [key, value]) => {
		switch (value) {
			case 'account_id':
				obj[key] = options[key].get('id');
				break;
			case 'asset_id':
				obj[key] = options[key].get('id');
				break;
			case 'asset_object':
				obj[key] = {
					amount: options[key].amount,
					asset_id: options[key].asset.get('id'),
				};
				break;
			default: obj[key] = options[key];
		}

		return obj;

	}, {});
};
