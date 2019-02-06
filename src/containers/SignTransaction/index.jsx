/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Map } from 'immutable';

import UserIcon from '../../components/UserIcon';

import {
	approve,
	cancelTransaction,
	globals,
} from '../../actions/SignActions';

import { INDEX_PATH, NETWORK_ERROR_SEND_PATH } from '../../constants/RouterConstants';
import { POPUP_WINDOW_TYPE } from '../../constants/GlobalConstants';
import GlobalReducer from '../../reducers/GlobalReducer';
import { operationFields } from '../../constants/OperationConstants';
import FormatHelper from '../../helpers/FormatHelper';

class SignTransaction extends React.Component {

	componentDidMount() {
		if (!this.props.transaction) {
			if (globals.WINDOW_TYPE !== POPUP_WINDOW_TYPE) {
				this.props.history.push(INDEX_PATH);
			} else {
				this.props.history.push(NETWORK_ERROR_SEND_PATH);
			}

			return null;
		}

		const options = this.props.transaction.get('options');
		const account = this.props.accounts
			.find((value) => [options[0][1].from, options[0][1].registrar].includes(value.id));
		this.props.set('signAccount', new Map(account));

		return null;
	}

	onApprove() {
		this.props.approve(this.props.transaction.get('options'), this.props.transaction.get('id'));
	}

	onCancel() {
		this.props.cancel(this.props.transaction.get('id'));
	}

	getOptions() {
		const { transactionShow } = this.props;

		if (!transactionShow) {
			return null;
		}

		const typeParams = operationFields[transactionShow.get('type')];

		const mapShow = [];

		transactionShow.mapEntries(([key, value]) => {
			if (!value) {
				return null;
			}

			if (typeParams[key]) {
				switch (typeParams[key].type) {
					case 'asset_object':
						mapShow.push(<div className="line">
							<div className="key">{FormatHelper.capitalize(key)}</div>
							<div className="value">
								{
									FormatHelper.formatAmount(
										value.amount,
										value.asset_id.precision,
										value.asset_id.symbol,
									)
								}
							</div>
						</div>);

						break;
					case 'account_id':
						mapShow.push(<div className="line">
							<div className="key">{FormatHelper.capitalize(key)}</div>
							<div className="value">
								{value.name}
							</div>
						</div>);

						break;
					default:
						mapShow.push(<div className="line">
							<div className="key">{FormatHelper.capitalize(key === 'memo' ? 'note' : key)}</div>
							<div className="value">
								{value}
							</div>
						</div>);
						break;
				}

				return null;
			}

			mapShow.push(<div className="line">
				<div className="key">{FormatHelper.capitalize(key)}</div>
				<div className="value">
					{value}
				</div>
			</div>);

			return null;
		});

		return mapShow;
	}

	render() {
		const {
			transaction, account, loading, transactionShow,
		} = this.props;

		if (!transaction || !account || !transactionShow) {
			return null;
		}

		return (
			<div className="incoming-transaction-wrap">
				<div className="incoming-transaction-bg">
					<button
						onClick={(e) => this.onCancel(e)}
						className="button ui icon-closeSmall btn-icon"
						disabled={loading}
					/>
					<div className="title">New unsigned transaction</div>
				</div>
				<div className="incoming-transaction-page">
					{
						account ?
							<div className="wallet-info">
								<div className="title">Wallet</div>
								<div className="incoming-transaction-user">
									<UserIcon
										avatar={`ava${account.get('icon')}`}
										color={account.get('iconColor')}
									/>
									<div className="name">
										{account.get('name')}
									</div>
								</div>
							</div> : null
					}
					<div className="transaction-info">
						{
							this.getOptions()
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
	transactionShow: PropTypes.any,
	accounts: PropTypes.object,
	account: PropTypes.object,
	history: PropTypes.object.isRequired,
	approve: PropTypes.func.isRequired,
	cancel: PropTypes.func.isRequired,
	set: PropTypes.func.isRequired,
};

SignTransaction.defaultProps = {
	transaction: null,
	transactionShow: null,
	accounts: null,
	account: null,
	loading: false,
};

export default connect(
	(state) => ({
		loading: state.global.get('loading'),
		transaction: state.global.getIn(['sign', 'current']),
		transactionShow: state.global.getIn(['sign', 'dataToShow']),
		accounts: state.global.getIn([
			'accounts',
			state.global.getIn(['network', 'name']),
		]),
		account: state.global.get('signAccount'),
	}),
	(dispatch) => ({
		approve: (options, id) => dispatch(approve(options, id)),
		cancel: (transaction) => dispatch(cancelTransaction(transaction)),
		set: (field, value) => dispatch(GlobalReducer.actions.set({ field, value })),
	}),
)(SignTransaction);
