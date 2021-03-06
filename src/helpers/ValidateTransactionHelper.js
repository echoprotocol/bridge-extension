import BN from 'bignumber.js';
import { ERC20_REQIURED_HASHES, CONTRACT_PREFIX } from '../constants/GlobalConstants';

class ValidateTransactionHelper {

	static validateContractId(id) {

		id = id.split('.');

		if (id.length !== 3 || parseInt(id[2], 10).toString() !== id[2] || id.splice(0, 2).join('.') !== CONTRACT_PREFIX) {
			return 'Invalid contract ID';
		}

		return null;
	}

	static validateCode(code) {
		if (!code) {
			return 'Field should be not empty';
		}

		if (!/^[0-9a-fA-F]+$/.test(code)) {
			return 'Field should be hex string';
		}

		if (code.length % 2 !== 0) {
			return 'Code should include an even count of symbol';
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

	static validateAmount(value) {
		if (!value.toString().match(/^[0-9]*[.,]?[0-9]*$/)) {
			return 'Amount must contain only digits and dot';
		}

		if (!Number.isInteger(parseFloat(value))) {
			return 'Amount must be integer';
		}

		if (Number.MAX_SAFE_INTEGER < value) {
			return 'Amount overflow';
		}

		return null;
	}

	static validateAssetId(assetId, balances, account) {
		const balance = balances.find((val) =>
			val.get('owner') === account.id && val.get('asset_type') === assetId);

		if (!balance) {
			return true;
		}

		return null;
	}

	/**
	 *
	 * @param {String} scriptHex
	 * @returns {boolean}
	 */
	static isErc20Contract(scriptHex) {
		if (scriptHex) {
			const hashes = Object.values(ERC20_REQIURED_HASHES);
			return hashes.every((hash) => scriptHex.includes(hash));
		}

		return false;
	}

}

export default ValidateTransactionHelper;
