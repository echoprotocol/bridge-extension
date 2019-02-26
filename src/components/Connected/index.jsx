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
			const { connected } = this.props;

			if (!connected) {
				this.props.history.push(CONNECTION_ERROR_PATH);
			}
		}

		render() {

			return (<Component {...this.props} />);
		}

	}

	ConnectedComponent.propTypes = {
		history: PropTypes.object.isRequired,
		connected: PropTypes.bool,
	};

	ConnectedComponent.defaultProps = {
		connected: false,
	};

	return connect((state) => ({
		connected: state.global.get('connected'),
	}))(ConnectedComponent);

}
