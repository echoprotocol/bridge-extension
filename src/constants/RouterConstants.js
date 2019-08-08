import {
	FORM_SIGN_UP,
	FORM_SIGN_IN,
	FORM_ADD_NETWORK,
	FORM_SEND,
	FORM_WATCH_TOKEN,
	FORM_WELCOME,
} from './FormConstants';

export const CONNECTION_ERROR_PATH = '/connection-error';

export const CREATE_ACCOUNT_PATH = '/accounts/create';
export const CREATE_SUCCESS_PATH = '/accounts/create?success=1';

export const IMPORT_ACCOUNT_PATH = '/accounts/import';
export const IMPORT_SUCCESS_PATH = '/accounts/import?success=1';

export const WELCOME_PATH = '/welcome';
export const NEW_KEY_PATH = '/welcome?key=1';
export const SETTINGS_PATH = '/settings';

export const WALLET_PATH = '/wallet';

export const CREATE_PIN_PATH = '/pin/create';
export const WIPE_PIN_PATH = '/pin/wipe';
export const UNLOCK_PATH = '/pin/unlock';

export const ADD_NETWORK_PATH = '/networks/create';
export const SUCCESS_ADD_NETWORK_PATH = '/networks/success';

export const RECEIVE_PATH = '/receive';

export const TRANSACTIONS_PATH = '/transactions';

export const SEND_PATH = '/send';
export const SUCCESS_SEND_PATH = '/send/success';
export const SUCCESS_SEND_INDEX_PATH = '/send/success?index=1';
export const ERROR_SEND_PATH = '/send/error';
export const NETWORK_ERROR_SEND_PATH = '/send/error?network=1';
export const TRANSACTION_ERROR_SEND_PATH = '/send/error?network=2';
export const ACCOUNT_ERROR_SEND_PATH = '/send/error?account=1';

export const BACKUP_PATH = '/backup';

export const WATCH_TOKEN_PATH = '/tokens/watch';

export const SIGN_TRANSACTION_PATH = '/transaction/sign';

export const POPUP_PATH = 'index.html?windowType=popup&windowPath=:path';

export const ABOUT_PATH = '/about';

export const NETWORK_PATH = '/network';

export const EMPTY_PATH = '/';

export const INDEX_PATH = WALLET_PATH;

export const INCOMING_CONNECTION_PATH = '/incoming-connection';

export const SIGN_MESSAGE_PATH = '/sign-message';

export const PIN_PATHS = [
	CREATE_PIN_PATH,
	UNLOCK_PATH,
	WIPE_PIN_PATH,
];

export const NOT_RETURNED_PATHS = PIN_PATHS.concat([
	IMPORT_ACCOUNT_PATH,
	CREATE_ACCOUNT_PATH,
	CREATE_SUCCESS_PATH,
	IMPORT_SUCCESS_PATH,
	SIGN_TRANSACTION_PATH,
]);

export const HIDE_NAVBAR_PATHS = [
	SUCCESS_SEND_PATH,
	ERROR_SEND_PATH,
	INCOMING_CONNECTION_PATH,
];

export const FORM_TYPES = {
	[FORM_SIGN_UP]: CREATE_ACCOUNT_PATH,
	[FORM_SIGN_IN]: IMPORT_ACCOUNT_PATH,
	[FORM_ADD_NETWORK]: ADD_NETWORK_PATH,
	[FORM_SEND]: SEND_PATH,
	[FORM_WATCH_TOKEN]: WATCH_TOKEN_PATH,
	[FORM_WELCOME]: WELCOME_PATH,
};
