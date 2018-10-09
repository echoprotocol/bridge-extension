import utf8 from 'utf8';

import { events } from '../constants/LogEventConstants';

export default class FormatHelper {

	static toFixed(value, precision) {
		const power = 10 ** precision;

		return (Math.round(value * power) / power).toFixed(precision);
	}

	static formatAmount(amount, precision, symbol) {
		const number = Math.abs(amount / (10 ** precision));

		const base = `${parseInt(this.toFixed(Math.abs(number || 0), precision), 10)}`;
		const mod = base.length > 3 ? base.length % 3 : 0;

		let postfix = `.${this.toFixed(Math.abs(number), precision).split('.')[1]}`;

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

	static toInt(hex) {
		return parseInt(hex, 16);
	}

	static logParser(log) {
		if (!log || !log.length) return [];
		return log.map((l) => {
			const contractId = parseInt(l.address.slice(2), 16);
			const event = events[l.log[0]] || l.log[0];
			const params = l.log.slice(1);
			return { contractId, event, params };
		});
	}

	static getLog(result) {
		const trReceipt = result.tr_receipt;
		return trReceipt ? trReceipt.log : null;
	}

}

