import { aes as aesLib, PrivateKey, TransactionHelper } from 'echojs-lib';
import random from 'crypto-random-string';

import EventEmitter from '../../libs/CustomAwaitEmitter';
import AesStorage from './aesStorage';

import storage from './storage';

import { RANDOM_SIZE, ACTIVE_KEY, MEMO_KEY } from '../constants/GlobalConstants';

const privateAES = new AesStorage();

class Crypto extends EventEmitter {

	/**
     *  @method pauseLockTimeout
     *
     *  Pause lock timeout when you need to perform an operation
     */
	pauseLockTimeout() {
		privateAES.pauseTimeout();
	}

	/**
     *  @method resumeLockTimeout
     *
     *  Resume lock timeout
     */
	resumeLockTimeout() {
		privateAES.resumeTimeout();
	}

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
	 *  @method getWIFByPublicKey
	 *
	 *  Get key for backup page
	 *
	 *  @param {String} network
	 *  @param {String} publicKey
	 *
	 *  @return {String} WIF
	 */
	async getWIFByPublicKey(networkName, publicKey) {
		privateAES.required();

		try {
			const encryptedPrivateKey = await this.getInByNetwork(networkName, publicKey);
			const aes = privateAES.get();
			const privateKeyBuffer = aes.decryptHexToBuffer(encryptedPrivateKey);
			const privateKey = PrivateKey.fromBuffer(privateKeyBuffer);
			return privateKey.toWif();
		} catch (err) {
			return null;
		}

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

		transaction.addSigner(privateKey);
		return transaction;
	}

	getAes() {
		return privateAES.get();
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
			message: aesLib.encryptWithChecksum(privateKey, toMemoKey, nonce, memo),
		};
	}

	/**
     *  @method decryptMemo
     *
     *  Decrypt memo
     *
     *  @param {String} networkName
     *  @param {Object} memo
     *
     *  @return {Object} decryptedMemo
     */
	async decryptMemo(networkName, memo) {
		privateAES.required();

		const encryptedPrivateKey = await this.getInByNetwork(networkName, memo.get('from'), memo.get('to'));

		if (!encryptedPrivateKey) {
			throw new Error('Key not found.');
		}

		const aes = privateAES.get();
		const privateKeyBuffer = aes.decryptHexToBuffer(encryptedPrivateKey);
		const privateKey = PrivateKey.fromBuffer(privateKeyBuffer);

		const publicKey = privateKey.toPublicKey().toString();

		if (publicKey !== memo.get('from') && publicKey !== memo.get('to')) {
			return null;
		}

		return aesLib.decryptWithChecksum(
			privateKey,
			publicKey === memo.get('from') ? memo.get('to') : memo.get('from'),
			memo.get('nonce'),
			memo.get('message'),
		).toString('utf-8');
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
     *  @param {String?} tmpfield - for decypt memo
	 */
	async getInByNetwork(networkName, field, tmpfield) {
		privateAES.required();

		let networkData = await storage.get(networkName);
		if (networkData) {
			networkData = privateAES.get().decryptHexToBuffer(networkData);
			networkData = JSON.parse(networkData.toString());
		} else {
			networkData = {};
		}

		if (networkData[tmpfield]) {
			return networkData[tmpfield];
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
