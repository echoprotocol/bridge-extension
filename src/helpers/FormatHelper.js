import _ from 'lodash';
import BN from 'bignumber.js';
import utf8 from 'utf8';

class FormatHelper {

	static toFixed(value, precision) {

		return value.toFixed(precision).toString(10);
	}

	static formatAmount(amount, precision, symbol) {
		if (amount === undefined) {
			return '–';
		}
		const number = new BN(amount).div(10 ** precision);

		const base = `${this.toFixed(number, precision).split('.')[0]}`;
		const mod = base.length > 3 ? base.length % 3 : 0;
		let postfix = `.${this.toFixed(number, precision).split('.')[1]}`;

		for (let i = postfix.length - 1; i >= 0; i -= 1) {
			if (postfix[i] === '0') {
				postfix = postfix.substr(0, postfix.length - 1);
			} else if (postfix[i] === '.') {
				postfix = '';
			} else {
				break;
			}
		}

		const resultNumber = (mod ? `${base.substr(0, mod)} ` : '')
            + base.substr(mod).replace(/(\d{3})(?=\d)/g, `$1${' '}`)
            + (precision ? postfix : '');

		return symbol ? `${resultNumber} ${symbol}` : resultNumber;
	}

	static convertAmount(amount, precision, sumbol) {
		const formatAmount = this.formatAmount(amount, precision);
		if (!this.isAmountVeryBig(amount, precision, sumbol)) {
			return formatAmount;
		}
		const length = amount.indexOf('.') === -1 ? 18 - sumbol.length : 19 - sumbol.length;
		return formatAmount.substring(0, length).trim().concat('...');
	}
	static isAmountVeryBig(amount = 0, precision = 0, sumbol = '') {
		return new BN(amount).div(10 ** precision).toString(10).length + sumbol.length > 17;
	}

	static formatError(err) {
		return err instanceof Error || (_.isObject(err) && err.message) ? err.message : err;
	}

	static capitalize(str) {
		return `${str[0].toUpperCase()}${str.slice(1)}`;
	}

	static toUtf8(hex) {
		let str = '';

		for (let i = 0; i < hex.length; i += 2) {
			const code = parseInt(hex.substr(i, 2), 16);
			if (code !== 0) {
				str += String.fromCharCode(code);
			}
		}
		let result = str;
		try {
			result = utf8.decode(str);
		} catch (error) {
			result = str;
		}
		return result;
	}

	static formatOperationKey(value) {
		return FormatHelper.capitalize(value).replace(/_/g, ' ');
	}

}

export default FormatHelper;
