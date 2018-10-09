import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { createAccount } from '../../actions/AuthActions';
import { setFormValue, toggleLoading } from '../../actions/FormActions';

import BridgeInput from '../../components/BridgeInput';

import { FORM_SIGN_UP } from '../../constants/FormConstants';

class CreateAccount extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			disableLoading: false,
		};
	}

	onCreate() {
		this.setState({
			disableLoading: true,
		});
		this.props.toggleLoading(true);

		this.props.createAccount({ accountName: this.props.accountName.value.trim() });
	}

	onChange(e) {
		const field = e.target.name;

		let { value } = e.target;
		value = value.toLowerCase();

		if (field) {
			this.props.setFormValue(field, value);
		}
	}

	onClick(e) {
		const { accountName } = this.props;

		const field = e.target.name;

		this.props.setFormValue(field, accountName);
	}


	renderLogin() {
		const { accountName, loading } = this.props;
		const { disableLoading } = this.state;

		return (
			<Form>
				<div className="page-wrap">

					<div className="page">
						<div className="icon-pageAccount">
							<span className="path1" />
							<span className="path2" />
						</div>
						<div className="one-input-wrap">
							<BridgeInput
								error={!!accountName.error}
								disabled={loading}
								name="accountName"
								theme="input-light"
								labelText="Account name"
								errorText={accountName.error && accountName.error.errorText}
								hintText={accountName.error && accountName.error.example}
								descriptionText="Unique name will be used to make transaction"
								value={accountName.value}
								onChange={(e) => this.onChange(e)}
								onClick={(e) => this.onClick(e)}
							/>
						</div>
					</div>
					<div className="page-action-wrap">
						<div className="one-btn-wrap" >
							<Button
								className="btn-in-light"
								content={<span className="btn-text">Create</span>}
								type="submit"
								onClick={(e) => this.onCreate(e)}
								disabled={disableLoading}
							/>
						</div>
					</div>
				</div>
			</Form>

		);
	}

	render() {
		return (
			this.renderLogin()
		);

	}

}

CreateAccount.propTypes = {
	loading: PropTypes.bool.isRequired,
	accountName: PropTypes.object.isRequired,
	createAccount: PropTypes.func.isRequired,
	setFormValue: PropTypes.func.isRequired,
	toggleLoading: PropTypes.func.isRequired,
};

export default connect(
	(state) => ({
		loading: state.form.getIn([FORM_SIGN_UP, 'loading']),
		accountName: state.form.getIn([FORM_SIGN_UP, 'accountName']),
	}),
	(dispatch) => ({
		setFormValue: (field, value) => dispatch(setFormValue(FORM_SIGN_UP, field, value)),
		createAccount: (value) => dispatch(createAccount(value)),
		toggleLoading: (value) => dispatch(toggleLoading(FORM_SIGN_UP, value)),
	}),
)(CreateAccount);
