import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { ConnectedRouter } from 'react-router-redux';

import Routes from './routes'; // Or wherever you keep your reducers
import './assets/loader';

import history from './history';
import store from './store';

import { POPUP_HEIGHT, POPUP_WIDTH } from './constants/GlobalConstants';

if (window.innerWidth !== window.outerWidth || window.innerHeight !== window.outerHeight) {
	window.resizeBy(POPUP_WIDTH - window.innerWidth, POPUP_HEIGHT - window.innerHeight);
}

ReactDOM.render(
	<Provider store={store}>
		{/* ConnectedRouter will use the store from Provider automatically */}
		<ConnectedRouter history={history}>
			<div>
				<Routes />
			</div>
		</ConnectedRouter>
	</Provider>,
	document.getElementById('root'),
);
