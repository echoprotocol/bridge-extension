/* global EXTENSION */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Dimmer } from 'semantic-ui-react';

import { connect as connectTo } from '../actions/ChainStoreAction';

import Header from '../components/Header';
import Navbar from '../components/Navbar';

import { PIN_PATHS } from '../constants/RouterConstants';

class App extends React.Component {

	componentDidMount() {
		this.props.connection();
	}

	renderHeader(pathname) {
		if (PIN_PATHS.includes(pathname)) {
			return (
				<div className="header-bridge-image">
					<span>Bridge</span>
				</div>
			);
		}

		return (
			<React.Fragment>
				<Header />
				<Navbar />
			</React.Fragment>
		);
	}

	renderApp() {
		const { children, loading, pathname } = this.props;

		return (
			<div className={classnames('app-wrap', { dark: PIN_PATHS.includes(pathname) })}>
				{ this.renderHeader(pathname) }
				{children}
				{ loading ? <Dimmer active inverted /> : null }
			</div>
		);
	}

	render() {
		return EXTENSION ? this.renderApp() : (
			<div className="temp-wrap">
				{ this.renderApp() }
			</div>
		);
	}

}

App.propTypes = {
	children: PropTypes.element.isRequired,
	loading: PropTypes.bool.isRequired,
	pathname: PropTypes.string.isRequired,
	connection: PropTypes.func.isRequired,
};
export default connect(
	(state) => ({
		loading: state.global.get('loading'),
		pathname: state.router.location.pathname,
	}),
	(dispatch) => ({
		connection: () => dispatch(connectTo()),
	}),
)(App);
