/**
 * @file: AwaitEventEmitter
 * @author: Cuttle Cong
 * @date: 2017/11/1
 * @description:
 */
import isPromise from 'is-promise';
import FormatHelper from '../src/helpers/FormatHelper';

const TYPE_KEYNAME = typeof Symbol === 'function' ? Symbol('--[[await-event-emitter]]--') : '--[[await-event-emitter]]--';

function assertType(type) {
	if (typeof type !== 'string' && typeof type !== 'symbol') {
		throw new TypeError('type is not type of string or symbol!');
	}
}

function assertFn(fn) {
	if (typeof fn !== 'function') {
		throw new TypeError('fn is not type of Function!');
	}
}

function alwaysListener(fn) {
	return {
		[TYPE_KEYNAME]: 'always',
		fn,
	};
}
function onceListener(fn) {
	return {
		[TYPE_KEYNAME]: 'once',
		fn,
	};
}

function AwaitEventEmitter() {
	this.events = {};
}

function on(type, fn) {
	assertType(type);
	assertFn(fn);
	this.events[type] = this.events[type] || [];
	this.events[type].push(alwaysListener(fn));
	return this;
}

function prepend(type, fn) {
	assertType(type);
	assertFn(fn);
	this.events[type] = this.events[type] || [];
	this.events[type].unshift(alwaysListener(fn));
	return this;
}

function prependOnce(type, fn) {
	assertType(type);
	assertFn(fn);
	this.events[type] = this.events[type] || [];
	this.events[type].unshift(onceListener(fn));
	return this;
}

function listeners(type) {
	return (this.events[type] || []).map((x) => x.fn);
}

function once(type, fn) {
	assertType(type);
	assertFn(fn);
	this.events[type] = this.events[type] || [];
	this.events[type].push(onceListener(fn));
	return this;
}

function removeListener(type, nullOrFn) {
	assertType(type);

	const listenersItems = this.listeners(type);
	if (typeof nullOrFn === 'function') {
		let index;
		let found = false;
		/* eslint-disable no-cond-assign */
		while ((index = listenersItems.indexOf(nullOrFn)) >= 0) {
			listenersItems.splice(index, 1);
			this.events[type].splice(index, 1);
			found = true;
		}
		return found;
	}
	return delete this.events[type];

}

function removeAllListeners() {
	Object.keys(this.events).forEach((eventType) => delete this.events[eventType]);

	return true;
}

async function emit(type, ...args) {
	assertType(type);
	const listenersItems = this.listeners(type);

	const onceListeners = [];
	if (listenersItems && listenersItems.length) {
		for (let i = 0; i < listenersItems.length; i += 1) {
			const event = listenersItems[i];

			try {
				const rlt = event.apply(this, args);

				if (isPromise(rlt)) {
					/* eslint-disable no-await-in-loop */
					await rlt;
				}

				if (this.events[type][i][TYPE_KEYNAME] === 'once') {
					onceListeners.push(event);
				}
			} catch (e) {
				if (FormatHelper.formatError(e) === 'can\'t access dead object') {
					this.removeListener(type, event);
				}
			}
		}
		onceListeners.forEach((event) => this.removeListener(type, event));

		return true;
	}
	return false;
}

function emitSync(type, ...args) {
	assertType(type);
	const listenersItems = this.listeners(type);
	const onceListeners = [];
	if (listenersItems && listenersItems.length) {
		for (let i = 0; i < listenersItems.length; i += 1) {
			const event = listenersItems[i];
			event.apply(this, args);

			if (this.events[type][i][TYPE_KEYNAME] === 'once') {
				onceListeners.push(event);
			}
		}
		onceListeners.forEach((event) =>
			this.removeListener(type, event));

		return true;
	}
	return false;
}

AwaitEventEmitter.prototype.on = on;
AwaitEventEmitter.prototype.addListener = on;
AwaitEventEmitter.prototype.once = once;
AwaitEventEmitter.prototype.prependListener = prepend;
AwaitEventEmitter.prototype.prependOnceListener = prependOnce;
AwaitEventEmitter.prototype.off = removeListener;
AwaitEventEmitter.prototype.removeListener = removeListener;
AwaitEventEmitter.prototype.removeAllListeners = removeAllListeners;
AwaitEventEmitter.prototype.emit = emit;
AwaitEventEmitter.prototype.emitSync = emitSync;
AwaitEventEmitter.prototype.listeners = listeners;

// if (typeof module !== 'undefined') {
// 	module.exports = AwaitEventEmitter;
// }
export default AwaitEventEmitter;
