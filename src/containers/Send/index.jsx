import React from 'react';
import { Button } from 'semantic-ui-react';
import CustomScroll from 'react-custom-scroll';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import _ from 'lodash';

import { send, setFeeFormValue } from '../../actions/BalanceActions';
import { clearForm, setFormError, setFormValue } from '../../actions/FormActions';
import { storageGetDraft, storageRemoveDraft, storageSetDraft } from '../../actions/GlobalActions';

import { INDEX_PATH } from '../../constants/RouterConstants';
import { FORM_SEND } from '../../constants/FormConstants';
import { KEY_CODE_ENTER, CORE_ID } from '../../constants/GlobalConstants';

import BridgeInput from '../../components/BridgeInput';
import BridgeTextArea from '../../components/BridgeTextArea';

import ValidateSendHelper from '../../helpers/ValidateSendHelper';
import ValidateTransactionHelper from '../../helpers/ValidateTransactionHelper';

import arrowLeft from '../../assets/images/icons/arrow_dark_left.svg';

import GlobalReducer from '../../reducers/GlobalReducer';

class Send extends React.Component {

	constructor(props) {
		super(props);

		this.toRef = null;
		this.amountRef = null;

		this.state = {
			timeout: null,
			warning: false,
		};

	}

	componentWillMount() {
		storageGetDraft().then((draft) => {
			if (!draft) {
				return null;
			}

			Object
				.entries(draft[FORM_SEND])
				.forEach(([key, value]) => {
					if (key === 'loading') {
						this.props.continueLoading();
					} else {
						this.props.setFormValue(key, value);
					}
				});

			return null;
		});
	}


	componentWillReceiveProps(nextProps) {
		if (_.isEqual(this.props, nextProps)) { return; }

		if (this.state.timeout) {
			clearTimeout(this.state.timeout);
		}

		const { to, amount, loading } = nextProps;

		if (to.value && amount.value && !loading) {
			this.setState({
				timeout: setTimeout(() => {
					this.props.setFeeFormValue();
				}, 300),
			});
		} else {
			this.props.setFormValue('fee', '');
		}
	}

	componentDidUpdate(prevProps) {
		const { to: prevTo, amount: prevAmount } = prevProps;

		const {
			to, amount,
		} = this.props;


		if ((to.value !== prevTo.value) || (amount.value !== prevAmount.value)) {
			return false;
		}

		if (to.error && !amount.error && this.toRef) {
			this.toRef.focus();
		} else if (amount.error && this.amountRef) {
			this.amountRef.focus();
		}

		return true;
	}

	componentWillUnmount() {
		storageRemoveDraft();

		this.props.clearForm();
	}

	onChange(e, lowerCase) {

		const field = e.target.name;
		let { value } = e.target;

		if (lowerCase) {
			value = value.toLowerCase();
		}

		let error = null;

		if (field && field === 'memo') {
			error = ValidateSendHelper.validateMemo(value);
		}

		if (error) {
			this.props.setFormError(field, error);
			return null;
		}

		if (field) {
			this.props.setFormValue(field, value);

			storageSetDraft(FORM_SEND, field, value);
		}

		return null;
	}

	onAmountChange(e) {

		const {
			selectedBalance, balances, assets, tokens, account,
		} = this.props;

		const field = e.target.name;

		const value = e.target.value.replace(/\s+/g, '');


		let precision = null;
		let symbol = null;

		if (!ValidateTransactionHelper.validateContractId(selectedBalance)) {
			precision = tokens.getIn([account.get('id'), selectedBalance, 'precision']);
			symbol = tokens.getIn([account.get('id'), selectedBalance, 'symbol']);
		}
		let balance = balances.getIn([selectedBalance, 'asset_type']);
		if (!balance) {
			balance = CORE_ID;
		}

		const asset = assets.get(balance);

		const { value: validatedValue, error, warning } =
			ValidateSendHelper.amountInput(value, {
				precision: precision || asset.get('precision'),
				symbol: symbol || asset.get('symbol'),
			});

		if (error) {
			this.props.setFormError(field, error);

			if (warning) {
				this.setState({ warning });
			}

			return false;
		}

		this.setState({ warning: false });
		this.props.setFormValue(field, validatedValue);

		storageSetDraft(FORM_SEND, field, value);

		return true;
	}

	onSend() {
		this.props.send();
	}

	onKeyPress(e) {
		const { to, amount } = this.props;

		const code = e.keyCode || e.which;

		if (KEY_CODE_ENTER === code && to.value && amount.value) {
			this.props.send();
		}
	}

	onBlur(value) {
		if (!this.state.warning) {
			return false;
		}

		this.setState({ warning: false });

		this.props.setFormError(value, null);

		return true;
	}

	handleRef(ref, type) {
		if (ref) {
			this[`${type}Ref`] = ref.bridgeInput;
		}
	}

	isSelectedToken(amount) {

		if (amount) {
			amount = amount.split('.');
			return amount.splice(0, 2).join('.') !== '1.16';
		}
		return true;

	}

	render() {
		const {
			to, amount, selectedBalance, fee, memo, account, loading, balances, assets, tokens,
		} = this.props;

		if (!account) {
			return null;
		}

		return (
			<React.Fragment>
				<div className="return-block">
					<Link to={INDEX_PATH} className="link-return">
						<img src={arrowLeft} alt="" />
						<span className="link-text">Return</span>
					</Link>
				</div>
				<div
					className="user-scroll"
					style={{ height: '440px' }}
				>
					<CustomScroll
						flex="1"
						heightRelativeToParent="calc(100%)"
					>
						<div className="wallet-send-block">
							<div className="form-wrap">
								<BridgeInput
									name="From"
									theme="input-light"
									labelText="From"
									value={account.get('name')}
									defaultUp
									readOnly
									userIcon={{ icon: account.get('icon'), color: account.get('iconColor') }}
									leftLabel
									disabled
								/>
								<BridgeInput
									autoFocus
									name="to"
									theme="input-light"
									labelText="To"
									defaultUp
									placeholder="Receiver's name"
									leftLabel
									value={to.value}
									onChange={(e) => this.onChange(e, true)}
									error={!!to.error}
									errorText={to.error}
									onKeyPress={(e) => this.onKeyPress(e)}
									disabled={loading}
									ref={(r) => this.handleRef(r, 'to')}
								/>
								<BridgeInput
									name="amount"
									theme="input-light"
									placeholder="0"
									defaultUp
									labelText="Amount"
									leftLabel
									innerDropdown={{
										dropdownData: {
											balances,
											assets,
											account,
											tokens,
										},
										path: { form: FORM_SEND, field: 'selectedBalance' },
									}}
									value={amount.value}
									onChange={(e) => this.onAmountChange(e)}
									error={!!amount.error}
									errorText={amount.error}
									onKeyPress={(e) => this.onKeyPress(e)}
									disabled={loading}
									onBlur={(value) => this.onBlur(value)}
									ref={(r) => this.handleRef(r, 'amount')}
								/>

								<BridgeInput
									name="fee"
									theme="input-light"
									placeholder="0"
									defaultUp
									labelText="Fee"
									leftLabel
									innerDropdown={{
										dropdownData: {
											balances,
											assets,
											account,
										},
										path: { form: FORM_SEND, field: 'selectedFeeBalance' },
									}}
									value={fee.value.toString()}
									disabled
									error={!!fee.error}
									errorText={fee.error}
								/>

								{
									this.isSelectedToken(selectedBalance) ?
										<div className="message-error">

											<BridgeTextArea
												name="memo"
												value={memo.value}
												onChange={(e) => this.onChange(e)}
												label="Note (Optional)"
												error={!!memo.error}
												errorText={memo.error}
												disabled={loading}
											/>
										</div> : null
								}
							</div>
							<Button
								className={classnames('btn-in-light', { loading })}
								disabled={(!to.value || !amount.value || !!memo.error || loading)}
								content={<span className="btn-text">Send</span>}
								onClick={() => this.onSend()}
								type="submit"
							/>
						</div>
					</CustomScroll>
				</div>
			</React.Fragment>
		);
	}

}

Send.propTypes = {
	loading: PropTypes.bool,
	account: PropTypes.object,
	to: PropTypes.object.isRequired,
	amount: PropTypes.object.isRequired,
	fee: PropTypes.object.isRequired,
	memo: PropTypes.object.isRequired,
	balances: PropTypes.object.isRequired,
	assets: PropTypes.object.isRequired,
	tokens: PropTypes.object.isRequired,
	selectedBalance: PropTypes.string,
	setFormValue: PropTypes.func.isRequired,
	setFormError: PropTypes.func.isRequired,
	send: PropTypes.func.isRequired,
	clearForm: PropTypes.func.isRequired,
	setFeeFormValue: PropTypes.func.isRequired,
	continueLoading: PropTypes.func.isRequired,
};

Send.defaultProps = {
	account: null,
	loading: false,
	selectedBalance: '1.3.0',
};

export default connect(
	(state) => ({
		account: state.global.get('account'),
		to: state.form.getIn([FORM_SEND, 'to']),
		amount: state.form.getIn([FORM_SEND, 'amount']),
		fee: state.form.getIn([FORM_SEND, 'fee']),
		memo: state.form.getIn([FORM_SEND, 'memo']),
		selectedBalance: state.form.getIn([FORM_SEND, 'selectedBalance']),
		selectedFeeBalance: state.form.getIn([FORM_SEND, 'selectedFeeBalance']),
		balances: state.balance.get('balances'),
		assets: state.balance.get('assets'),
		tokens: state.balance.get('tokens'),
		loading: state.global.get('loading'),
	}),
	(dispatch) => ({
		setFormValue: (field, value) => dispatch(setFormValue(FORM_SEND, field, value)),
		setFormError: (field, value) => dispatch(setFormError(FORM_SEND, field, value)),
		setFeeFormValue: () => dispatch(setFeeFormValue()),
		send: () => dispatch(send()),
		clearForm: () => dispatch(clearForm(FORM_SEND)),
		continueLoading: () => dispatch(GlobalReducer.actions.set({ field: 'loading', value: true })),
	}),
)(Send);
