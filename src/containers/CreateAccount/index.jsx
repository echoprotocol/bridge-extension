import React from 'react';
import PropTypes from 'prop-types';
import query from 'query-string';
import { connect } from 'react-redux';

import {
	CREATE_ACCOUNT_PATH,
	CREATE_SUCCESS_PATH,
	INDEX_PATH,
} from '../../constants/RouterConstants';
import { FORM_SIGN_UP } from '../../constants/FormConstants';

import { createAccount } from '../../actions/AuthActions';
import { setFormError, clearForm } from '../../actions/FormActions';

import CreateComponent from './CreateComponent';
import WelcomeComponent from '../../components/WelcomeComponent';

class CreateAccount extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			name: '',
			wif: '',
		};
	}

	componentDidMount() {
		const { pathname, search } = this.props.location;
		const { wif } = this.state;

		if (`${pathname}${search}` === CREATE_SUCCESS_PATH && !wif) {
			this.props.history.push(CREATE_ACCOUNT_PATH);
		}
	}

	componentWillUnmount() {
		this.props.clearForm();
	}

	onChangeName(name) {
		this.setState({ name });

		if (this.props.name.error) {
			this.props.clearError();
		}
	}

	async onCreateAccount() {
		const wif = await this.props.createAccount(this.state.name);

		if (wif) {
			this.setState({ wif });
			this.props.history.push(CREATE_SUCCESS_PATH);
		}
	}

	onProceedClick() {
		this.props.history.push(INDEX_PATH);
	}

	render() {
		const { name, wif } = this.state;
		const {
			loading, name: { error, example }, location,
		} = this.props;

		const { success } = query.parse(location.search);

		if (wif && success) {
			return (
				<WelcomeComponent
					wif={wif}
					name={name}
					proceed={() => this.onProceedClick()}
					unmount={() => this.setState({ name: '', wif: '' })}
				/>
			);
		}

		return (
			<CreateComponent
				loading={loading}
				name={name}
				error={error}
				example={example}
				changeName={(value) => this.onChangeName(value)}
				createAccount={() => this.onCreateAccount()}
			/>
		);
	}

}

CreateAccount.propTypes = {
	loading: PropTypes.bool.isRequired,
	name: PropTypes.object.isRequired,
	location: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
	createAccount: PropTypes.func.isRequired,
	clearError: PropTypes.func.isRequired,
	clearForm: PropTypes.func.isRequired,
};

export default connect(
	(state) => ({
		loading: state.form.getIn([FORM_SIGN_UP, 'loading']),
		name: state.form.getIn([FORM_SIGN_UP, 'accountName']),
	}),
	(dispatch) => ({
		createAccount: (name) => dispatch(createAccount(name)),
		clearError: () => dispatch(setFormError(FORM_SIGN_UP, 'accountName', null)),
		clearForm: () => dispatch(clearForm(FORM_SIGN_UP)),
	}),
)(CreateAccount);
