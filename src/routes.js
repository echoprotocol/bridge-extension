import React from 'react';
import { Route } from 'react-router';

import { IMPORT_ACCOUNT_PATH, INDEX_PATH } from './constants/RouterConstants';

import App from './containers/App';
import CreateAccountWizard from './wizards/CreateAccountWizard';
import ImportAccount from './containers/ImportAccount';
import AddNetwork from './containers/AddNetwork';


export default class Routes extends React.Component {

	render() {
		return (
			<App>
				<div>

					<Route exact path={INDEX_PATH} component={CreateAccountWizard} />
					<Route exact path={IMPORT_ACCOUNT_PATH} component={ImportAccount} />

					<Route exact path="/add-network" component={AddNetwork} />

				</div>
			</App>
		);
	}

}
