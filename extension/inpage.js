import echojslib from 'echojs-lib';
import echojsws from 'echojs-ws';

const requestQueue = [];

const onMessage = (event) => {
	const { id, target } = event.data;

	if (!id || target !== 'inpage') return;

	const requestIndex = requestQueue.findIndex(({ id: requestId }) => requestId === id);
	if (requestIndex === -1) return;

	requestQueue.splice(requestIndex, 1)[0].cb(event);
};

const confirm = (options) => {

	const id = Date.now();
	const result = new Promise((resolve, reject) => {
		const cb = ({ data }) => {

			const { status, text } = data;

			if (status === 'approved') {
				resolve({ status });
			} else {
				reject(text || status);
			}
		};
		requestQueue.push({ id, cb });
		window.postMessage({
			method: 'confirm', data: options, id, target: 'content',
		}, '*');

	});

	return result;

};

const getAccounts = () => {
	const id = Date.now();
	const result = new Promise((resolve, reject) => {

		const cb = ({ data }) => {

			if (data.res.error) {
				reject(data.res.error);
			} else {
				resolve(data.res);
			}
		};

		requestQueue.push({ id, cb });
		window.postMessage({ method: 'accounts', id, target: 'content' }, '*');

	});

	return result;
};


window.echojslib = echojslib;
window.echojsws = echojsws;
window.getAccounts = () => getAccounts();
window.confirm = (data) => confirm(data);
window.addEventListener('message', onMessage, false);
