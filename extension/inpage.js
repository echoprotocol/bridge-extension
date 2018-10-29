import echojslib from 'echojs-lib';
import echojsws from 'echojs-ws';

import extensionizer from './extensionizer';

// find ip for client
// https://stackoverflow.com/questions/21497781/how-to-change-chrome-packaged-app-id-or-why-do-we-need-key-field-in-the-manifest/21500707#21500707
const ID = 'inehljcgpfbhihkianpgjpjaapgchlni';

// const port = extensionizer.runtime.connect(ID);
// console.log(port)
// port.onMessage.addListener(console.log)
const confirm = (data) => new Promise((resolve, reject) => {
	extensionizer.runtime.sendMessage(ID, { method: 'confirm', data }, (res) => {
		if (res.error) reject(res.error);
		resolve(res);
	});
});

const getAccounts = () => new Promise((resolve, reject) => {
    // port.postMessage({ method: 'accounts' });
    // resolve();
	extensionizer.runtime.sendMessage(ID, , (res) => {
		if (res.status === 'approved') {
			resolve(res);
		} else {
			reject(res);
		}
	});
});

window.echojslib = echojslib;
window.echojsws = echojsws;
window.getAccounts = () => getAccounts();
window.confirm = (data) => confirm(data);
