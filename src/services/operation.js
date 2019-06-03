import { operationFields, operationFieldsSend } from '../constants/OperationConstants';

/**
 *  @method getFetchMap
 *
 *  Get map for fetch objects
 *
 *  @param {String} type
 *  @param {Object} options
 */
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

/**
 *  @method formatToSend
 *
 *  Formatting data for broadcast
 *
 *  @param {String} type
 *  @param {Object} options
 */
export const formatToSend = (type, options) => {
	const operation = operationFieldsSend[type];

	return Object.entries(operation).reduce((obj, [key, value]) => {
		if (!options[key]) {
			obj[key] = value.default;
			return obj;
		}

		switch (value.type) {
			case 'account_id':
				if (typeof options[key].get === 'function') {
					obj[key] = options[key].get('id');
					break;
				}
				obj[key] = options[key].id;
				// obj[key] = options[key];
				break;
			case 'asset_id':
				if (typeof options[key].get !== 'function') {
					obj[key] = options[key].id;
					break;
				}
				obj[key] = options[key].get('id');
				break;
			case 'asset_object':
				if (options[key].asset) {
					if (typeof options[key].asset.get !== 'function') {
						obj[key] = {
							amount: options[key].amount,
							asset_id: options[key].asset.id,
						};
						break;
					}
					obj[key] = {
						amount: options[key].amount,
						asset_id: options[key].asset.get('id'),
					};
				} else {
					if (typeof options[key].asset_id.get !== 'function') {
						obj[key] = {
							amount: options[key].amount,
							asset_id: options[key].asset_id.id,
						};
						break;
					}
					obj[key] = {
						amount: options[key].amount,
						asset_id: options[key].asset_id.get('id'),
					};
				}
				break;
			default: obj[key] = options[key];
		}

		return obj;

	}, {});
};
