import FormatHelper from '../helpers/FormatHelper';

import { operationFields } from '../constants/OperationConstants';

export const validateOperation = (options) => {
	if (!options.type) {
		return 'Operation type is required';
	}

	const operation = operationFields[options.type];

	if (!operation) {
		return 'Operation not found';
	}

	const notDefind = Object.entries(operation)
		.find(([key, value]) => (!options[key] && value.required));

	if (notDefind) {
		return `Field "${notDefind[0]}" is required`;
	}

	return null;
};

export const getFetchMap = (type, options) => {
	const operation = operationFields[type];

	return Object.entries(operation).reduce((obj, [key, value]) => {
		if (!options[key]) { return obj; }

		if (['account_id', 'asset_id'].includes(value.type)) {
			obj[key] = options[key];
		}

		if (value.type === 'asset_object') {
			obj[key] = options[key].asset_id;
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

		switch (value.type) {
			case 'account_id':
				obj[key] = options[key].get('name') || options[key].get('id');
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

	}, { ...options });
};

export const formatToSend = (type, options) => {
	const operation = operationFields[type];

	return Object.entries(operation).reduce((obj, [key, value]) => {
		if (!options[key]) {
			obj[key] = value.default;
			return obj;
		}

		switch (value.type) {
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
