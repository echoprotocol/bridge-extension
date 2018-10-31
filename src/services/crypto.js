import { Aes, PrivateKey, TransactionHelper } from 'echojs-lib';
import random from 'crypto-random-string';
import EventEmitter from 'events';

import storage from './storage';

import { TIMEOUT, RANDOM_SIZE, ACTIVE_KEY, MEMO_KEY } from '../constants/GlobalConstants';

class AesStorage {

	/**
	 *  @constructor
	 *
	 * 	Init aes and timeout variables.
	 */
	constructor() {
		this.aes = null;
		this.TIMEOUT = TIMEOUT;
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
		let decrypted = Buffer.from(random(RANDOM_SIZE), 'hex');

		if (encrypted) {
			try {
				decrypted = Aes.decryptWithChecksum(privateKey, publicKey, '', Buffer.from(encrypted, 'hex'));
			} catch (err) {
				throw new Error('Enter valid PIN');
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
	 *  @method set
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

	/**
	 *  @method setTime
	 *
	 *  Set expired time in milliseconds
	 *
	 *  @param {Number} milliseconds
	 */
	setTime(milliseconds) {
		this.TIMEOUT = milliseconds;
	}

}

const privateAES = new AesStorage();

class Crypto extends EventEmitter {

	/**
	 *  @method isFirstTime
	 *
	 *  Check is key exist
	 *
	 *  @return {Boolean} isFirstTime
	 */
	async isFirstTime() {
		const key = await storage.get('randomKey');

		return Boolean(!key);
	}

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
	getPrivateKey(username, password, role = ACTIVE_KEY) {
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
	getPublicKey(username, password, role = ACTIVE_KEY) {
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

		const privateKey = PrivateKey.fromSeed(random(RANDOM_SIZE));

		return privateKey.toWif();
	}

	/**
	 *  @method importByWIF
	 *
	 *  Get private key from WIF.
	 *  Encrypt private key.
	 * 	Save encrypted private key.
	 *
	 *  @param {String} networkName
	 *  @param {String} wif
	 */
	async importByWIF(networkName, wif) {
		privateAES.required();

		const privateKey = PrivateKey.fromWif(wif);
		const aes = privateAES.get();
		const encryptedPrivateKey = aes.encryptToHex(privateKey.toBuffer());
		const publicKey = privateKey.toPublicKey();

		await this.setInByNetwork(networkName, publicKey.toString(), encryptedPrivateKey);
	}

	/**
	 *  @method importByPassword
	 *
	 *  Get private key from username and password.
	 *  Encrypt private key.
	 *  Save encrypted private key.
	 *
	 *  @param {String} networkName
	 *  @param {String} username
	 *  @param {String} password
	 *  @param {String} memoPublicKey
	 */
	async importByPassword(networkName, username, password, memoPublicKey) {
		privateAES.required();

		const privateKeyWIF = this.getPrivateKey(username, password);
		await this.importByWIF(networkName, privateKeyWIF);

		if (this.getPublicKey(username, password, MEMO_KEY) === memoPublicKey) {
			await this.importByWIF(
				networkName,
				this.getPrivateKey(username, password, MEMO_KEY),
			);
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
	 *  @param {String} networkName
	 *  @param {Transaction} transaction
	 *  @param {String} publicKeyString
	 *
	 *  @return {Transaction} signedTransaction
	 */
	async sign(networkName, transaction, publicKeyString) {
		privateAES.required();

		const encryptedPrivateKey = await this.getInByNetwork(networkName, publicKeyString);

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
	 *  @method encryptMemo
	 *
	 *  Encrypt memo.
	 *
	 *  @param {String} networkName
	 *  @param {String} fromMemoKey
	 *  @param {String} toMemoKey
	 *  @param {String} memo
	 *
	 *  @return {Object} encryptedMemo
	 */
	async encryptMemo(networkName, fromMemoKey, toMemoKey, memo) {
		privateAES.required();

		const encryptedPrivateKey = await this.getInByNetwork(networkName, fromMemoKey);

		if (!encryptedPrivateKey) {
			throw new Error('Key not found.');
		}

		const aes = privateAES.get();
		const privateKeyBuffer = aes.decryptHexToBuffer(encryptedPrivateKey);
		const privateKey = PrivateKey.fromBuffer(privateKeyBuffer);

		memo = Buffer.from(memo, 'utf-8');

		const nonce = TransactionHelper.unique_nonce_uint64();

		return {
			from: fromMemoKey,
			to: toMemoKey,
			nonce,
			message: Aes.encryptWithChecksum(privateKey, toMemoKey, nonce, memo),
		};
	}

	/**
	 *  @method removePrivateKey
	 *
	 *  Remove encrypted private key by public key.
	 *
	 *  @param {String} networkName
	 *  @param {String} publicKey
	 */
	async removePrivateKey(networkName, publicKey) {
		await this.removeInByNetwork(networkName, publicKey);
	}

	/**
	 *  @method setInByNetwork
	 *
	 *  Set encrypted field data by network name key.
	 *
	 *  @param {String} networkName
	 *  @param {String} field
	 *  @param {Any} fieldData
	 */
	async setInByNetwork(networkName, field, fieldData) {
		privateAES.required();

		let networkData = await storage.get(networkName);
		if (networkData) {
			networkData = privateAES.get().decryptHexToBuffer(networkData);
			networkData = JSON.parse(networkData.toString());
		} else {
			networkData = {};
		}

		networkData[field] = fieldData;
		networkData = JSON.stringify(networkData);
		networkData = privateAES.get().encryptToHex(Buffer.from(networkData));
		await storage.set(networkName, networkData);
	}

	/**
	 *  @method getInByNetwork
	 *
	 *  Get decrypted field data by network name key.
	 *
	 *  @param {String} networkName
	 *  @param {String} field
	 */
	async getInByNetwork(networkName, field) {
		privateAES.required();

		let networkData = await storage.get(networkName);
		if (networkData) {
			networkData = privateAES.get().decryptHexToBuffer(networkData);
			networkData = JSON.parse(networkData.toString());
		} else {
			networkData = {};
		}
		return networkData[field];
	}

	/**
	 *  @method removeInByNetwork
	 *
	 *  Remove field data by network name key.
	 *
	 *  @param {String} networkName
	 *  @param {String} field
	 */
	async removeInByNetwork(networkName, field) {
		privateAES.required();

		let networkData = await storage.get(networkName);
		if (networkData) {
			networkData = privateAES.get().decryptHexToBuffer(networkData);
			networkData = JSON.parse(networkData.toString());
		} else {
			networkData = {};
		}

		delete networkData[field];
		networkData = JSON.stringify(networkData);
		networkData = privateAES.get().encryptToHex(Buffer.from(networkData));
		await storage.set(networkName, networkData);
	}

}

export default Crypto;
