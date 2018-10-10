import { PrivateKey, key } from 'echojs-lib';

export const generateKeyFromPassword = (accountName, role, password) => {
	const seed = `${accountName}${role}${password}`;
	const privateKey = PrivateKey.fromSeed(seed);
	const publicKey = privateKey.toPublicKey().toString();

	return { privateKey, publicKey };
};

export const getKeyFromWif = (wif) => {
	try {
		const privateKey = PrivateKey.fromWif(wif);
		return privateKey;
	} catch (err) {
		return null;
	}
};

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

export const createWallet = async (registrator, account) => {
	const password = (`P${key.get_random_key().toWif()}`).substr(0, 45);
	// TODO change crypto password
	// const password = userCrypto.generateWIF();

	const owner = generateKeyFromPassword(account, 'owner', password);
	const active = generateKeyFromPassword(account, 'active', password);
	const memo = generateKeyFromPassword(account, 'memo', password);

	let response = await fetch(registrator, {
		method: 'post',
		mode: 'cors',
		headers: {
			Accept: 'application/json',
			'Content-type': 'application/json',
		},
		body: JSON.stringify({
			name: account,
			owner_key: owner.publicKey,
			active_key: active.publicKey,
			memo_key: memo.publicKey,
		}),
	});

	response = await response.json();

	if (!response || (response && response.errors)) {
		throw response.errors.join();
	}

	// return password;
	return active.privateKey.toWif();
};

export const importWallet = (account, password) => {

	const privateKey = getKeyFromWif(password);
	let passKey;

	if (privateKey) {
		passKey = {
			privateKey,
			publicKey: privateKey.toPublicKey().toString(),
		};
	}

	if (!account) { return null; }

	if (!privateKey) {
		passKey = generateKeyFromPassword(account.get('name'), 'active', password);
	}

	if (account.getIn(['active', 'key_auths', '0', '0']) !== passKey.publicKey) {
		return 'Invalid password';
	}

	return null;
};
