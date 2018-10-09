import React from 'react';
import { Route } from 'react-router';

import App from './containers/App';
import CreateAccount from './containers/CreateAccount';
import ImportAccount from './containers/ImportAccount';

export default class Routes extends React.Component {

	render() {
		return (
			<App>
				<div>
					<Route exact path="/" component={CreateAccount} />
					<Route exact path="/import-account" component={ImportAccount} />
				</div>
			</App>
		);
	}

}
