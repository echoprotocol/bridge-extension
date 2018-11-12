import BN from 'bignumber.js';

class ValidateTransactionHelper {

	static validateContractId(id) {
		id = id.split('.');
		if (id.length !== 3 || id.splice(0, 2).join('.') !== '1.16' || Number.isInteger(id[2])) {
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

	static validateAmount(value, asset) {
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


}

export default ValidateTransactionHelper;
