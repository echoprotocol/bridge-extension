import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { withRouter } from 'react-router';

import CreateAccount from '../containers/CreateAccount';
import Welcome from '../containers/Welcome';

import history from '../history';
import { INDEX_PATH, WIF_PATH } from '../constants/RouterConstants';

class CreateAccountWizard extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			wif: '',
		};
	}

	saveWif(wif) {
		if (wif) {
			this.setState({ wif });

			history.push(WIF_PATH);
		}
	}

	resetWif() {
		this.setState({ wif: '' });

		history.push(INDEX_PATH);
	}

	render() {
		const { wif } = this.state;
		const values = queryString.parse(this.props.location.search);

		return (
			!wif || !values.success
				? <CreateAccount saveWif={(newWif) => this.saveWif(newWif)} />
				: <Welcome resetWif={() => this.resetWif()} wif={wif} />
		);
	}

}

CreateAccountWizard.propTypes = {
	location: PropTypes.object.isRequired,
};

export default withRouter(CreateAccountWizard);
