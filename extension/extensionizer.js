/* global chrome, browser */

const apis = [
	'alarms',
	'bookmarks',
	'browserAction',
	'commands',
	'contextMenus',
	'cookies',
	'downloads',
	'events',
	'extension',
	'extensionTypes',
	'history',
	'i18n',
	'idle',
	'notifications',
	'pageAction',
	'runtime',
	'storage',
	'tabs',
	'webNavigation',
	'webRequest',
	'windows',
];

const hasChrome = typeof chrome !== 'undefined';
const hasWindow = typeof window !== 'undefined';
const hasBrowser = typeof browser !== 'undefined';

function Extension() {
	const self = this;

	apis.forEach((api) => {

		self[api] = null;

		if (hasChrome) {
			try {
				if (chrome[api]) {
					self[api] = chrome[api];
				}
			} catch (e) {
				// continue regardless of error
			}
		}

		if (hasWindow) {
			try {
				if (window[api]) {
					self[api] = window[api];
				}
			} catch (e) {
				// continue regardless of error
			}
		}

		if (hasBrowser) {
			try {
				if (browser[api]) {
					self[api] = browser[api];
				}
			} catch (e) {
				// continue regardless of error
			}

			try {
				self.api = browser.extension[api];
			} catch (e) {
				// continue regardless of error
			}
		}
	});

	if (hasBrowser) {
		try {
			if (browser && browser.runtime) {
				this.runtime = browser.runtime;
			}
		} catch (e) {
			// continue regardless of error
		}

		try {
			if (browser && browser.browserAction) {
				this.browserAction = browser.browserAction;
			}
		} catch (e) {
			// continue regardless of error
		}
	}

}

module.exports = new Extension();
