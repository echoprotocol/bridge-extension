import React from 'react';
import { Route } from 'react-router';

import {
	IMPORT_ACCOUNT_PATH,
	CREATE_ACCOUNT_PATH,
	WALLET_PATH,
	ADD_NETWORK_PATH,
	SUCCESS_ADD_NETWORK_PATH,
} from './constants/RouterConstants';

import App from './containers/App';
import CreateAccount from './containers/CreateAccount';
import ImportAccount from './containers/ImportAccount';
import AddNetwork from './containers/AddNetwork';
import SuccessAddNetwork from './containers/SuccessAddNetwork';
import Wallet from './containers/Wallet';


class Routes extends React.Component {

	render() {
		return (
			<App>
				<div>

					<Route exact path={CREATE_ACCOUNT_PATH} component={CreateAccount} />
					<Route exact path={IMPORT_ACCOUNT_PATH} component={ImportAccount} />
					<Route exact path={ADD_NETWORK_PATH} component={AddNetwork} />
					<Route exact path={SUCCESS_ADD_NETWORK_PATH} component={SuccessAddNetwork} />
					<Route exact path={WALLET_PATH} component={Wallet} />
				</div>
			</App>
		);
	}

}

export default Routes;
