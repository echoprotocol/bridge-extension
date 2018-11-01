import BN from 'bignumber.js';

class ValidateSendHelper {

	static amountInput(value, currency) {
		if (!value.match(/^[0-9]*[.,]?[0-9]*$/)) {
			return { value: null, error: 'Amount must contain only digits and dot' };
		}

		if (value.replace(',', '.') !== '' && !Math.floor(value.replace(',', '.') * (10 ** currency.precision))) {
			return { value: null, error: `Amount should be more than 0 (${currency.symbol} precision is ${currency.precision} symbols)` };
		}

		if (/\.|,/.test(value)) {
			const [intPath, doublePath] = value.split(/\.|,/);
			value = `${intPath ? Number(intPath) : ''}.${doublePath || ''}`;
		} else {
			value = value ? Number(value).toString() : value;
		}

		return { value, error: null };
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
