/* eslint-disable import/prefer-default-export */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { CONNECTION_ERROR_PATH } from '../../constants/RouterConstants';

export function isConnected(Component) {

	class ConnectedComponent extends React.Component {

		componentDidMount() {
			this.check();
		}

		componentDidUpdate() {
			this.check();
		}

		check() {
			const { connected, loading } = this.props;

			if (!loading && !connected) {
				this.props.history.push(CONNECTION_ERROR_PATH);
			}
		}

		render() {

			return (<Component {...this.props} />);
		}

	}

	ConnectedComponent.propTypes = {
		history: PropTypes.object.isRequired,
		loading: PropTypes.bool.isRequired,
		connected: PropTypes.bool,
	};

	ConnectedComponent.defaultProps = {
		connected: false,
	};

	return connect((state) => ({
		loading: state.global.get('loading'),
		connected: state.global.get('connected'),
	}))(ConnectedComponent);

}
