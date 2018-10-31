import { TransactionHelper, Aes, PrivateKey, ops } from 'echojs-lib';

import { lookupAccounts } from './ChainApi';

import { MEMO_FEE_KEYS } from '../constants/GlobalConstants';

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
	networkName,
) => {
	const result = await lookupAccounts(accountName, limit);

	if (!result.find((i) => i[0] === accountName)) {

		return `This account does not exist on ${networkName}`;
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

export const getMemoFee = (global, memo) => {
	const nonce = TransactionHelper.unique_nonce_uint64();
	const pKey = PrivateKey.fromWif(MEMO_FEE_KEYS.WIF);

	const message = Aes.encryptWithChecksum(pKey, MEMO_FEE_KEYS.PUBLIC_MEMO_TO, nonce, Buffer.from(memo, 'utf-8'));

	const memoObject = {
		from: MEMO_FEE_KEYS.PUBLIC_MEMO_FROM,
		to: MEMO_FEE_KEYS.PUBLIC_MEMO_TO,
		nonce,
		message,
	};

	const serialized = ops.memo_data.fromObject(memoObject);
	const stringified = JSON.stringify(ops.memo_data.toHex(serialized));
	const byteLength = Buffer.byteLength(stringified, 'hex');

	const optionFee = global.getIn(['parameters', 'current_fees', 'parameters', 0, 1, 'price_per_kbyte']);

	return optionFee * (byteLength / 1024);
};
