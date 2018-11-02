import React from 'react';
import { Button } from 'semantic-ui-react';
import CustomScroll from 'react-custom-scroll';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

// import ErrorTransaction from './ErrorTransaction';
// import SuccessTransaction from './SuccessTransaction';

import { send } from '../../actions/BalanceActions';
import { setFormError, setFormValue } from '../../actions/FormActions';

import { INDEX_PATH } from '../../constants/RouterConstants';
import { FORM_SEND } from '../../constants/FormConstants';

import BridgeInput from '../../components/BridgeInput';
import BridgeTextArea from '../../components/BridgeTextArea';

import ValidateSendHelper from '../../helpers/ValidateSendHelper';

class Send extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			search: this.getSymbols(),
		};
	}


	onChange(e, lowerCase) {
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
		const field = e.target.name;
		const { value } = e.target;

		const asset = { precision: 5, symbol: 'ECHO' };

		const { value: validatedValue, error } = ValidateSendHelper.amountInput(value, asset);

		if (error) {
			this.props.setFormError(field, error);
			return false;
		}

		this.props.setFormValue(field, validatedValue);
		return true;
	}

	onSearch(value) {
		if (value) {
			this.setState({
				search: this.getSymbols().filter(({ text }) =>
					text.toLowerCase().startsWith(value.toLowerCase())),
			});
		} else {
			this.setState({ search: this.getSymbols() });
		}
	}

	onSend() {
		this.props.send();
	}

	getSymbols() {
		const { balances, assets, account } = this.props;

		const symbolsList = [];

		if (!account) {
			return symbolsList;
		}

		balances.forEach((balance) => {
			if (balance.get('owner') === account.get('id')) {
				const symbol = assets.getIn([balance.get('asset_type'), 'symbol']);

				if (!symbolsList.includes(symbol)) {
					symbolsList.push({ text: symbol, value: balance.get('id') });
				}
			}
		});

		return symbolsList;
	}

	renderSend() {
		const { search } = this.state;
		const dropdownData = [
			{
				id: 0,
				title: 'Assets',
				list: search,
			},
			// {
			// 	id: 1,
			// 	title: 'Tokens',
			// 	list: ['ECHO', 'EchoTest', 'EchoEcho', 'EchoEcho245'],
			// },
		];
		const {
			to, amount, fee, note, account,
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
							/>
							<BridgeInput
								name="amount"
								theme="input-light"
								placeholder="0.000"
								defaultUp
								labelText="Amount"
								leftLabel
								innerDropdown={{ dropdownData, path: { form: FORM_SEND, field: 'selectedBalance' } }}
								value={amount.value}
								onChange={(e) => this.onAmountChange(e)}
								onDropdownSearch={(e) => this.onSearch(e)}
							/>
							<BridgeInput
								name="fee"
								theme="input-light"
								placeholder="0.000"
								defaultUp
								labelText="Fee"
								leftLabel
								innerDropdown={{ dropdownData }}
								value={fee.value}
								readOnly
								disabled
								onDropdownSearch={(e) => this.onSearch(e)}
							/>
							<BridgeTextArea
								name="note"
								value={note.value}
								onChange={(e) => this.onChange(e)}
								label="Note (optional)"
							/>
							<Button
								className="btn-in-light"
								disabled={(!to.value || !amount.value)}
								content={<span className="btn-text">Send</span>}
								onClick={() => this.onSend()}
							/>
						</div>
					</CustomScroll>
				</div>
			</React.Fragment>
		);
	}

	render() {
		return (
			this.renderSend()
		// Для отображения ErrorTransaction и SuccessTransaction - убрать блок return и Navbar !!!
			// <ErrorTransaction />
		// <SuccessTransaction />
		);

	}

}

Send.propTypes = {
	account: PropTypes.object,
	to: PropTypes.object.isRequired,
	amount: PropTypes.object.isRequired,
	fee: PropTypes.object.isRequired,
	note: PropTypes.object.isRequired,
	balances: PropTypes.object.isRequired,
	assets: PropTypes.object.isRequired,
	setFormValue: PropTypes.func.isRequired,
	setFormError: PropTypes.func.isRequired,
	send: PropTypes.func.isRequired,
};

Send.defaultProps = {
	account: null,
};

export default connect(
	(state) => ({
		account: state.global.get('account'),
		to: state.form.getIn([FORM_SEND, 'to']),
		amount: state.form.getIn([FORM_SEND, 'amount']),
		fee: state.form.getIn([FORM_SEND, 'fee']),
		note: state.form.getIn([FORM_SEND, 'note']),
		balances: state.balance.get('balances'),
		assets: state.balance.get('assets'),
	}),
	(dispatch) => ({
		setFormValue: (field, value) => dispatch(setFormValue(FORM_SEND, field, value)),
		setFormError: (field, value) => dispatch(setFormError(FORM_SEND, field, value)),
		send: (balance) => dispatch(send(balance)),
	}),
)(Send);
