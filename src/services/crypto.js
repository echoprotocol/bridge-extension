import { Aes, PrivateKey } from 'echojs-lib';
import random from 'crypto-random-string';

import Storage from './storage';

const storage = new Storage();
let TIMEOUT = 10 * 60 * 1000;
let aes;

class CryptoSecret {

	/**
	 *  @method getRandomBuffer
	 *
	 *  Method get random wallet key.
	 *  If this is a first launch, generate and save key in storage.
	 *  Next time get key in storage and decrypt.
	 *
	 *  @return {Buffer} randomBuffer
	 */
	static getRandomBuffer() {
		let randomBuffer = Buffer.from(random(32));
		let randomKey = storage.get('randomKey');

		if (randomKey) {
			randomBuffer = aes.decryptHexToBuffer(randomKey);
		} else {
			randomKey = aes.encryptToHex(randomBuffer);
			storage.set('randomKey', randomKey);
		}

		return randomBuffer;
	}

	/**
	 *  @method aesRequired
	 *
	 *  If aes is empty, throw error.
	 */
	static aesRequired() {
		if (!aes) {
			throw new Error('Unlock required.');
		}
	}

	/**
	 *  @method getPrivateKey
	 *
	 *  Generate private key from seed, using in desktop app.
	 *
	 *  @param {String} username
	 *  @param {String} password
	 *  @param {String} role - optional
	 *
	 *  @return {PrivateKey} privateKey
	 */
	static getPrivateKey(username, password, role = 'active') {
		const seed = `${username}${role}${password}`;
		const privateKey = PrivateKey.fromSeed(seed);
		return privateKey;
	}

	/**
	 *  @method timeout
	 *
	 *  Set timeout, when it expired - clear aes object
	 *
	 *  @param {Number} milliseconds - optional
	 */
	static timeout(milliseconds) {
		if (milliseconds) {
			TIMEOUT = milliseconds;
		}

		setTimeout(() => { aes = null; }, TIMEOUT);
	}

}

export default class Crypto {

	/**
	 *  @constructor
	 *
	 * 	Create aes and set expired timout
	 *
	 *  @param {String} pin
	 *  @param {Number} milliseconds - optional
	 */
	constructor(pin, milliseconds) {
		if (!pin || typeof pin !== 'string') {
			throw new Error('Key required.');
		}

		aes = Aes.fromSeed(pin);
		const randomBuffer = CryptoSecret.getRandomBuffer();
		aes = Aes.fromSeed(randomBuffer);

		CryptoSecret.timeout(milliseconds);
	}

	/**
	 *  @method generateWIF
	 *
	 * 	Generate random string and private key from this seed.
	 *
	 *  @return {String} privateKeyWIF
	 */
	generateWIF() {
		CryptoSecret.aesRequired();

		const privateKey = PrivateKey.fromSeed(random(32));

		return privateKey.toWif();
	}

	/**
	 *  @method importByWIF
	 *
	 *  Get private key from WIF.
	 *  Encrypt private key.
	 * 	Save encrypted private key.
	 *
	 *  @param {String} wif
	 */
	importByWIF(wif) {
		CryptoSecret.aesRequired();

		const privateKey = PrivateKey.fromWif(wif);
		const encryptedPrivateKey = aes.encryptToHex(privateKey.toBuffer());
		const publicKey = privateKey.toPublicKey();

		storage.set(publicKey.toString(), encryptedPrivateKey);
	}

	/**
	 *  @method importByPassword
	 *
	 *  Get private key from username and password.
	 *  Encrypt private key.
	 *  Save encrypted private key.
	 *
	 *  @param {String} username
	 *  @param {String} password
	 */
	importByPassword(username, password) {
		CryptoSecret.aesRequired();

		const privateKey = CryptoSecret.getPrivateKey(username, password);
		const encryptedPrivateKey = aes.encryptToHex(privateKey.toBuffer());
		const publicKey = privateKey.toPublicKey();

		storage.set(publicKey.toString(), encryptedPrivateKey);

	}

	/**
	 *  @method isWIF
	 *
	 *  Check string is WIF.
	 *
	 *  @param {String} passwordOrWIF
	 *
	 *  @return {Boolean} isWIF
	 */
	isWIF(passwordOrWIF) {
		try {
			PrivateKey.fromWif(passwordOrWIF);
			return true;
		} catch (err) {
			return false;
		}
	}

	/**
	 *  @method unlock
	 *
	 *  Create aes object and set expired timeout.
	 *
	 *  @param {String} pin
	 */
	unlock(pin) {
		if (!pin || typeof pin !== 'string') {
			throw new Error('Key required.');
		}

		aes = Aes.fromSeed(pin);
		const randomBuffer = CryptoSecret.getRandomBuffer();
		aes = Aes.fromSeed(randomBuffer);

		CryptoSecret.timeout();
	}

	/**
	 *  @method lock
	 *
	 *  Delete aes object.
	 */
	lock() {
		aes = null;
	}

	/**
	 *  @method isLocked
	 *
	 *  Check aes object is empty.
	 *
	 *  @return {Boolean} isLocked
	 */
	isLocked() {
		return !aes;
	}

	/**
	 *  @method sign
	 *
	 *  Add sign in transaction by public key.
	 *
	 *  @param {Transaction} transaction
	 *  @param {String} publicKeyString
	 *
	 *  @return {Transaction} signedTransaction
	 */
	sign(transaction, publicKeyString) {
		if (!aes) {
			throw new Error('Unlock required.');
		}

		const encryptedPrivateKey = storage.get(publicKeyString);

		if (!encryptedPrivateKey) {
			throw new Error('Key not found.');
		}

		const privateKeyBuffer = aes.decryptHexToBuffer(encryptedPrivateKey);
		const privateKey = PrivateKey.fromBuffer(privateKeyBuffer);

		transaction.add_signer(privateKey);
		return transaction;
	}

}
