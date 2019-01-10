import { CORE_ID } from './GlobalConstants';

export const operationFields = {
	transfer: {
		fee: {
			type: 'asset_object',
			required: false,
			hasProperties: ['amount', 'asset_id'],
		},
		from: {
			type: 'account_id',
			required: true,
		},
		to: {
			type: 'account_id',
			required: true,
		},
		amount: {
			type: 'asset_object',
			required: true,
			hasProperties: ['amount', 'asset_id'],
		},
		memo: {
			type: 'string',
			required: false,
		},
	},
	contract: {
		fee: {
			type: 'asset_object',
			required: false,
			hasProperties: ['amount', 'asset_id'],
		},
		registrar: {
			type: 'account_id',
			required: true,
		},
		receiver: {
			type: 'account_id',
			required: false,
		},
		asset_id: {
			type: 'asset_id',
			required: false,
			default: CORE_ID,
		},
		value: {
			type: 'number',
			required: false,
			default: 0,
		},
		gasPrice: {
			type: 'number',
			required: false,
			default: 0,
		},
		gas: {
			type: 'number',
			required: false,
			default: 4700000,
		},
		code: {
			type: 'string',
			required: true,
		},
	},
};

export const operationKeys = {
	transfer: 'from',
	contract: 'registrar',
};

export const operationTypes = {
	transfer: {
		name: 'Transfer',
		code: 0,
	},
	contract: {
		name: 'Contract',
		code: 47,
	},
};

export const historyOperations = [
	{
		value: 'Sent',
		type: 'Sent',
	},
	{
		value: 'Account created',
		type: 'Account',
	},
	{
		value: 'Contract created',
		type: 'Contract',
	},
];
