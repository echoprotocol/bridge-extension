import { validators } from 'echojs-lib';

class ValidateAccountHelper {

	static validateAccountName(accountName) {
		if (!(/[.\-/0-9]/.test(accountName) || !accountName.match(/[aeiouy]/ig))) {
			return 'Account name should contain digit, number, dash, slash or consist only of consonants';
		}
		if (!accountName) {
			return 'Account name should not be empty';
		}

		if (validators.checkAccountName(accountName)) {
			return validators.checkAccountName(accountName);
		}

		return null;
	}

	static validatePassword(password) {
		if (!password) { return 'Password should not be empty'; }

		if (password.length !== 0 && password.length < 8) {
			return 'Password must be 8 characters or more';
		}

		return null;
	}

}

export default ValidateAccountHelper;
