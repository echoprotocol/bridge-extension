import extensionizer from './extensionizer';

const height = 591;
const width = 362;

class NotificationManager {

	/**
	 * Create popup
     */
	showPopup() {
		const cb = (popup) => { this.popupId = popup.id; };

		// top params offset from top
		// left params offset from left

		// create new notification popup
		const creation = extensionizer.windows.create({
			url: 'index.html',
			type: 'popup',
			width,
			height,
		}, cb);

		if (creation && creation.then) creation.then(cb);
	}

	/**
	 * close notification popup
     */
	closePopup() {
		this.getPopup()
			.then((popup) => (popup && extensionizer.windows.remove(popup.id, console.error)));
	}

	/**
	 * Get current popup
     * @returns {Promise.<*>}
     */
	async getPopup() {
		try {
			const windows = await this.getWindows();
			return this.getPopupIn(windows);
		} catch (e) {
			throw e;
		}
	}

	/**
	 * Get all windows
     * @returns {Promise}
     */
	getWindows() {
		return new Promise((resolve, reject) => {
			if (!extensionizer.windows) {
				return reject();
			}

			return extensionizer.windows.getAll({}, (windows) => {
				resolve(windows);
			});
		});
	}

	/**
	 * Check is our popup exist
     * @param windows
     * @returns {null}
     */
	getPopupIn(windows) {
		return windows ? windows.find((win) =>
			(win && win.type === 'popup' && win.id === this.popupId)) : null;
	}

}

export default NotificationManager;
