import React from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import query from 'query-string';

import { closePopup, globals } from '../../actions/SignActions';

import { NOT_LOGGED_STATUS, DISCONNECT_STATUS, POPUP_WINDOW_TYPE } from '../../constants/GlobalConstants';
import { INDEX_PATH } from '../../constants/RouterConstants';
import { ERROR_ACTIVE_ACCOUNT } from '../../constants/ErrorsConstants';

class ErrorTransaction extends React.PureComponent {

	onClick(e, network, account) {
		if (!this.props.isReturn) {
			closePopup(DISCONNECT_STATUS);
		}

		if (account) {
			closePopup(NOT_LOGGED_STATUS);
		} else if (network) {
			closePopup(DISCONNECT_STATUS);
		} else {
			closePopup();
		}


		if (globals.WINDOW_TYPE === POPUP_WINDOW_TYPE) {
			this.props.history.goBack();

			return null;
		}

		this.props.history.push(INDEX_PATH);

		return null;
	}

	render() {
		const { network, account } = query.parse(this.props.location.search);

		const { isReturn } = this.props;

		let error = (<div className="description">A problem has occurred while sending <br /> your transaction</div>);

		if (network || !isReturn) {
			error = (
				<div className="description">
					Connection was interrupted.
					<br /> Please, check transaction history to verify if transaction was sent.
				</div>
			);
		}

		if (account) {
			error = (<div className="description">{ERROR_ACTIVE_ACCOUNT}</div>);
		}

		return (
			<div className="transaction-status-wrap error">
				<div className="transaction-status-body">
					<div className="title">Error</div>
					{error}
				</div>
				<div className="page-action-wrap">
					<div className="one-btn-wrap">
						<Button
							className="btn-inverted error"
							content={<span className="btn-text">Return</span>}
							onClick={(e) => this.onClick(e, network, account)}
						/>
					</div>
				</div>
			</div>
		);
	}

}

ErrorTransaction.propTypes = {
	isReturn: PropTypes.bool,
	history: PropTypes.object.isRequired,
	location: PropTypes.object.isRequired,
};

ErrorTransaction.defaultProps = {
	isReturn: true,
};

export default ErrorTransaction;
