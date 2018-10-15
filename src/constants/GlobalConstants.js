import {
	CREATE_ACCOUNT_PATH,
	CREATE_SUCCESS_PATH,
	IMPORT_ACCOUNT_PATH,
	WALLET_PATH,
	IMPORT_SUCCESS_PATH,
} from './RouterConstants';

export const HEADER_TITLE = [
	{
		path: CREATE_ACCOUNT_PATH,
		title: 'Create account',
		link: {
			name: 'Import account',
			value: IMPORT_ACCOUNT_PATH,
		},
	},
	{
		path: IMPORT_ACCOUNT_PATH,
		title: 'Import account',
		link: {
			name: 'Create account',
			value: CREATE_ACCOUNT_PATH,
		},
	},
	{
		path: CREATE_SUCCESS_PATH,
	},
	{
		path: IMPORT_SUCCESS_PATH,
	},
	{
		path: WALLET_PATH,
		title: 'Wallet',
	},
];

export const NETWORKS = [
	{
		name: 'devnet',
		registrator: 'https://echo-tmp-wallet.pixelplex.io/faucet/registration',
		url: 'wss://echo-devnet-node.pixelplex.io/ws',
	},
];

export const TIMEOUT = 10 * 60 * 1000;
export const RANDOM_SIZE = 2048;
export const OWNER_KEY = 'owner';
export const ACTIVE_KEY = 'active';
export const MEMO_KEY = 'memo';
export const ECHO = 'ECHO';
