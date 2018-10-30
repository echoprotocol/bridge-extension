import {
	CREATE_ACCOUNT_PATH,
	CREATE_SUCCESS_PATH,
	IMPORT_ACCOUNT_PATH,
	WALLET_PATH,
	IMPORT_SUCCESS_PATH,
	TRANSACTIONS_PATH,
	RECEIVE_PATH,
	SEND_PATH,
	BACKUP_PATH,
	SUCCESS_ADD_NETWORK_PATH,
	WATCH_TOKEN_PATH,
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
		path: TRANSACTIONS_PATH,
		title: 'Transactions history',
	},
	{
		path: WALLET_PATH,
		title: 'Wallet',
	},
	{
		path: RECEIVE_PATH,
		title: 'Receive',
	},
	{
		path: SEND_PATH,
		title: 'Send',
	},
	{
		path: BACKUP_PATH,
		title: 'Backup',
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
	{
		path: SUCCESS_ADD_NETWORK_PATH,
		title: 'Add Network',
	},
	{
		path: WATCH_TOKEN_PATH,
		title: 'Watch token',
	},
];

export const NETWORKS = [
	{
		name: 'devnet',
		registrator: 'https://echo-tmp-wallet.pixelplex.io/faucet/registration',
		url: 'wss://echo-devnet-node.pixelplex.io/ws',
	},
];

export const ACCOUNT_COLORS = ['green', 'sky', 'blue', 'pink', 'red', 'yellow', 'lemon'];

export const TIMEOUT = 10 * 60 * 1000;
export const RANDOM_SIZE = 2048;
export const OWNER_KEY = 'owner';
export const ACTIVE_KEY = 'active';
export const MEMO_KEY = 'memo';
export const CORE_SYMBOL = 'ECHO';
export const CORE_ID = '1.3.0';
export const GLOBAL_ID = '2.1.0';
export const KEY_CODE_ENTER = 13;
export const KEY_CODE_SPACE = 32;
export const ICONS_COUNT = 15;
export const ICON_COLORS_COUNT = 7;
export const BASE_ICON = 1;
export const BASE_ICON_COLOR = 'green';
