import { TransactionHelper, Aes, PrivateKey } from 'echojs-lib';

import { lookupAccounts } from './ChainApi';

import {
	MEMO_FEE_KEYS,
	SET_TR_FEE_TIMEOUT,
} from '../constants/GlobalConstants';

import echoService from '../services/echo';

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

export const getOperationFee = async (type, transaction) => {
	const options = JSON.parse(JSON.stringify(transaction));

	if (options.memo) {
		const nonce = TransactionHelper.unique_nonce_uint64();
		const pKey = PrivateKey.fromWif(MEMO_FEE_KEYS.WIF);

		const message = Aes.encryptWithChecksum(
			pKey,
			MEMO_FEE_KEYS.PUBLIC_MEMO_TO,
			nonce,
			Buffer.from(options.memo, 'utf-8'),
		);

		options.memo = {
			from: MEMO_FEE_KEYS.PUBLIC_MEMO_FROM,
			to: MEMO_FEE_KEYS.PUBLIC_MEMO_TO,
			nonce,
			message,
		};
	}

	const { TransactionBuilder } = await echoService.getChainLib();
	const tr = new TransactionBuilder();
	tr.add_type_operation(type, options);

	const start = new Date().getTime();

	await Promise.race([
		tr.set_required_fees(options.fee.asset_id).then(() => (new Date().getTime() - start)),
		new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				clearTimeout(timeoutId);
				reject(new Error('Timeout set required fees'));
			}, SET_TR_FEE_TIMEOUT);
		}),
	]);

	return tr.operations[0][1].fee.amount;
};
