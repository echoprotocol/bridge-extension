/* global EXTENSION */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Dimmer, Sidebar } from 'semantic-ui-react';

import { globalInit } from '../actions/GlobalActions';

import Navigator from '../components/Navigator';


import { PIN_PATHS } from '../constants/RouterConstants';

class App extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			visible: false,
		};
	}

	componentDidMount() {
		this.props.initApp();
	}

	onSidebarToggle() {
		this.setState({ visible: !this.state.visible });
	}

	renderHeader(pathname) {
		if (PIN_PATHS.includes(pathname)) {
			return (
				<div className="header-bridge-image">
					<span>Bridge</span>
				</div>
			);
		}

		const { visible } = this.state;

		return (
			<Navigator
				visible={visible}
				onSidebarToggle={() => this.onSidebarToggle()}
			/>
		);
	}

	renderApp() {
		const { children, loading, pathname } = this.props;

		return (
			<div className={classnames('app-wrap', { dark: PIN_PATHS.includes(pathname) })}>
				<Sidebar.Pushable>
					{ this.renderHeader(pathname) }
					{children}
				</Sidebar.Pushable>
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
	initApp: PropTypes.func.isRequired,
};
export default connect(
	(state) => ({
		loading: state.global.get('loading'),
		pathname: state.router.location.pathname,
	}),
	(dispatch) => ({
		initApp: () => dispatch(globalInit()),
	}),
)(App);
