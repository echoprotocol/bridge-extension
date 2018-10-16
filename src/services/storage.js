/* global NODE_ENV */

import extension from '../../extension/extensionizer';

class Storage {

	static set(key, value) {
		if (extension.storage && extension.storage.local) {
			const { local } = extension.storage;

			return new Promise((resolve, reject) => {
				local.set({ [key]: value }, () => {
					const err = extension.runtime.lastError;
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			});
		}

		if (NODE_ENV === 'local') {
			localStorage.setItem(key, JSON.stringify(value));
			return Promise.resolve();
		}

		return Promise.resolve();
	}

	static get(key) {
		if (extension.storage && extension.storage.local) {
			const { local } = extension.storage;

			return new Promise((resolve, reject) => {
				local.get(null, (result) => {
					const err = extension.runtime.lastError;

					if (err) {
						reject(err);
					} else {
						resolve(result.key);
					}
				});
			});
		}

		if (NODE_ENV === 'local') {
			const value = localStorage.getItem(key);
			return Promise.resolve(value ? JSON.parse(value) : value);
		}

		return Promise.resolve();
	}

	static remove(key) {
		if (extension.storage && extension.storage.local) {
			const { local } = extension.storage;

			return new Promise((resolve, reject) => {
				local.remove(key, () => {
					const err = extension.runtime.lastError;

					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			});
		}

		if (NODE_ENV === 'local') {
			localStorage.removeItem(key);
			return Promise.resolve();
		}

		return Promise.resolve();
	}

}

export default Storage;
