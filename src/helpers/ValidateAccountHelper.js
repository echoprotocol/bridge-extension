import { validators } from 'echojs-lib';

class ValidateAccountHelper {

	static validateAccountName(accountName) {

		if (!accountName) {
			return 'Account name should not be empty';
		}

		if (validators.checkAccountName(accountName)) {
			return validators.checkAccountName(accountName);
		}

		if (!validators.checkCheapName(accountName)) {
			return 'Enter a name containing least one dash, a number or no vowels';
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
