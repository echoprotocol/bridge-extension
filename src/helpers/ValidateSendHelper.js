import BN from 'bignumber.js';

class ValidateSendHelper {

	static amountInput(value, asset) {
		const result = { value: null, error: '' };

		if (!value.match(/^[0-9]*[.,]?[0-9]*$/)) {
			result.error = 'Amount must contain only digits and dot';
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

				return result;
			}

			result.value = `${intPath ? Number(intPath) : ''}.${doublePath || ''}`;
		}
		result.value = value ? Number(value).toString() : value;


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

}

export default ValidateSendHelper;
