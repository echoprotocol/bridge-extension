import BN from 'bignumber.js';

import { MAX_NOTE_LENGTH } from '../constants/GlobalConstants';

class ValidateSendHelper {

	static amountInput(value, asset) {
		const result = { value: null, error: '', warning: false };

		if (!value.match(/^$|^[0-9]+[.,]?[0-9]*$/)) {
			result.error = 'Amount must contain only digits and dot';
			result.warning = true;
			return result;
		}

		if (/\.|,/.test(value)) {
			const [intPath, doublePath] = value.split(/\.|,/);

			if (doublePath.toString().length === asset.precision && !Math.floor(value.replace(',', '.') * (10 ** asset.precision))) {
				result.error = `Amount should be more than 0 (${asset.symbol} precision is ${asset.precision} symbols)`;

				return result;
			}

			if (doublePath.toString().length > asset.precision) {
				result.error = `${asset.symbol} precision is ${asset.precision}`;
				result.warning = true;

				return result;
			}

			result.value = `${intPath ? Number(intPath) : ''}.${doublePath || ''}`;

			return result;
		}
		result.value = value ? value.toString() : value;


		return result;
	}

	static validateAmount(value, { symbol, precision, balance }) {
		if (!Math.floor(value * (10 ** precision))) {
			return `Amount should be more than 0 (${symbol} precision is ${precision} symbols)`;
		}

		const amount = new BN(value).times(10 ** precision);

		if (!amount.isInteger()) {
			return `${symbol} precision is ${precision} symbols`;
		}

		if (new BN(value).times(10 ** precision).gt(balance)) {
			return 'Insufficient funds';
		}

		return null;
	}

	static validateMemo(memo) {
		if (memo.length >= MAX_NOTE_LENGTH) {
			return 'Note length must be less than 200000 symbols';
		}

		return null;
	}

}

export default ValidateSendHelper;
