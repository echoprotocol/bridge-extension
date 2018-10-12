import React from 'react';
import { Route } from 'react-router';

import {
	IMPORT_ACCOUNT_PATH,
	CREATE_ACCOUNT_PATH,
	WALLET_PATH,
} from './constants/RouterConstants';

import App from './containers/App';
import CreateAccount from './containers/CreateAccount';
import ImportAccount from './containers/ImportAccount';
import AddNetwork from './containers/AddNetwork';
import Wallet from './containers/Wallet';


class Routes extends React.Component {

	render() {
		return (
			<App>
				<div>

					<Route exact path={CREATE_ACCOUNT_PATH} component={CreateAccount} />
					<Route exact path={IMPORT_ACCOUNT_PATH} component={ImportAccount} />
					<Route exact path={WALLET_PATH} component={Wallet} />

					<Route exact path="/add-network" component={AddNetwork} />

				</div>
			</App>
		);
	}

}

export default Routes;
