import {EXPIRATION_MAX_LAG_SECONDS, GLOBAL_ID_1} from '../src/constants/GlobalConstants';

class SignTransaction {

	get finalized() { return this._finalized; }

	checkNotFinalized() { if (this.finalized) throw new Error('already finalized'); }

	async signInpage() {
		this.checkNotFinalized();
		if (!this.hasAllFees) await this.tr.setRequiredFees();

		this.checkNotFinalized();
		this._finalized = true;
	}

	async sign(tr, privateKey) {
		this.checkNotFinalized();
		if (privateKey !== undefined) tr.addSigner(privateKey);
		if (!this.hasAllFees) await this.setRequiredFees();
		const [dynamicGlobalChainData] = await this.api.getObjects([GLOBAL_ID_1]);
		if (this.expiration === undefined) {
			const headBlockTimeSeconds = Math.ceil(new Date(`${dynamicGlobalChainData.time}Z`).getTime() / 1000);
			const nowSeconds = Math.ceil(new Date().getTime() / 1000);
			// the head block time should be updated every 3 seconds
			// if it isn't then help the transaction to expire (using head_block_sec)
			// if the user's clock is very far behind, use the head block time.
			this.expiration = nowSeconds - headBlockTimeSeconds > EXPIRATION_MAX_LAG_SECONDS ?
				headBlockTimeSeconds : Math.max(nowSeconds, headBlockTimeSeconds);
		}
		const chainId = await this.api.getChainId();
		// one more check to avoid that the sign method was called several times
		// without waiting for the first call to be executed
		this.checkNotFinalized();
		this._finalized = true;
		/**
		 * @private
		 * @type {number|undefined}
		 */
		this._refBlockNum = dynamicGlobalChainData.head_block_number & 0xffff; // eslint-disable-line no-bitwise
		/**
		 * @private
		 * @type {number|undefined}
		 */
		this._refBlockPrefix = Buffer.from(dynamicGlobalChainData.head_block_id, 'hex').readUInt32LE(4);
		const transactionBuffer = toBuffer(transaction, {
			ref_block_num: this.refBlockNum,
			ref_block_prefix: this.refBlockPrefix,
			expiration: this.expiration,
			operations: this.operations,
			extensions: [],
		});
		this._signatures = this._signers.map(({ privateKey }) => {
			const chainBuffer = Buffer.from(chainId, 'hex');
			return Signature.signBuffer(Buffer.concat([chainBuffer, Buffer.from(transactionBuffer)]), privateKey);
		});
	}

}

export default SignTransaction;
