import extensionizer from './extensionizer';

const height = 591;
const width = 362;

class NotificationManager {

	showPopup() {
		this.getPopup((err, popup) => {
			if (err) throw err;

			// Bring focus to chrome popup
			if (popup) {
				// bring focus to existing chrome popup
				extensionizer.windows.update(popup.id, { focused: true });
			} else {
				const cb = (currentPopup) => { this.popupId = currentPopup.id; };
				// create new notification popup
				const creation = extensionizer.windows.create({
					url: 'index.html',
					type: 'popup',
					width,
					height,
				}, cb);
				creation && creation.then && creation.then(cb);
			}
		});
	}

	/**
     * Closes a MetaMask notification if it window exists.
     *
     */
	closePopup() {
		// closes notification popup
		this.getPopup((err, popup) => {
			if (err) throw err;
			if (!popup) return;
			extensionizer.windows.remove(popup.id, console.error);
		});
	}

	/**
     * Checks all open MetaMask windows, and returns the first one it finds that is a notification window (i.e. has the
     * type 'popup')
     *
     * @private
     * @param {Function} cb A node style callback that to whcih the found notification window will be passed.
     *
     */
	getPopup(cb) {
		this.getWindows((err, windows) => {
			if (err) throw err;
			cb(null, this.getPopupIn(windows));
		});
	}

	/**
     * Returns all open MetaMask windows.
     *
     * @private
     * @param {Function} cb A node style callback that to which the windows will be passed.
     *
     */
	getWindows(cb) {
		if (!extensionizer.windows) {
			return cb();
		}

		extensionizer.windows.getAll({}, (windows) => {
			cb(null, windows);
		});
	}

	getPopupIn(windows) {
		return windows ? windows.find((win) =>
		// Returns notification popup
			(win && win.type === 'popup' && win.id === this.popupId)) : null;
	}

}

export default NotificationManager;
