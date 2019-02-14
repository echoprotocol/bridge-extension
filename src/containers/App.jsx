/* global EXTENSION */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Dimmer, Sidebar } from 'semantic-ui-react';

import { globalInit, initListeners as init } from '../actions/GlobalActions';

import Navigator from '../components/Navigator';
import Modals from '../components/Modals';

import { PIN_PATHS, SIGN_TRANSACTION_PATH } from '../constants/RouterConstants';

import bridgeLogo from '../assets/images/bridge-logo-hor-bw.svg';


class App extends React.Component {


	componentDidMount() {
		this.props.initListeners();
		this.props.initApp();
	}


	renderHeader(pathname) {
		if (PIN_PATHS.includes(pathname)) {
			return (
				<div className="header-bridge-image">
					<img className="logo" src={bridgeLogo} alt="Bridge" />
				</div>
			);
		}

		return (
			<Navigator pathname={pathname} />
		);
	}

	renderApp() {
		const { children, loading, pathname } = this.props;

		return (
			<div className={classnames('app-wrap', { dark: PIN_PATHS.includes(pathname) })}>
				<Sidebar.Pushable>
					{ this.renderHeader(pathname) }
					{children}
					<Modals />
				</Sidebar.Pushable>
				{
					loading ?
						<Dimmer
							active
							className={classnames({
								noBg: SIGN_TRANSACTION_PATH === pathname,
							})}
							inverted
						/> : null
				}
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
	initListeners: PropTypes.func.isRequired,
};
export default connect(
	(state) => ({
		loading: state.global.get('loading'),
		pathname: state.router.location.pathname,
	}),
	(dispatch) => {
		const initApp = () => dispatch(globalInit());
		const initListeners = () => dispatch(init());

		return {
			initApp,
			initListeners,
		};
	},
)(App);
