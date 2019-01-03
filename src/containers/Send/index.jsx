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

import { INDEX_PATH } from '../../constants/RouterConstants';
import { FORM_SEND } from '../../constants/FormConstants';
import { KEY_CODE_ENTER } from '../../constants/GlobalConstants';

import BridgeInput from '../../components/BridgeInput';
import BridgeTextArea from '../../components/BridgeTextArea';

import ValidateSendHelper from '../../helpers/ValidateSendHelper';

class Send extends React.Component {

	constructor(props) {
		super(props);

		this.toRef = null;
		this.amountRef = null;

		this.state = {
			timeout: null,
			warning: false,
			// btnDisabled: false,
		};

	}

	componentWillReceiveProps(nextProps) {
		if (_.isEqual(this.props, nextProps)) { return; }

		if (this.state.timeout) {
			clearTimeout(this.state.timeout);
		}

		const { to, amount } = nextProps;

		if (to.value && amount.value) {
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
		this.props.clearForm();
	}

	onChange(e, lowerCase) {
		// this.setState({ btnDisabled: false });

		const field = e.target.name;
		let { value } = e.target;

		if (lowerCase) {
			value = value.toLowerCase();
		}

		if (field) {
			this.props.setFormValue(field, value);
		}
	}

	onAmountChange(e) {
		// this.setState({ btnDisabled: false });
		const { selectedBalance, balances, assets } = this.props;

		const field = e.target.name;
		const { value } = e.target;

		const asset = assets.get(balances.getIn([selectedBalance, 'asset_type']));

		const { value: validatedValue, error, warning } =
			ValidateSendHelper.amountInput(value, {
				precision: asset.get('precision'),
				symbol: asset.get('symbol'),
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
		return true;
	}

	onSend() {
		// this.setState({ btnDisabled: true });
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

	render() {
		const {
			to, amount, fee, memo, account, loading, balances, assets,
		} = this.props;

		if (!account) {
			return null;
		}

		return (
			<React.Fragment>
				<div className="return-block">
					<Link to={INDEX_PATH} className="link-return">
						<i className="icon-return" />
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
								placeholder="Reciever's name"
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
							<BridgeTextArea
								name="memo"
								value={memo.value}
								onChange={(e) => this.onChange(e)}
								label="Note (optional)"
								error={!!memo.error}
								errorText={memo.error}
								disabled={loading}
							/>
							<Button
								className={classnames('btn-in-light', { loading })}
								disabled={(!to.value || !amount.value || loading)}
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
	selectedBalance: PropTypes.string,
	setFormValue: PropTypes.func.isRequired,
	setFormError: PropTypes.func.isRequired,
	send: PropTypes.func.isRequired,
	clearForm: PropTypes.func.isRequired,
	setFeeFormValue: PropTypes.func.isRequired,
};

Send.defaultProps = {
	account: null,
	loading: false,
	selectedBalance: null,
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
		loading: state.global.get('loading'),
	}),
	(dispatch) => ({
		setFormValue: (field, value) => dispatch(setFormValue(FORM_SEND, field, value)),
		setFormError: (field, value) => dispatch(setFormError(FORM_SEND, field, value)),
		setFeeFormValue: () => dispatch(setFeeFormValue()),
		send: (balance) => dispatch(send(balance)),
		clearForm: () => dispatch(clearForm(FORM_SEND)),
	}),
)(Send);
