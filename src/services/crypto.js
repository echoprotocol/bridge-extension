export default class Crypto {

	constructor(pin) {
		return pin;
	}

	generateWIF() {
		return null;
	}

	importByWIF(wif) {
		return wif;
	}

	importByPassword(username, password) {
		return { username, password };
	}

	isWIF(password) {
		return password;
	}

	unlock(pin) {
		return pin;
	}

	sign(transaction) {
		return transaction;
	}

}
