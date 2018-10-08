import ext from './ext';

ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('11111111111111111')
	if (request.action === 'perform-save') {
		console.log('Extension Type: ', '/* @echo extension */');
		console.log('PERFORM AJAX', request.data);

		sendResponse({ action: 'saved' });
	}
});
