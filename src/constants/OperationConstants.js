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
	createContact: {
		registrar: {
			type: 'account_id',
		},
		fee: {
			type: 'asset_object',
			hasProperties: 'asset_id',
		},
		value: {
			type: 'asset_object',
			hasProperties: 'asset_id',
		},
	},
	createAccount: {
		registrar: {
			type: 'account_id',
		},
		fee: {
			type: 'asset_object',
			hasProperties: 'asset_id',
		},
		referrer: {
			type: 'account_id',
		},
		name: {
			type: 'string',
		},
		active: {
			field: 'key_auths',
		},
		options: {
			field: 'memo_key',
		},
	},
	updateAccount: {
		fee: {
			type: 'asset_object',
			hasProperties: 'asset_id',
		},
		account: {
			type: 'account_id',
		},
		active: {
			field: 'key_auths',
		},
	},
	upgradeAccount: {
		account_to_upgrade: {
			type: 'account_id',
		},
		fee: {
			type: 'asset_object',
			hasProperties: 'asset_id',
		},
		upgrade_to_lifetime_member: {
			field: 'string',
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
	createContact: 'registrar',
	createAccount: 'registrar',
	updateAccount: 'account',
	upgradeAccount: 'account_to_upgrade',
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
	createContact: {
		name: 'Contract Create',
		code: OPERATIONS_IDS.CREATE_CONTRACT,
	},
	createAccount: {
		name: 'Account Create',
		code: OPERATIONS_IDS.ACCOUNT_CREATE,
	},
	updateAccount: {
		name: 'Update account',
		code: OPERATIONS_IDS.ACCOUNT_UPDATE,
	},
	upgradeAccount: {
		name: 'Upgrade account',
		code: OPERATIONS_IDS.ACCOUNT_UPGRADE,
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
