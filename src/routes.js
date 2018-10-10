import React from 'react';
import { Route } from 'react-router';

import { IMPORT_ACCOUNT_PATH, INDEX_PATH, WIF_PATH, WALLET_PATH } from './constants/RouterConstants';

import App from './containers/App';
import CreateAccount from './containers/CreateAccount';
import WifComponent from './containers/CreateAccount/WifComponent';
import ImportAccount from './containers/ImportAccount';
import AddNetwork from './containers/AddNetwork';
import Wallet from './containers/Wallet';


export default class Routes extends React.Component {

	render() {
		return (
			<App>
				<div>

					<Route exact path={INDEX_PATH} component={Wallet} />
					<Route exact path={WIF_PATH} component={WifComponent} />
					<Route exact path={IMPORT_ACCOUNT_PATH} component={ImportAccount} />
					<Route exact path={WALLET_PATH} component={Wallet} />

					<Route exact path="/add-network" component={AddNetwork} />

				</div>
			</App>
		);
	}

}
