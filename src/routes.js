import React from 'react';
import { Route } from 'react-router';

import App from './components/App';
import CreateAccount from './components/pages/CreateAccount';
import About from './components/pages/about/AboutPage';
import ImportAccount from './components/pages/ImportAccount';

export default class Routes extends React.Component {

	render() {
		return (
			<App>
				<div>
					<Route exact path="/" component={CreateAccount} />
					<Route exact path="/import-account" component={ImportAccount} />
					<Route exact path="/about" component={About} />
				</div>
			</App>
		);
	}

}
