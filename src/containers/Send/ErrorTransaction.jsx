import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import query from 'query-string';

import { cancelTransaction, closePopup, globals } from '../../actions/SignActions';

import { NOT_LOGGED_STATUS, DISCONNECT_STATUS, POPUP_WINDOW_TYPE } from '../../constants/GlobalConstants';
import { INDEX_PATH } from '../../constants/RouterConstants';

class ErrorTransaction extends React.PureComponent {

	onClick(e, network, account, parse) {
		if (!this.props.isReturn) {
			closePopup(DISCONNECT_STATUS);
		}

		if (account) {
			closePopup(NOT_LOGGED_STATUS);
		} else if (network) {
			closePopup(DISCONNECT_STATUS);
		} else if (parse) {
			this.props.cancel(this.props.transaction.get('id'));
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
		const { network, account, parse } = query.parse(this.props.location.search);

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

		if (parse) {
			error = (
				<div className="description">
					<br /> Transaction can&apos;t be processed
				</div>
			);
		}

		if (account) {
			error = (<div className="description">You have to add account first</div>);
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
							onClick={(e) => this.onClick(e, network, account, parse)}
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
	transaction: PropTypes.object.isRequired,
	cancel: PropTypes.func.isRequired,
};

ErrorTransaction.defaultProps = {
	isReturn: true,
};

export default connect(
	(state) => ({ transaction: state.global.getIn(['sign', 'current']) }),
	(dispatch) => ({
		cancel: (transaction) => dispatch(cancelTransaction(transaction)),
	}),
)(ErrorTransaction);
