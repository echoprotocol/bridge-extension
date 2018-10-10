/* global NODE_ENV */

import extension from '../../extension/extensionizer';

class Storage {

	set(key, value) {
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
			localStorage.setItem(key, value);
			return Promise.resolve();
		}

		return Promise.resolve();
	}

	get(key) {
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
			Promise.resolve(localStorage.getItem(key));
		}

		return Promise.resolve();
	}

	remove(key) {
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
			Promise.resolve(localStorage.removeItem(key));
		}

		return Promise.resolve();
	}

}

export default Storage;
