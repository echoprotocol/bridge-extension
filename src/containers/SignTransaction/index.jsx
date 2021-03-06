/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Map } from 'immutable';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import Avatar from '../../components/Avatar';
import iconCopy from '../../assets/images/icons/copy.svg';

import {
	approve,
	cancelTransaction,
	globals,
} from '../../actions/SignActions';

import { ACCOUNT_ERROR_SEND_PATH, INDEX_PATH, NETWORK_ERROR_SEND_PATH, PARSE_ERROR_SEND_PATH } from '../../constants/RouterConstants';
import { POPUP_WINDOW_TYPE } from '../../constants/GlobalConstants';
import { operationFields, operationKeys, operationTypes } from '../../constants/OperationConstants';

import GlobalReducer from '../../reducers/GlobalReducer';

import FormatHelper from '../../helpers/FormatHelper';

class SignTransaction extends React.Component {

	constructor(props) {
		super(props);
		this.valueRef = React.createRef();
		this.state = {
			inputWidth: 0,
		};
	}

	componentDidMount() {
		if (!this.props.transaction) {
			if (globals.WINDOW_TYPE !== POPUP_WINDOW_TYPE) {

				this.props.history.push(INDEX_PATH);
			} else {
				this.props.history.push(NETWORK_ERROR_SEND_PATH);
			}

			return null;
		}

		if (!this.props.loadingTransaction && !this.props.transactionShow) {
			this.props.history.push(PARSE_ERROR_SEND_PATH);
			return null;
		}

		if (!this.props.transactionShow) {
			return null;
		}

		this.loadInfo();

		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState({ inputWidth: this.valueRef.current.getBoundingClientRect().width });
		return null;
	}

	componentDidUpdate(prevProps) {
		if (prevProps.loadingTransaction &&
			!this.props.loadingTransaction && !this.props.transactionShow) {
			this.props.history.push(PARSE_ERROR_SEND_PATH);
			return;
		}
		if (!prevProps.transactionShow && this.props.transactionShow) {
			this.loadInfo();
		}
	}

	onApprove() {
		this.props.approve(this.props.transaction.get('options'), this.props.transaction.get('id'));
	}

	onCancel() {
		this.props.cancel(this.props.transaction.get('id'));
	}

	getOptions() {
		const { transactionShow } = this.props;
		const { inputWidth } = this.state;
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
							<div className="key">{FormatHelper.formatOperationKey(key)}</div>
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
							<div className="key">{FormatHelper.formatOperationKey(key)}</div>
							<div className="value">
								{value.name}
							</div>
						</div>);

						break;
					default:
						mapShow.push(<div className="line">
							<div className="key">{FormatHelper.formatOperationKey(key)}</div>
							{inputWidth >= 132 &&
								<CopyToClipboard text={value}>
									<div className={classnames('btn-copy', 'sm')} >
										<img src={iconCopy} alt="" />
									</div>
								</CopyToClipboard>}
							<div className="value" ref={this.valueRef}>
								{value}
							</div>
						</div>);
						break;
				}

				return null;
			}

			if (key === 'type') {
				mapShow.unshift(<div className="line">
					<div className="key">{FormatHelper.formatOperationKey(key)}</div>
					<div className="value">
						{operationTypes[value] ? operationTypes[value].name : value}
					</div>
				</div>);

				return null;
			}

			mapShow.push(<div className="line">
				<div className="key">{FormatHelper.formatOperationKey(key)}</div>
				{inputWidth >= 132 &&
				<CopyToClipboard text={value}>
					<div className={classnames('btn-copy', 'sm')} >
						<img src={iconCopy} alt="" />
					</div>
				</CopyToClipboard> }
				<div className="value" ref={this.valueRef}>
					{value}
				</div>
			</div>);

			return null;
		});

		return mapShow;
	}

	loadInfo() {
		const { transactionShow, transaction } = this.props;
		const options = transaction.get('options');
		const type = transactionShow.get('type');

		const account = this.props.accounts
			.find((value) => options[0][1][operationKeys[type]] === value.id);

		if (!account) {
			this.props.history.push(ACCOUNT_ERROR_SEND_PATH);
			return null;
		}

		this.props.set('signAccount', new Map(account));

		return null;
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
									<Avatar name={account.get('name')} />
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
	loadingTransaction: PropTypes.bool,
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
	loadingTransaction: true,
};

export default connect(
	(state) => ({
		loading: state.global.get('loading'),
		transaction: state.global.getIn(['sign', 'current']),
		transactionShow: state.global.getIn(['sign', 'dataToShow']),
		loadingTransaction: state.global.getIn(['sign', 'loading']),
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
