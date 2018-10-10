import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
// import { Dimmer } from 'semantic-ui-react';

import { connect as connectTo } from '../actions/ChainStoreAction';

import Header from '../components/Header';
import Navbar from '../components/Navbar';
import { FORM_SIGN_UP } from '../constants/FormConstants';

class App extends React.Component {

	componentDidMount() {
		this.props.connection();
	}

	renderChildren() {
		const { children } = this.props;
		return (
			<div className="temp-wrap">
				<div className="app-wrap">
					<Header />
					<Navbar />
					{children}

				</div>
			</div>
		);
	}

	render() {
		// Uncomment for dimmer
		// const { loading } = this.props;

		return this.renderChildren();
		// return loading ? <Dimmer /> : this.renderChildren();
	}

}

App.propTypes = {
	children: PropTypes.element.isRequired,
	// loading: PropTypes.bool.isRequired,
	connection: PropTypes.func.isRequired,
};

export default connect(
	(state) => ({
		globalLoading: state.global.get('globalLoading'),
		loading: state.form.getIn([FORM_SIGN_UP, 'loading']),
	}),
	(dispatch) => ({
		connection: () => dispatch(connectTo()),
	}),
)(App);
