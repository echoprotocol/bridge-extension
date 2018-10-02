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

export const validateAccountExist = (
	instance,
	accountName,
	shouldExist,
	requestsCount = 0,
	limit = 50,
) => {
	if (requestsCount === 10) {
		return requestsCount;
	}
	instance.dbApi().exec('lookup_accounts', [accountName, limit])
		.then(async (result) => {
			if (!result.find((i) => i[0] === accountName) && shouldExist) {
				return 'Account not found';
			}

			if (result.find((i) => i[0] === accountName) && !shouldExist) {
				await validateAccountExist(instance, accountName, shouldExist, requestsCount += 1);
				return 'Account name is already taken';
			}

			return null;
		});
	return null;
};

export const createWallet = async (account) => {
	const password = (`P${key.get_random_key().toWif()}`).substr(0, 45);

	const owner = generateKeyFromPassword(account, 'owner', password);
	const active = generateKeyFromPassword(account, 'active', password);
	const memo = generateKeyFromPassword(account, 'memo', password);

	let response = await fetch('https://echo-tmp-wallet.pixelplex.io/faucet/registration', {
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

	return active.privateKey.toWif();
};
