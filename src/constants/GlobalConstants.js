import {
	INDEX_PATH,
	IMPORT_ACCOUNT_PATH,
	WIF_PATH,
} from './RouterConstants';

export const HEADER_TITLE = [
	{
		path: INDEX_PATH,
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
			value: INDEX_PATH,
		},
	},
	{
		path: WIF_PATH,
	},
];

export const NETWORKS = [
// 	{
// 		name: 'mainnet',
// 		registrator: 'https://echo-tmp-wallet.pixelplex.io/faucet/registration',
// 		url: 'wss://echo-devnet-node.pixelplex.io/ws',
// 	},
	{
		name: 'devnet',
		registrator: 'https://echo-tmp-wallet.pixelplex.io/faucet/registration',
		url: 'wss://echo-devnet-node.pixelplex.io/ws',
	},
];
