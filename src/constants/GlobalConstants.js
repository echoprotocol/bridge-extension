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
		name: 'Dev Network',
		url: 'ws://195.201.164.54:6311',
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

export const ACCOUNT_COLORS = ['green', 'sky', 'blue', 'pink', 'red', 'yellow', 'lemon'];

export const TIMEOUT = 10 * 60 * 1000;
export const RANDOM_SIZE = 2048;
export const RANDOM_ECHORANDKEY_SIZE = 32;
export const OWNER_KEY = 'owner';
export const ACTIVE_KEY = 'active';
export const MEMO_KEY = 'memo';
export const CORE_SYMBOL = 'ECHO';
export const CORE_ID = '1.3.0';
export const GLOBAL_ID_0 = '2.0.0';
export const GLOBAL_ID_1 = '2.1.0';
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

export const BROADCAST_LIMIT = 20 * 1000;
export const SET_TR_FEE_TIMEOUT = 3 * 1000;
export const GET_TOKENS_TIMEOUT = 3 * 1000;

export const MEMO_FEE_KEYS = {
	WIF: '5KGG3tFb5F4h3aiUSKNnKeDcNbL5y1ZVXQXVqpWVMYhW82zBrNb',
	PUBLIC_MEMO_FROM: 'ECHO7WBUN97NJfSXbDVDqLDQDKu8FasTb7YBdpbWoJF3RYo6qYY6aX',
	PUBLIC_MEMO_TO: 'ECHO7WBUN97NJfSXbDVDqLDQDKu8FasTb7YBdpbWoJF3RYo6qYY6aX',
};
