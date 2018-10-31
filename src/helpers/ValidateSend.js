class ValidateSend {

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

}

export default ValidateSend;
