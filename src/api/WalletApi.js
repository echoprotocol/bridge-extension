import { PrivateKey } from 'echojs-lib';

export const validateAccountExist = async (
	instance,
	accountName,
	requestsCount = 0,
	limit = 50,
) => {

	if (requestsCount === 10) {
		return {
			example: '',
			errorText: 'Account with such name already exists.',
		};
	}

	const result = await instance.dbApi().exec('lookup_accounts', [accountName, limit]);

	if (result.find((i) => i[0] === accountName)) {

		const matches = accountName.match(/\d+$/);
		if (matches) {
			accountName =
                accountName.substr(0, matches.index) + (parseInt(matches[0], 10) + 1);
		} else {
			accountName += 1;
		}

		const { example, errorText } = await validateAccountExist(
			instance,
			accountName,
			requestsCount += 1,
		);

		return { example, errorText };
	}

	if (requestsCount === 0) {
		accountName = null;
	}

	return {
		example: accountName,
		errorText: accountName && 'Account with such name already exists.',
	};
};

export const validateImportAccountExist = async (
	instance,
	accountName,
	limit = 50,
) => {
	const result = await instance.dbApi().exec('lookup_accounts', [accountName, limit]);

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
