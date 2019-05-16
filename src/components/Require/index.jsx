/* eslint-disable import/prefer-default-export */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
	CREATE_ACCOUNT_PATH,
	UNLOCK_PATH,
	SIGN_TRANSACTION_PATH,
	SUCCESS_SEND_PATH,
	ERROR_SEND_PATH,
	NETWORK_ERROR_SEND_PATH,
	CONNECTION_ERROR_PATH,
	INCOMING_CONNECTION_PATH,
} from '../../constants/RouterConstants';
import { globals } from '../../actions/SignActions';

export function required(Component) {

	class RequiredComponent extends React.Component {

		componentDidMount() {
			this.check();
		}

		componentDidUpdate() {
			this.check();
		}

		check() {
			const {
				isLogin, isLocked, isSign, connected, loading, isProviderApproval,
			} = this.props;

			const { pathname } = this.props.history.location;

			if (!connected && !loading) {
				this.props.history.push(CONNECTION_ERROR_PATH);
				return;
			}

			if (isLocked) {
				this.props.history.push(UNLOCK_PATH);
				return;
			}

			if (isProviderApproval) {
				if (
					pathname !== INCOMING_CONNECTION_PATH
					&& globals.WINDOW_PATH !== SIGN_TRANSACTION_PATH
				) {
					this.props.history.push(INCOMING_CONNECTION_PATH);
				}

				return;
			}

			if (!isLogin.size) {
				this.props.history.push(CREATE_ACCOUNT_PATH);
				return;
			}

			if (
				isSign
				&& pathname !== SIGN_TRANSACTION_PATH
				&& globals.WINDOW_PATH !== INCOMING_CONNECTION_PATH
				&& ![SUCCESS_SEND_PATH, ERROR_SEND_PATH, NETWORK_ERROR_SEND_PATH].includes(pathname)
			) {
				this.props.history.push(SIGN_TRANSACTION_PATH);
			}
		}

		render() {
			const {
				isLogin, isLocked, isSign, isProviderApproval,
			} = this.props;
			const { pathname } = this.props.history.location;

			if (isLocked || (!isLogin.size && !isProviderApproval)) {
				return null;
			}

			if (
				(isProviderApproval || isSign)
				&& ![SIGN_TRANSACTION_PATH, INCOMING_CONNECTION_PATH].includes(pathname)
                && ![SUCCESS_SEND_PATH, ERROR_SEND_PATH].includes(pathname)
			) {
				return null;
			}

			return (<Component {...this.props} />);
		}

	}

	RequiredComponent.propTypes = {
		isLogin: PropTypes.object.isRequired,
		history: PropTypes.object.isRequired,
		connected: PropTypes.bool,
		loading: PropTypes.bool.isRequired,
		isLocked: PropTypes.bool,
		isSign: PropTypes.bool,
		isProviderApproval: PropTypes.bool,
		dispatch: PropTypes.func.isRequired,
	};

	RequiredComponent.defaultProps = {
		connected: false,
		isLocked: true,
		isSign: true,
		isProviderApproval: true,
	};

	return connect((state) => ({
		isLocked: state.global.getIn(['crypto', 'isLocked']),
		isLogin: state.global.get('account'),
		isSign: !!state.global.getIn(['sign', 'current']),
		isProviderApproval: !!state.global.get('providerRequests').size,
		connected: state.global.get('connected'),
		loading: state.global.get('loading'),
	}))(RequiredComponent);

}
