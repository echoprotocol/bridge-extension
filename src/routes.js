import React from 'react';
import { Route } from 'react-router';

import { IMPORT_ACCOUNT_PATH, INDEX_PATH, WIF_PATH } from './constants/RouterConstants';

import App from './components/App';
import CreateAccount from './components/pages/CreateAccount';
import WifComponent from './components/pages/CreateAccount/WifComponent';
import About from './components/pages/about/AboutPage';
import ImportAccount from './components/pages/ImportAccount';

export default class Routes extends React.Component {

	render() {
		return (
			<App>
				<div>
					<Route exact path={INDEX_PATH} component={CreateAccount} />
					<Route exact path={WIF_PATH} component={WifComponent} />
					<Route exact path={IMPORT_ACCOUNT_PATH} component={ImportAccount} />
					<Route exact path="/about" component={About} />
				</div>
			</App>
		);
	}

}
