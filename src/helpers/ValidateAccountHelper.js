import { ChainValidation } from 'echojs-lib';

export default class ValidateAccountHelper {

	static validateAccountName(accountName) {
		if (!accountName) {
			return 'Account name should not be empty';
		}

		if (ChainValidation.is_account_name_error(accountName)) {
			return ChainValidation.is_account_name_error(accountName);
		}

		if (!ChainValidation.is_cheap_name(accountName)) {
			return 'Enter a name containing least one dash, a number or no vowels';
		}

		return null;
	}

}
