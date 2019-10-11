import { constants } from 'echojs-lib';

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
	ADD_NETWORK_PATH,
	SUCCESS_ADD_NETWORK_PATH,
	WATCH_TOKEN_PATH,
	ABOUT_PATH,
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
		path: SUCCESS_ADD_NETWORK_PATH,
		title: 'Add Network',
	},
	{
		path: ADD_NETWORK_PATH,
		title: 'Add Network',
	},
	{
		path: WATCH_TOKEN_PATH,
		title: 'Watch token',
	},
	{
		path: ABOUT_PATH,
		title: 'About Bridge',
	},
];


export const NETWORKS = [
	{
		name: 'Testnet',
		url: 'wss://testnet.echo-dev.io/ws',
		explorer: 'https://explorer.echo-dev.io',
	},
	{
		name: 'Devnet',
		url: 'wss://devnet.echo-dev.io/ws',
		explorer: 'http://656-echo-explorer.pixelplex-test.by',
	},
];

export const APP_ID = 'BRIDGE_EXTENSION';

export const POPUP_WIDTH = 362;
export const POPUP_HEIGHT = 591;

export const APPROVED_STATUS = 'approved';
export const CANCELED_STATUS = 'canceled';
export const CLOSE_STATUS = 'close';
export const OPEN_STATUS = 'open';
export const COMPLETE_STATUS = 'complete';
export const ERROR_STATUS = 'error';
export const DISCONNECT_STATUS = 'disconnect';
export const CONNECT_STATUS = 'connect';
export const SIGN_STATUS = 'sign';
export const NOT_LOGGED_STATUS = 'not logged';

export const ACCOUNT_COLORS = ['green', 'sky', 'blue', 'pink', 'red', 'yellow', 'lemon'];

export const TIMEOUT = 2 * 60 * 1000;
export const RANDOM_SIZE = 2048;
export const OWNER_KEY = 'owner';
export const ACTIVE_KEY = 'active';
export const MEMO_KEY = 'memo';
export const CORE_SYMBOL = 'ECHO';
export const CONTRACT_PREFIX = `${constants.CHAIN_TYPES.RESERVED_SPACE_ID.PROTOCOL}.${constants.PROTOCOL_OBJECT_TYPE_ID.CONTRACT}`;
export const ASSET_PREFIX = `${constants.CHAIN_TYPES.RESERVED_SPACE_ID.PROTOCOL}.${constants.PROTOCOL_OBJECT_TYPE_ID.ASSET}`;
export const CORE_ID = `${ASSET_PREFIX}.0`;
export const GLOBAL_ID_0 = constants.DYNAMIC_GLOBAL_OBJECT_ID;
export const GLOBAL_ID_1 = `${constants.CHAIN_TYPES.RESERVED_SPACE_ID.IMPLEMENTATION}.${constants.CHAIN_TYPES.IMPLEMENTATION_OBJECT_TYPE_ID.DYNAMIC_GLOBAL_PROPERTY}.1`;
export const EXPIRATION_INFELICITY = 5 * 60;
export const KEY_CODE_ENTER = 13;
export const KEY_CODE_SPACE = 32;
export const KEY_CODE_TAB = 9;
export const KEY_CODE_ARROW_UP = 38;
export const KEY_CODE_ARROW_DOWN = 40;
export const ICONS_COUNT = 15;
export const ICON_COLORS_COUNT = 7;
export const BASE_ICON = 1;
export const BASE_ICON_COLOR = 'green';
export const POPUP_WINDOW_TYPE = 'popup';

export const MAX_NOTE_LENGTH = 200 * 1000;
export const DRAFT_STORAGE_KEY = 'draft';

export const BROADCAST_LIMIT = 20 * 1000;
export const SET_TR_FEE_TIMEOUT = 3 * 1000;
export const GET_TOKENS_TIMEOUT = 3 * 1000;

export const CONNECTION_TIMEOUT = 5000;
export const MAX_RETRIES = 999999999;
export const PING_TIMEOUT = 7000;
export const PING_INTERVAL = 7000;

export const ALGORITHM = 'aes-256-cbc';
export const SCRYPT_ALGORITHM_PARAMS = {
	N: 2 ** 14,
	r: 8,
	p: 1,
	l: 32,
	SALT_BYTES_LENGTH: 256,
};
export const ALGORITHM_IV_BYTES_LENGTH = 16;
export const STORE = 'keyval';

export const PATTERN_ID_MESSAGE = '*';
export const LENGTH_ID_MESSAGE = 10;

export const ERC20_HASHES = {
	'totalSupply()': '18160ddd',
	'balanceOf(address)': '70a08231',
	'allowance(address,address)': 'dd62ed3e',
	'transfer(address,uint256)': 'a9059cbb',
	'approve(address,uint256)': '095ea7b3',
	'transferFrom(address,address,uint256)': '23b872dd',
	'Transfer(address,address,uint256)': 'ddf252ad',
	'decimals()': '313ce567',
	'symbol()': '95d89b41',
};
