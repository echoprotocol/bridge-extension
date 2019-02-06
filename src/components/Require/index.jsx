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
} from '../../constants/RouterConstants';

export function required(Component) {

	class RequiredComponent extends React.Component {

		componentDidMount() {
			this.check();
		}

		componentDidUpdate() {
			this.check();
		}

		check() {
			const { isLogin, isLocked, isSign } = this.props;
			const { pathname } = this.props.history.location;

			if (isLocked) {
				this.props.history.push(UNLOCK_PATH);
				return;
			}

			if (!isLogin.size) {
				this.props.history.push(CREATE_ACCOUNT_PATH);
				return;
			}

			if (
				isSign
				&& pathname !== SIGN_TRANSACTION_PATH
				&& ![SUCCESS_SEND_PATH, ERROR_SEND_PATH, NETWORK_ERROR_SEND_PATH].includes(pathname)
			) {
				this.props.history.push(SIGN_TRANSACTION_PATH);
			}
		}

		render() {
			const { isLogin, isLocked, isSign } = this.props;
			const { pathname } = this.props.history.location;

			if (isLocked || !isLogin.size) {
				return null;
			}

			if (
				isSign
				&& pathname !== SIGN_TRANSACTION_PATH
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
		isLocked: PropTypes.bool,
		isSign: PropTypes.bool,
		dispatch: PropTypes.func.isRequired,
	};

	RequiredComponent.defaultProps = {
		isLocked: true,
		isSign: true,
	};

	return connect((state) => ({
		isLocked: state.global.getIn(['crypto', 'isLocked']),
		isLogin: state.global.get('account'),
		isSign: !!state.global.getIn(['sign', 'current']),
	}))(RequiredComponent);

}
