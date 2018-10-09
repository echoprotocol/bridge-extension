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

	isWIF() {
		return false;
	}

	unlock(pin) {
		return pin;
	}

	sign(transaction) {
		return transaction;
	}

	isLocked() {
		return false;
	}

}
