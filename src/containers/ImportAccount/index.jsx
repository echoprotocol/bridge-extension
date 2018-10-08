import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { importAccount } from '../../actions/AuthActions';
import { setFormValue } from '../../actions/FormActions';

import { FORM_SIGN_IN } from '../../constants/FormConstants';

import BridgeInput from '../../components/BridgeInput';

class ImportAccount extends React.Component {

	onImport() {
		const { accountName, password } = this.props;

		this.props.importAccount({
			accountName: accountName.value.trim(),
			password: password.value.trim(),
		});
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

	isDisabledSubmit() {
		const { accountName, password, loading } = this.props;

		if ((!accountName.value || accountName.error)
			|| (!password.value || password.error)
			|| loading) {
			return true;
		}

		return false;
	}

	render() {
		const { accountName, password } = this.props;

		return (
			<Form>
				<div className="page-wrap">

					<div className="page">
						<div className="icon-pageAccount" />
						<div className="two-input-wrap">
							<BridgeInput
								error={!!accountName.error}
								name="accountName"
								theme="input-light"
								labelText="Account name"
								errorText={accountName.error}
								value={accountName.value}
								onChange={(e) => this.onChange(e, true)}
							/>
							<BridgeInput
								error={!!password.error}
								name="password"
								type="password"
								errorText={password.error}
								theme="input-light"
								labelText="WIF key / password"
								value={password.value}
								onChange={(e) => this.onChange(e)}
							/>
						</div>
					</div>
					<div className="page-action-wrap">
						<div className="one-btn-wrap" >
							<Button
								disabled={this.isDisabledSubmit()}
								className={classnames('btn-in-dark', { disabled: this.isDisabledSubmit() })}
								content={<span className="btn-text">Import</span>}
								type="submit"
								onClick={(e) => this.onImport(e)}
							/>
						</div>
					</div>
				</div>
			</Form>
		);
	}

}

ImportAccount.propTypes = {
	loading: PropTypes.bool,
	accountName: PropTypes.object.isRequired,
	password: PropTypes.object.isRequired,
	importAccount: PropTypes.func.isRequired,
	setFormValue: PropTypes.func.isRequired,
};

ImportAccount.defaultProps = {
	loading: false,
};

export default connect(
	(state) => ({
		accountName: state.form.getIn([FORM_SIGN_IN, 'accountName']),
		password: state.form.getIn([FORM_SIGN_IN, 'password']),
		loading: state.form.getIn([FORM_SIGN_IN, 'loading']),
	}),
	(dispatch) => ({
		setFormValue: (field, value) => dispatch(setFormValue(FORM_SIGN_IN, field, value)),
		importAccount: (value) => dispatch(importAccount(value)),
	}),
)(ImportAccount);
