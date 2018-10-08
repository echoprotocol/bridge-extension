export default class ValidateAccountHelper {

	static validateNetworkName(name) {
		if (!name) {
			return 'Network name should not be empty';
		}

		if (name.length < 2) {
			return 'Network name must be 2 characters or more';
		}

		if (name.length > 32) {
			return 'Network name must be 32 characters or less';
		}

		if (!name.match(/^[a-zA-Z0-9._ ]+$/)) {
			return 'Network name should have only latin letters, numbers, dots, underscores and spaces';
		}

		return null;
	}

	static validateNetworkAddress(address) {
		if (!address) {
			return 'Network address should not be empty';
		}

		if (!(/ws:\/\/|wss:\/\//i).test(address)) {
			return 'Network address should be start with \'ws://\' or \'wss://\'';
		}

		return null;
	}

	static validateNetworkRegistrator(registrator) {
		if (!registrator) {
			return 'Network registrator should not be empty';
		}

		if (!(/http:\/\/|https:\/\//i).test(registrator)) {
			return 'Network registrator should be start with \'http://\' or \'https://\'';
		}

		return null;
	}

}
