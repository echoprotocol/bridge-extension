import { OPERATIONS_IDS } from 'echojs-lib';

export const operationFields = {
	transfer: {
		fee: {
			type: 'asset_object',
			hasProperties: 'asset_id',
		},
		from: {
			type: 'account_id',
		},
		to: {
			type: 'account_id',
		},
		amount: {
			type: 'asset_object',
			hasProperties: 'asset_id',
		},
		memo: {
			field: 'message',
		},
	},
	contract: {
		fee: {
			type: 'asset_object',
			hasProperties: 'asset_id',
		},
		registrar: {
			type: 'account_id',
		},
		value: {
			type: 'asset_object',
			hasProperties: 'asset_id',
		},
	},
};

export const operationFieldsSend = {
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
	[OPERATIONS_IDS.CALL_CONTRACT]: {
		fee: {
			type: 'asset_object',
			required: false,
			hasProperties: ['amount', 'asset_id'],
		},
		registrar: {
			type: 'account_id',
			required: true,
		},
		callee: {
			type: 'account_id',
			required: false,
		},
		value: {
			type: 'asset_object',
			hasProperties: 'asset_id',
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
	[OPERATIONS_IDS.CALL_CONTRACT]: 'registrar',
};

export const operationTypes = {
	transfer: {
		name: 'Transfer',
		code: 0,
	},
	contract: {
		name: 'Contract',
		code: OPERATIONS_IDS.CALL_CONTRACT,
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
		value: ['Contract created', 'Call contract', 'Contract transfer'],
		type: 'Contract',
	},
];
