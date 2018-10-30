import { TransactionHelper, Aes, PrivateKey, ops } from 'echojs-lib';

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

export const getMemoFee = (global, memo) => {
	const nonce = TransactionHelper.unique_nonce_uint64();
	const pKey = PrivateKey.fromWif('5KGG3tFb5F4h3aiUSKNnKeDcNbL5y1ZVXQXVqpWVMYhW82zBrNb');
	const memoFromKey = 'ECHO7WBUN97NJfSXbDVDqLDQDKu8FasTb7YBdpbWoJF3RYo6qYY6aX';
	const memoToKey = 'ECHO7WBUN97NJfSXbDVDqLDQDKu8FasTb7YBdpbWoJF3RYo6qYY6aX';

	const message = Aes.encryptWithChecksum(pKey, memoToKey, nonce, Buffer.from(memo, 'utf-8'));

	const memoObject = {
		from: memoFromKey,
		to: memoToKey,
		nonce,
		message,
	};

	const serialized = ops.memo_data.fromObject(memoObject);
	const stringified = JSON.stringify(ops.memo_data.toHex(serialized));
	const byteLength = Buffer.byteLength(stringified, 'hex');

	const optionFee = global.getIn(['parameters', 'current_fees', 'parameters', 0, 1, 'price_per_kbyte']);

	return optionFee * (byteLength / 1024);
};

export const sendTransaction = async (signedTransaction, operation, options) => {
	signedTransaction.add_type_operation(operation, options);

	await signedTransaction.set_required_fees(options.asset_id);

	return signedTransaction.broadcast();
};
