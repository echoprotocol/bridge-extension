import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import UserIcon from '../../components/UserIcon';

import {
	approveTransaction,
	cancelTransaction,
	globals,
} from '../../actions/SignActions';

import { formatToShow } from '../../services/operation';

import { operationKeys, operationTypes } from '../../constants/OperationConstants';
import { INDEX_PATH, NETWORK_ERROR_SEND_PATH } from '../../constants/RouterConstants';
import { POPUP_WINDOW_TYPE } from '../../constants/GlobalConstants';

import FormatHelper from '../../helpers/FormatHelper';

class SignTransaction extends React.Component {

	componentDidMount() {
		if (!this.props.transaction) {
			if (globals.WINDOW_TYPE !== POPUP_WINDOW_TYPE) {
				this.props.history.push(INDEX_PATH);
			} else {
				this.props.history.push(NETWORK_ERROR_SEND_PATH);
			}
		}
	}

	onApprove() {
		this.props.approve(this.props.transaction);
	}

	onCancel() {
		this.props.cancel(this.props.transaction.get('id'));
	}

	render() {
		const {
			transaction, accounts, loading,
		} = this.props;

		if (!transaction) {
			return null;
		}

		const options = transaction.get('options');

		const show = formatToShow(options.type, options);
		const accountKey = operationKeys[options.type];
		const account = accounts.find((a) => a.name === show[accountKey]);

		return (
			<div className="incoming-transaction-wrap">
				<div className="incoming-transaction-bg">
					<button className="button ui icon-closeSmall btn-icon" />
					<div className="title">New unsigned transaction</div>
				</div>
				<div className="incoming-transaction-page">
					{
						account ?
							<div className="wallet-info">
								<div className="title">Wallet</div>
								<div className="incoming-transaction-user">
									<UserIcon
										avatar={`ava${account.icon}`}
										color={account.iconColor}
									/>
									<div className="name">
										{account.name}
									</div>
								</div>
							</div> : null
					}
					<div className="transaction-info">
						{
							Object.entries(show).map(([key, value]) => (
								<div className="line" key={key}>
									<div className="key">{FormatHelper.capitalize(key)}</div>
									<div className="value">
										{key === 'type' ? operationTypes[value].name : value}
									</div>
								</div>
							))
						}
						{
							/*
							<div className="line">
								<div className="key">Type</div>
								<div className="value">Transfer</div>
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
							*/
						}
					</div>
				</div>
				<div className="page-action-wrap">
					<div className="two-btn-wrap" >
						<Button
							type="button"
							className={classnames('btn-in-light', { loading })}
							content={<span className="btn-text">Approve</span>}
							onClick={(e) => this.onApprove(e)}
							disabled={loading}
						/>
						<Button
							type="button"
							className="btn-transparent"
							content={<span className="btn-text">Reject</span>}
							onClick={(e) => this.onCancel(e)}
							disabled={loading}
						/>

					</div>
				</div>
			</div>
		);
	}

}

SignTransaction.propTypes = {
	loading: PropTypes.bool,
	transaction: PropTypes.any,
	accounts: PropTypes.object,
	history: PropTypes.object.isRequired,
	approve: PropTypes.func.isRequired,
	cancel: PropTypes.func.isRequired,
};

SignTransaction.defaultProps = {
	transaction: null,
	accounts: null,
	loading: false,
};

export default connect(
	(state) => ({
		loading: state.global.get('loading'),
		transaction: state.global.getIn(['sign', 'current']),
		accounts: state.global.getIn([
			'accounts',
			state.global.getIn(['network', 'name']),
		]),
	}),
	(dispatch) => ({
		approve: (transaction) => dispatch(approveTransaction(transaction)),
		cancel: (transaction) => dispatch(cancelTransaction(transaction)),
	}),
)(SignTransaction);
