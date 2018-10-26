import extensionizer from './extensionizer';

const height = 591;
const width = 362;

class NotificationManager {

	showPopup() {
		console.log('show')
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
		// closes notification popup
		this.getPopup((err, popup) => {
			if (err || !popup) return;
			extensionizer.windows.remove(this.popupId, console.error);
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
			if (err) return cb(err);
			return cb(null, this.getPopupIn(windows));
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
			(win && win.type === 'popup' && win.id === this.popupId)) : null;
	}

}

export default NotificationManager;
