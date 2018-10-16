/* global EXTENSION */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Dimmer } from 'semantic-ui-react';

import { connect as connectTo } from '../actions/ChainStoreAction';

import Header from '../components/Header';
import Navbar from '../components/Navbar';

class App extends React.Component {

	componentDidMount() {
		this.props.connection();
	}

	renderExtension() {
		const { children, loading } = this.props;

		return (
			<React.Fragment>
				<div className="app-wrap">
					<Header />
					<Navbar />
					{children}
					{
						(loading) && <Dimmer active inverted />
					}
				</div>
			</React.Fragment>
		);
	}

	renderApp() {
		const { children, loading } = this.props;

		return (
			<div className="temp-wrap">
				<div className="app-wrap">
					<Header />
					{/* <Navbar /> */}
					{children}
					{
						(loading) && <Dimmer active inverted />
					}
				</div>
			</div>
		);
	}

	renderChildren() {
		return EXTENSION ? this.renderExtension() : this.renderApp();
	}

	render() {
		return this.renderChildren();
	}

}

App.propTypes = {
	children: PropTypes.element.isRequired,
	loading: PropTypes.bool.isRequired,
	connection: PropTypes.func.isRequired,
};
export default connect(
	(state) => ({
		loading: state.global.get('loading'),
	}),
	(dispatch) => ({
		connection: () => dispatch(connectTo()),
	}),
)(App);
