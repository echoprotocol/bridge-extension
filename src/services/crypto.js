import { Aes, PrivateKey } from 'echojs-lib';
import random from 'crypto-random-string';
import EventEmitter from 'events';

import Storage from './storage';

const storage = new Storage();

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
	 *  @method getRandomBuffer
	 *
	 *  Method get random wallet key.
	 *  If this is a first launch, generate and save key in storage.
	 *  Next time get key in storage and decrypt.
	 *
	 *  @return {Buffer} randomBuffer
	 */
	async getRandomBuffer() {
		let randomBuffer = Buffer.from(random(32));
		let randomKey = await storage.get('randomKey');

		if (randomKey) {
			randomBuffer = this.aes.decryptHexToBuffer(randomKey);
		} else {
			randomKey = this.aes.encryptToHex(randomBuffer);
			await storage.set('randomKey', randomKey);
		}

		return randomBuffer;
	}

	/**
	 *  @method timeout
	 *
	 *  Set timeout, when it expired - clear aes object.
	 *
	 *  @param {Number} milliseconds - optional
	 */
	timeout(milliseconds) {
		if (milliseconds) {
			this.TIMEOUT = milliseconds;
		}

		setTimeout(() => { this.clear(); }, this.TIMEOUT);
	}

	/**
	 *  @method get
	 *
	 *  Set aes object.
	 *
	 *  @param {String} pin
	 *  @param {Function} emitter
	 *  @param {Number} milliseconds - optional
	 */
	async set(pin, emitter, milliseconds) {
		if (!pin || typeof pin !== 'string') {
			throw new Error('Key required.');
		}

		if (!emitter || typeof emitter !== 'function') {
			throw new Error('Event emitter required.');
		}

		this.emitter = emitter;

		this.aes = Aes.fromSeed(pin);
		const randomBuffer = await this.getRandomBuffer();
		this.aes = Aes.fromSeed(randomBuffer);
		this.emitter('unlocked');

		this.timeout(milliseconds);
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
			throw new Error('Unlock required.');
		}
	}

}

const privateAES = new AesStorage();

class Crypto extends EventEmitter {

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
	static getPrivateKey(username, password, role = 'active') {
		const seed = `${username}${role}${password}`;
		const privateKey = PrivateKey.fromSeed(seed);
		return privateKey.toWif();
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
	 *  @method createAES
	 *
	 * 	Create aes and set expired timout
	 *
	 *  @param {String} pin
	 *  @param {Number} milliseconds - optional
	 */
	async createAES(pin, milliseconds) {
		await privateAES.set(pin, this.emit, milliseconds);
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
	 */
	async importByPassword(username, password) {
		privateAES.required();

		const privateKeyWIF = this.getPrivateKey(username, password);
		await this.importByWIF(privateKeyWIF);
	}

	/**
	 *  @method unlock
	 *
	 *  Create aes object and set expired timeout.
	 *
	 *  @param {String} pin
	 */
	async unlock(pin) {
		await privateAES.set(pin, this.emit);
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

}

export default Crypto;
