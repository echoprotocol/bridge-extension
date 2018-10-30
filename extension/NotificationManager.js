import extensionizer from './extensionizer';

const height = 591;
const width = 362;

class NotificationManager {

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
     * Closes a MetaMask notification if it window exists.
     *
     */
	closePopup() {
		this.getPopup()
			.then((popup) => (popup && extensionizer.windows.remove(popup.id, console.error)));
	}

	/**
     * Checks all open MetaMask windows, and returns the first one it finds that is a notification window (i.e. has the
     * type 'popup')
     *
     * @private
     * @param {Function} cb A node style callback that to whcih the found notification window will be passed.
     *
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
     * Returns all open MetaMask windows.
     *
     * @private
     * @param {Function} cb A node style callback that to which the windows will be passed.
     *
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

	getPopupIn(windows) {
		return windows ? windows.find((win) =>
			(win && win.type === 'popup' && win.id === this.popupId)) : null;
	}

}

export default NotificationManager;
