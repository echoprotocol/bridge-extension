import { Aes, PrivateKey } from 'echojs-lib';
import random from 'crypto-random-string';
import EventEmitter from 'events';

import storage from './storage';

class AesStorage {

	/**
	 *  @constructor
	 *
	 * 	Init aes and timeout variables.
	 */
	constructor() {
		this.aes = null;
		this.TIMEOUT = 10 * 60 * 1000;
		this.emitter = () => {};
	}

	/**
	 *  @method getRandomSeed
	 *
	 *  Method get random wallet key.
	 *  If this is a first launch, generate and save key in storage.
	 *  Next time get key in storage and decrypt.
	 *
	 *  @param {String} pin
	 *
	 *  @return {Buffer} randomBuffer
	 */
	async getRandomSeed(pin) {
		const privateKey = PrivateKey.fromSeed(pin);
		const publicKey = privateKey.toPublicKey();

		let encrypted = await storage.get('randomKey');
		let decrypted = Buffer.from(random(2048), 'hex');

		if (encrypted) {
			try {
				decrypted = Aes.decryptWithChecksum(privateKey, publicKey, '', Buffer.from(encrypted, 'hex'));
			} catch (err) {
				throw new Error('Invalid pin');
			}
		} else {
			encrypted = Aes.encryptWithChecksum(privateKey, publicKey, '', decrypted);
			await storage.set('randomKey', encrypted.toString('hex'));
		}

		return decrypted.toString('hex');
	}

	/**
	 *  @method timeout
	 *
	 *  Set timeout, when it expired - clear aes object.
	 *
	 */
	timeout() {
		setTimeout(() => { this.clear(); }, this.TIMEOUT);
	}

	/**
	 *  @method get
	 *
	 *  Set aes object.
	 *
	 *  @param {String} pin
	 *  @param {Function} emitter
	 */
	async set(pin, emitter) {
		if (!pin || typeof pin !== 'string') {
			throw new Error('Key required.');
		}

		if (!emitter || typeof emitter !== 'function') {
			throw new Error('Event emitter required.');
		}

		this.emitter = emitter;

		const randomSeed = await this.getRandomSeed(pin);
		this.aes = Aes.fromSeed(randomSeed);
		this.emitter('unlocked');

		this.timeout();
	}

	/**
	 *  @method get
	 *
	 *  Get aes object.
	 */
	get() {
		return this.aes;
	}

	/**
	 *  @method clear
	 *
	 *  Clear aes object.
	 */
	clear() {
		this.aes = null;
		this.emitter('locked');
	}

	/**
	 *  @method required
	 *
	 *  If aes is empty, throw error.
	 */
	required() {
		if (!this.aes) {
			this.emitter('locked');

			throw new Error('Unlock required.');
		}
	}

	setTime(milliseconds) {
		this.TIMEOUT = milliseconds;
	}

}

const privateAES = new AesStorage();

class Crypto extends EventEmitter {

	/**
	 *  @method setExpiredTime
	 *
	 *  Set expired time in milliseconds
	 *
	 *  @param {Number} milliseconds
	 */
	setExpiredTime(milliseconds) {
		privateAES.setTime(milliseconds);
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
	 *  @return {WIF} privateKey
	 */
	getPrivateKey(username, password, role = 'active') {
		const seed = `${username}${role}${password}`;
		const privateKey = PrivateKey.fromSeed(seed);
		return privateKey.toWif();
	}

	/**
	 *  @method getPublicKey
	 *
	 *  Generate public key from seed, using in desktop app.
	 *
	 *  @param {String} username
	 *  @param {String} password
	 *  @param {String} role - optional
	 *
	 *  @return {String} publicKey
	 */
	getPublicKey(username, password, role = 'active') {
		const seed = `${username}${role}${password}`;
		const privateKey = PrivateKey.fromSeed(seed);
		return privateKey.toPublicKey().toString();
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
	 *  @method generateWIF
	 *
	 * 	Generate random string and private key from this seed.
	 *
	 *  @return {String} privateKeyWIF
	 */
	generateWIF() {
		privateAES.required();

		const privateKey = PrivateKey.fromSeed(random(2048));

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
	async importByWIF(wif) {
		privateAES.required();

		const privateKey = PrivateKey.fromWif(wif);
		const aes = privateAES.get();
		const encryptedPrivateKey = aes.encryptToHex(privateKey.toBuffer());
		const publicKey = privateKey.toPublicKey();

		await storage.set(publicKey.toString(), encryptedPrivateKey);
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
	 *  @param {String} memoPublicKey
	 */
	async importByPassword(username, password, memoPublicKey) {
		privateAES.required();

		const privateKeyWIF = this.getPrivateKey(username, password);
		await this.importByWIF(privateKeyWIF);

		if (this.getPublicKey(username, password, 'memo') === memoPublicKey) {
			await this.importByWIF(this.getPrivateKey(username, password, 'memo'));
		}
	}

	/**
	 *  @method unlock
	 *
	 *  Create aes object and set expired timeout.
	 *
	 *  @param {String} pin
	 */
	async unlock(pin) {
		await privateAES.set(pin, this.emit.bind(this));
	}

	/**
	 *  @method lock
	 *
	 *  Delete aes object.
	 */
	lock() {
		privateAES.clear();
	}

	/**
	 *  @method isLocked
	 *
	 *  Check aes object is empty.
	 *
	 *  @return {Boolean} isLocked
	 */
	isLocked() {
		return !privateAES.get();
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
	async sign(transaction, publicKeyString) {
		privateAES.required();

		const encryptedPrivateKey = await storage.get(publicKeyString);

		if (!encryptedPrivateKey) {
			throw new Error('Key not found.');
		}

		const aes = privateAES.get();
		const privateKeyBuffer = aes.decryptHexToBuffer(encryptedPrivateKey);
		const privateKey = PrivateKey.fromBuffer(privateKeyBuffer);

		transaction.add_signer(privateKey);
		return transaction;
	}

	/**
	 *  @method removePrivateKey
	 *
	 *  Remove encrypted private key by public key.
	 *
	 *  @param {String} publicKey
	 */
	async removePrivateKey(publicKey) {
		await storage.remove(publicKey);
	}

}

export default Crypto;
