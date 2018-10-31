import React from 'react';
import { Button } from 'semantic-ui-react';
import CustomScroll from 'react-custom-scroll';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import BridgeInput from '../../components/BridgeInput';
import BridgeTextArea from '../../components/BridgeTextArea';
// import ErrorTransaction from './ErrorTransaction';
// import SuccessTransaction from './SuccessTransaction';


import { INDEX_PATH } from '../../constants/RouterConstants';
import { setFormValue } from '../../actions/FormActions';
import { FORM_SEND } from '../../constants/FormConstants';
import ValidateSend from '../../helpers/ValidateSend';

class Send extends React.Component {

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

	// onAmountChange(e) {
	//     const field = e.target.name;
	//     let { value } = e.target;
	//
	//
	//     ValidateSend.amountInput(value);
	// }

	renderSend() {
		const codingCurrencyDropdownData = [
			{
				id: 0,
				title: 'Assets',
				list: ['ECHO', 'Echolabs', 'Myecho'],
			},
			{
				id: 1,
				title: 'Tokens',
				list: ['ECHO', 'EchoTest', 'EchoEcho', 'EchoEcho245'],
			},
		];
		const {
			to, amount, fee, note,
		} = this.props;

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
								value="Jellyjeda345"
								defaultUp
								readOnly
								userIcon="image-url"
								leftLabel
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
								innerDropdown={codingCurrencyDropdownData}
								value={amount.value}
								onChange={(e) => this.onChange(e)}
							/>
							<BridgeInput
								name="fee"
								theme="input-light"
								placeholder="0.000"
								defaultUp
								labelText="Fee"
								leftLabel
								innerDropdown={codingCurrencyDropdownData}
								value={fee.value}
								onChange={(e) => this.onChange(e)}
							/>
							<BridgeTextArea
								name="note"
								value={note.value}
								onChange={(e) => this.onChange(e)}
								label="Note (optional)"
							/>
							<Button
								className="btn-in-light"
								content={<span className="btn-text">Send</span>}
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
	to: PropTypes.object.isRequired,
	amount: PropTypes.object.isRequired,
	fee: PropTypes.object.isRequired,
	note: PropTypes.object.isRequired,
	setFormValue: PropTypes.func.isRequired,
};

export default connect(
	(state) => ({
		to: state.form.getIn([FORM_SEND, 'to']),
		amount: state.form.getIn([FORM_SEND, 'amount']),
		fee: state.form.getIn([FORM_SEND, 'fee']),
		note: state.form.getIn([FORM_SEND, 'note']),
	}),
	(dispatch) => ({
		setFormValue: (field, value) => dispatch(setFormValue(FORM_SEND, field, value)),
	}),
)(Send);
