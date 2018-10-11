import React from 'react';
import { Route } from 'react-router';

import { IMPORT_ACCOUNT_PATH, INDEX_PATH, WIF_PATH, PIN_PATH } from './constants/RouterConstants';

import App from './containers/App';
import CreateAccount from './containers/CreateAccount';
import WifComponent from './containers/CreateAccount/WifComponent';
import ImportAccount from './containers/ImportAccount';
import AddNetwork from './containers/AddNetwork';
import Pin from './containers/Pin';

export default class Routes extends React.Component {

	render() {
		return (
			<App>
				<div>

					<Route exact path={INDEX_PATH} component={Pin} />
					<Route exact path={WIF_PATH} component={WifComponent} />
					<Route exact path={IMPORT_ACCOUNT_PATH} component={ImportAccount} />
					<Route exact path={PIN_PATH} component={Pin} />
					<Route exact path="/add-network" component={AddNetwork} />

				</div>
			</App>
		);
	}

}
