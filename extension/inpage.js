import extensionizer from './extensionizer';

const port = extensionizer.runtime.connect('inehljcgpfbhihkianpgjpjaapgchlni', { name: 'notification' });

port.onMessage.addListener((msg) => {
	console.log(msg)
    // port.postMessage({ answer: 'Madame' });
});

window.send = (to = '1.2.15', amount = 1) => {
	port.postMessage({
		message: {
			window: 'send',
			data: {
				to,
				amount,
			},
		},
	});
};
