import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { createAccount } from '../../actions/AuthActions';

import BridgeInput from '../../components/BridgeInput';

import { FORM_SIGN_UP } from '../../constants/FormConstants';

class CreateAccount extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			accountName: '',
		};
	}

	async onCreate() {
		const { saveWif } = this.props;

		const result = await this.props.createAccount({ accountName: this.state.accountName.trim() });

		saveWif(result);
	}

	onChange(e) {
		const field = e.target.name;

		let { value } = e.target;
		value = value.toLowerCase();

		this.setState({
			[field]: value,
		});
	}

	render() {
		const { accountName, accountLoading } = this.props;

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
								autoFocus
								name="accountName"
								theme="input-light"
								labelText="Account name"
								errorText={accountName.error && accountName.error.errorText}
								hintText={accountName.error && accountName.error.example}
								descriptionText="Unique name will be used to make transaction"
								value={this.state.accountName}
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

}

CreateAccount.propTypes = {
	accountName: PropTypes.object.isRequired,
	accountLoading: PropTypes.bool.isRequired,
	createAccount: PropTypes.func.isRequired,
	saveWif: PropTypes.func.isRequired,
};

export default connect(
	(state) => ({
		accountLoading: state.global.get('accountLoading'),
		accountName: state.form.getIn([FORM_SIGN_UP, 'accountName']),
	}),
	(dispatch) => ({
		createAccount: (value) => dispatch(createAccount(value)),
	}),
)(CreateAccount);
