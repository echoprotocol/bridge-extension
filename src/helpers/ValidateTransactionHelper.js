import BN from 'bignumber.js';
import echoService from '../services/echo';

class ValidateTransactionHelper {

	static validateAddress(value) {
		const { ChainValidation } = echoService.getChainLib();
		return ChainValidation.is_object_id(value) ? null : 'value should be in object id format';
	}

	static validateAssetId() {

	}

	static validateContractId(id) {
		id = id.split('.');
		if (id.length !== 3 || id.splice(0, 2).join('.') !== '1.16' || Number.isInteger(id[2])) {
			return 'Invalid contract ID';
		}
		return null;
	}

	static validateCode(code) {
		if (!code) {
			return 'field should be not empty';
		}

		if (!/^[0-9a-fA-F]+$/.test(code)) {
			return 'field should be hex string';
		}

		if (code.length % 2 !== 0) {
			return 'code should include an even count of symbol';
		}

		return null;
	}

	static validateFee(amount, currency, fee, assets) {
		if (currency && currency.id === fee.asset.id) {
			const total = new BN(amount.value).times(10 ** currency.precision).plus(fee.value);

			if (total.gt(currency.balance)) {
				return 'Insufficient funds';
			}
		} else {
			const asset = assets.find((i) => i.id === fee.asset.id);
			if (new BN(fee.value).gt(asset.balance)) {
				return 'Insufficient funds';
			}
		}

		return null;
	}

}

export default ValidateTransactionHelper;
