import extensionizer from './extensionizer';

const ID = 'inehljcgpfbhihkianpgjpjaapgchlni';

window.send = (to = '1.2.15', amount = 1) => {
	extensionizer.runtime.sendMessage(ID, {
		window: 'send',
		data: {
			to,
			amount,
		},
	}, console.log);
};
