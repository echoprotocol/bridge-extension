class FormatHelper {

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

	static formatError(err) {
		return err instanceof Error ? err.message : err;
	}

	static capitalize(str) {
		return `${str[0].toUpperCase()}${str.slice(1)}`;
	}

}

export default FormatHelper;
