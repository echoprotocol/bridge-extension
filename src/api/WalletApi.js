import { aes, PrivateKey } from 'echojs-lib';

import { MEMO_FEE_KEYS } from '../constants/GlobalConstants';

import echoService from '../services/echo';

const getOperationFee = async (type, transaction) => {
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

	let tr = echoService.getChainLib().createTransaction();

	if (type === 48) {
		options.fee = undefined;
	}

	tr = tr.addOperation(type, options);

	tr = await tr.setRequiredFees();

	return tr._operations[0][1].fee.amount; // eslint-disable-line no-underscore-dangle
};

export default getOperationFee;
