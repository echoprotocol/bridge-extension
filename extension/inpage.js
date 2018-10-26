import extensionizer from './extensionizer';

// find ip for client
// https://stackoverflow.com/questions/21497781/how-to-change-chrome-packaged-app-id-or-why-do-we-need-key-field-in-the-manifest/21500707#21500707
const ID = 'inehljcgpfbhihkianpgjpjaapgchlni';

window.send = (to = '1.2.15', amount = 1, cb) => {
	extensionizer.runtime.sendMessage(
		ID,
		{
			method: 'confirm',
			data: {
				to,
				amount,
			},
		},
		cb,
	);
};


window.delete = (cb) => {
	extensionizer.runtime.sendMessage(ID, { method: 'accounts' }, cb);
};
