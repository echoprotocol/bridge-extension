import React from 'react';
import { Route } from 'react-router';

import {
	IMPORT_ACCOUNT_PATH,
	INDEX_PATH, WIF_PATH,
	ADD_NETWORK_PATH,
	SUCCESS_ADD_NETWORK_PATH,
} from './constants/RouterConstants';

import App from './containers/App';
import CreateAccount from './containers/CreateAccount';
import WifComponent from './containers/CreateAccount/WifComponent';
import ImportAccount from './containers/ImportAccount';
import AddNetwork from './containers/AddNetwork';
import SuccessAddNetwork from './containers/SuccessAddNetwork';


export default class Routes extends React.Component {

	render() {
		return (
			<App>
				<div>
					<Route exact path={INDEX_PATH} component={CreateAccount} />
					<Route exact path={WIF_PATH} component={WifComponent} />
					<Route exact path={IMPORT_ACCOUNT_PATH} component={ImportAccount} />
					<Route exact path={ADD_NETWORK_PATH} component={AddNetwork} />
					<Route exact path={SUCCESS_ADD_NETWORK_PATH} component={SuccessAddNetwork} />
				</div>
			</App>
		);
	}

}
