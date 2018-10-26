import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';

import UserIcon from '../../components/UserIcon';
import { approveTransaction, cancelTransaction } from '../../actions/SignActions';

class SignTransaction extends React.Component {

	componentDidMount() {
		if (!this.props.transaction) {
			this.props.history.goBack();
		}
	}

	onApprove() {
		this.props.approve(this.props.transaction);
	}

	onCancel() {
		this.props.cancel(this.props.transaction);
	}

	render() {
		const { transaction } = this.props;

		return (
			<div className="incoming-transaction-wrap">
				<div className="incoming-transaction-bg">
					<Button
						className="btn-icon"
						content={<i className="icon-closeBig" />}
					/>

					<div className="title">New unsigned transaction</div>
				</div>
				<div className="incoming-transaction-page">

					<div className="wallet-info">
                        Wallet
						<div className="incoming-transaction-user">
							<UserIcon
								color="green"
								avatar="ava1"
							/>
							<div className="name">Homersimpson435</div>
						</div>
					</div>
					<div className="transaction-info">
						<div className="line">
							<div className="key">Type</div>
							<div className="value">New contract</div>
						</div>
						<div className="line">
							<div className="key">Amount</div>
							<div className="value">None</div>
						</div>
						<div className="line">
							<div className="key">Max transaction fee</div>
							<div className="value">
								<div className="balance">0.000000030000011111111111111111111111111</div>
								<div className="currency">ECHO</div>
							</div>
						</div>
						<div className="line">
							<div className="key">Max total</div>
							<div className="value"> {'<'} 0.0000001 ECHO</div>
						</div>
					</div>
				</div>
				<div className="page-action-wrap">
					<div className="two-btn-wrap" >
						<Button
							type="button"
							className="btn-transparent"
							content={<span className="btn-text">Approve</span>}
							onClick={(e) => this.onApprove(e)}
						/>
						<Button
							type="button"
							className="btn-in-light"
							content={<span className="btn-text">Reject</span>}
							onClick={(e) => this.onCancel(e)}
						/>

					</div>
				</div>
			</div>
		);
	}

}

SignTransaction.propTypes = {
	transaction: PropTypes.any,
	history: PropTypes.object.isRequired,
	approve: PropTypes.func.isRequired,
	cancel: PropTypes.func.isRequired,
};

SignTransaction.defaultProps = {
	transaction: null,
};

export default connect(
	(state) => ({
		transaction: state.global.getIn(['sign', 'transactions', 0]),
	}),
	(dispatch) => ({
		approve: (transaction) => dispatch(approveTransaction(transaction)),
		cancel: (transaction) => dispatch(cancelTransaction(transaction)),
	}),
)(SignTransaction);
