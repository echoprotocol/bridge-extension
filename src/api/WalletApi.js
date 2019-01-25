import { aes, PrivateKey } from 'echojs-lib';

import {
	MEMO_FEE_KEYS,
	SET_TR_FEE_TIMEOUT,
} from '../constants/GlobalConstants';

import echoService from '../services/echo';

const getOperationFee = async (type, transaction, core) => {
	const options = JSON.parse(JSON.stringify(transaction));

	if (options.memo) {
		const nonce = null;
		const pKey = PrivateKey.fromWif(MEMO_FEE_KEYS.WIF);

		const message = aes.encryptWithChecksum(
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

	const tr = echoService.getChainLib().createTransaction();

	tr.addOperation(type, options);

	const start = new Date().getTime();

	await Promise.race([
		tr.setRequiredFees(core.id).then(() => (new Date().getTime() - start)),
		new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				clearTimeout(timeoutId);
				reject(new Error('Timeout set required fees'));
			}, SET_TR_FEE_TIMEOUT);
		}),
	]);

	return tr._operations[0][1].fee.amount; // eslint-disable-line no-underscore-dangle
};

export default getOperationFee;
