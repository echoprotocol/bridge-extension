import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { createAccount } from '../../actions/AuthActions';
import { clearForm, setFormValue } from '../../actions/FormActions';

import BridgeInput from '../../components/BridgeInput';

import { FORM_SIGN_UP } from '../../constants/FormConstants';

class CreateAccount extends React.Component {

	componentWillUnmount() {
		this.props.clearForm();
	}

	onCreate() {
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
		const { accountName, accountLoading } = this.props;
		console.log(accountLoading);

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
								className={classnames('btn-in-light', { loading: accountLoading })}
								content={<span className="btn-text">Create</span>}
								type="submit"
								onClick={(e) => this.onCreate(e)}
								disabled={accountLoading}
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
	accountName: PropTypes.object.isRequired,
	accountLoading: PropTypes.bool.isRequired,
	createAccount: PropTypes.func.isRequired,
	setFormValue: PropTypes.func.isRequired,
	clearForm: PropTypes.func.isRequired,
};

export default connect(
	(state) => ({
		accountLoading: state.global.get('accountLoading'),
		accountName: state.form.getIn([FORM_SIGN_UP, 'accountName']),
	}),
	(dispatch) => ({
		setFormValue: (field, value) => dispatch(setFormValue(FORM_SIGN_UP, field, value)),
		createAccount: (value) => dispatch(createAccount(value)),
		clearForm: () => dispatch(clearForm(FORM_SIGN_UP)),
	}),
)(CreateAccount);
