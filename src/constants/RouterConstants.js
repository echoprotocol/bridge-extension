
export const IMPORT_ACCOUNT_PATH = '/accounts/import';
export const CREATE_ACCOUNT_PATH = '/accounts/create';
export const CREATE_SUCCESS_PATH = '/accounts/create?success=1';
export const CREATE_SETTINGS_PATH = '/accounts/create?settings=1';
export const IMPORT_SUCCESS_PATH = '/accounts/import?success=1';
export const IMPORT_SETTINGS_PATH = '/accounts/import?settings=1';
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
export const ERROR_SEND_PATH = '/send/error';
export const NETWORK_ERROR_SEND_PATH = '/send/error?network=1';

export const BACKUP_PATH = '/backup';

export const WATCH_TOKEN_PATH = '/tokens/watch';

export const SIGN_TRANSACTION_PATH = '/transaction/sign';

export const POPUP_PATH = 'index.html?windowType=popup';

export const EMPTY_PATH = '/';

export const INDEX_PATH = WALLET_PATH;

export const PIN_PATHS = [CREATE_PIN_PATH, UNLOCK_PATH, WIPE_PIN_PATH];

export const NOT_RETURNED_PATHS = PIN_PATHS.concat([
	IMPORT_ACCOUNT_PATH,
	CREATE_ACCOUNT_PATH,
	CREATE_SUCCESS_PATH,
	IMPORT_SUCCESS_PATH,
	SIGN_TRANSACTION_PATH,
]);

export const HIDE_NAVBAR_PATHS = [SUCCESS_SEND_PATH, ERROR_SEND_PATH];
