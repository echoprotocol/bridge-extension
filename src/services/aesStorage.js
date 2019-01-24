import { aes, PrivateKey } from 'echojs-lib';
import random from 'crypto-random-string';

import storage from './storage';
import { RANDOM_SIZE, TIMEOUT } from '../constants/GlobalConstants';

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
				decrypted = aes.decryptWithChecksum(privateKey, publicKey, null, Buffer.from(encrypted, 'hex'));
			} catch (err) {
				throw new Error('Enter valid PIN');
			}
		} else {
			encrypted = aes.encryptWithChecksum(privateKey, publicKey, null, decrypted);
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
