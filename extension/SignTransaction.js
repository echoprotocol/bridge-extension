import { serializers, Signature } from 'echojs-lib';

import { EXPIRATION_INFELICITY, GLOBAL_ID_1 } from '../src/constants/GlobalConstants';

import echoService from '../src/services/echo';

class SignTransaction {

	get finalized() { return this._finalized; }

	checkNotFinalized() { if (this.finalized) throw new Error('already finalized'); }

	async sign(tr, pKey, operations) {
		this.checkNotFinalized();

		if (pKey !== undefined) tr = tr.addSigner(pKey);

		const dynamicGlobalChainData = await echoService.getChainLib().api.getObject(GLOBAL_ID_1, true);

		const headBlockTimeSeconds = Math.ceil(new Date(`${dynamicGlobalChainData.time}Z`).getTime() / 1000);

		tr.expiration = headBlockTimeSeconds + EXPIRATION_INFELICITY;

		const chainId = await echoService.getChainLib().api.getChainId();

		this.checkNotFinalized();
		tr._finalized = true;

		tr._refBlockNum =
			dynamicGlobalChainData.head_block_number & 0xffff; // eslint-disable-line no-bitwise

		tr._refBlockPrefix = Buffer.from(dynamicGlobalChainData.head_block_id, 'hex').readUInt32LE(4);

		const transactionBuffer = serializers.transaction.serialize({
			ref_block_num: tr._refBlockNum,
			ref_block_prefix: tr._refBlockPrefix,
			expiration: tr.expiration,
			operations,
			extensions: [],
		});		

		tr._signatures = tr._signers.map(({ privateKey }) => {
			const chainBuffer = Buffer.from(chainId, 'hex');
			return Signature
				.signBuffer(Buffer.concat([chainBuffer, Buffer.from(transactionBuffer)]), privateKey);
		});

		const serializedSignatures = tr._signatures.map((signatureBuffer) => signatureBuffer.toBuffer().toString('hex'));

		return {
			ref_block_num: tr._refBlockNum,
			ref_block_prefix: tr._refBlockPrefix,
			expiration: tr.expiration,
			serializedSignatures,
			accountId: operations[0][1].from || operations[0][1].registrar,
		};
	}

}

export default SignTransaction;
