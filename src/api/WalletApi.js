import { PrivateKey } from 'echojs-lib';

import { lookupAccounts } from './ChainApi';

export const validateAccountExist = async (
	accountName,
	requestsCount = 0,
	limit = 50,
) => {

	if (requestsCount === 10) {
		return {
			example: '',
			error: 'Account with such name already exists.',
		};
	}

	const result = await lookupAccounts(accountName, limit);

	if (result.find((i) => i[0] === accountName)) {

		const matches = accountName.match(/\d+$/);
		if (matches) {
			accountName =
                accountName.substr(0, matches.index) + (parseInt(matches[0], 10) + 1);
		} else {
			accountName += 1;
		}

		const { example, error } = await validateAccountExist(
			accountName,
			requestsCount += 1,
		);

		return { example, error };
	}

	if (requestsCount === 0) {
		accountName = null;
	}

	return {
		example: accountName,
		error: accountName && 'Account with such name already exists.',
	};
};

export const validateImportAccountExist = async (
	accountName,
	limit = 50,
) => {
	const result = await lookupAccounts(accountName, limit);

	if (!result.find((i) => i[0] === accountName)) {
		return 'Account not found';
	}
	return null;
};

export const createWallet = async (registrator, account, wif) => {
	const publicKey = PrivateKey.fromWif(wif).toPublicKey().toString();

	let response = await fetch(registrator, {
		method: 'post',
		mode: 'cors',
		headers: {
			Accept: 'application/json',
			'Content-type': 'application/json',
		},
		body: JSON.stringify({
			name: account,
			owner_key: publicKey,
			active_key: publicKey,
			memo_key: publicKey,
		}),
	});

	response = await response.json();

	if (!response || (response && response.errors)) {
		throw response.errors.join();
	}
};

export const sendTransaction = async (options) => (Promise.all(options));
// {
// 	const tr = new TransactionBuilder();
// 	tr.add_type_operation(operation, options);
//
// 	await tr.set_required_fees(options.asset_id);
// 	tr.add_signer(privateKey);
//
// 	return tr.broadcast();
// };
