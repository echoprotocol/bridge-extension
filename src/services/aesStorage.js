import { aes } from 'echojs-lib';
import crypto from 'crypto';
import scrypt from 'scrypt-js';

import storage from './storage';
import {
	DRAFT_STORAGE_KEY,
	TIMEOUT,
	ALGORITHM,
	SCRYPT_ALGORITHM_PARAMS,
	ALGORITHM_IV_BYTES_LENGTH,
	STORE,
} from '../constants/GlobalConstants';

class AesStorage {

	/**
	 *  @constructor
	 *
	 * 	Init aes and timeout variables.
	 */
	constructor() {
		this.aes = null;
		this.startTimeout = null;
		this.timerId = null;
		this.remaining = null;
		this.TIMEOUT = TIMEOUT;
		this.emitter = () => {};
	}

	/**
	 *
	 * @return {{
	 * 		version: number,
	 * 		created_at: string,
	 * 		salt: string,
	 * 		N, r: number,
	 * 		p: number,
	 * 		l: number,
	 * 		IV: string
	 * }}
	 */
	static generateNewHeader() {

		const header = {
			version: 1,
			created_at: (new Date()).toISOString(),
			salt: AesStorage.randomBytes(SCRYPT_ALGORITHM_PARAMS.SALT_BYTES_LENGTH).toString('hex'),
			N: SCRYPT_ALGORITHM_PARAMS.N,
			r: SCRYPT_ALGORITHM_PARAMS.r,
			p: SCRYPT_ALGORITHM_PARAMS.p,
			l: SCRYPT_ALGORITHM_PARAMS.l,
			IV: AesStorage.randomBytes(ALGORITHM_IV_BYTES_LENGTH).toString('hex'),
		};

		return header;
	}

	/**
	 *
	 * @param {String} encHash - hex
	 * @param {Buffer} decryptedData
	 * @param {Object} header
	 * @return {String} - hex
	 */
	static encryptData(encHash, decryptedData, header) {

		const checksum = crypto.createHash('sha256').update(decryptedData).digest('hex').slice(0, 4);

		const payload = Buffer.concat([Buffer.from(checksum, 'hex'), decryptedData]);

		const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(encHash, 'hex'), Buffer.from(header.IV, 'hex'));

		let encrypted = cipher.update(payload.toString('hex'), 'hex', 'hex');

		encrypted += cipher.final('hex');

		return encrypted;
	}

	/**
	 *
	 * @param {String} encHash
	 * @param {String} encryptedData - hex
	 * @param header
	 */
	static decryptData(encHash, encryptedData, header) {

		const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(encHash, 'hex'), Buffer.from(header.IV, 'hex'));

		let decrypted = decipher.update(encryptedData, 'hex', 'hex');
		decrypted += decipher.final('hex');

		const checksum = decrypted.slice(0, 4);
		const decryptedStrData = decrypted.slice(4);

		let newChecksum = crypto.createHash('sha256').update(decryptedStrData, 'hex').digest('hex').slice(0, 4);

		newChecksum = newChecksum.slice(0, 4);


		if (checksum.toString('hex') !== newChecksum) {
			throw new Error('Invalid key, could not decrypt message (2)');
		}

		return Buffer.from(decryptedStrData, 'hex');
	}


	/**
	 *
	 * @param {String} password
	 * @param {Object} header
	 * @return {Promise}
	 */
	static async derivePassword(password, header) {
		return new Promise((resolve, reject) => {
			const passwordHash = crypto.createHash('sha256').update(password, 'utf8').digest('hex');
			const passwordHashBuffer = Buffer.from(passwordHash, 'hex');
			const saltBuffer = Buffer.from(header.salt, 'hex');
			const t1 = Date.now();

			scrypt(
				passwordHashBuffer,
				saltBuffer,
				header.N,
				header.r,
				header.p,
				header.l,
				(error, progress, key) => {

					if (error) {
						console.error(`[SCRYPT] Error: ${error}`);
						return reject(error);
					}

					if (key) {
						console.info(`[SCRYPT] Creation time ${Date.now() - t1}`);
						return resolve(Buffer.from(key).toString('hex'));

					}

					return false;

				},
			);

		});

	}

	/**
	 *
	 * @param {Number} bytes
	 * @return {void|Buffer}
	 */
	static randomBytes(bytes) {
		return crypto.randomBytes(bytes);
	}

	/**
	 *  @method createRandomSeed
	 *
	 *  Method create random wallet key.
	 *  Generate and save key in storage.
	 *
	 *  @param {String} pin
	 *
	 *  @return {Buffer} randomBuffer
	 */
	async createRandomSeed(pin) {
		const header = AesStorage.generateNewHeader();
		const encHash = await AesStorage.derivePassword(pin, header);

		const decrypted = Buffer.from(AesStorage.randomBytes(256).toString('hex'), 'hex');
		const encryptedRandomKey = AesStorage.encryptData(encHash, decrypted, header);

		await storage.set(STORE, {
			random_key: encryptedRandomKey.toString('hex'),
			header,
		});

		return decrypted;
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
		const store = await storage.get(STORE);

		if (!store) {
			return this.createRandomSeed(pin);
		}

		const encHash = await AesStorage.derivePassword(pin, store.header);
		try {
			const decrypted = AesStorage.decryptData(encHash, store.random_key, store.header);
			return decrypted.toString('hex');
		} catch (err) {
			throw new Error('Enter valid PIN');
		}
	}

	/**
	 *  @method timeout
	 *
	 *  Set timeout, when it expired - clear aes object.
	 *
	 */
	timeout() {
		this.startTimeout = new Date();
		clearTimeout(this.timerId);
		this.timerId = setTimeout(() => { this.clear(); }, this.TIMEOUT);
		this.remaining = this.TIMEOUT;
	}

	/**
	 *  @method pauseTimeout
	 *
	 *  Pause timeout
	 *
	 */
	pauseTimeout() {
		clearTimeout(this.timerId);
		this.remaining -= new Date() - this.startTimeout;
	}

	/**
	 *  @method resumeTimeout
	 *
	 *  Resume timeout
	 *
	 */
	resumeTimeout() {
		this.startTimeout = new Date();
		clearTimeout(this.timerId);
		this.timerId = setTimeout(() => { this.clear(); }, this.remaining);
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
		this.aes = aes.fromSeed(randomSeed);
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
		storage.remove(DRAFT_STORAGE_KEY);
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

export default AesStorage;
