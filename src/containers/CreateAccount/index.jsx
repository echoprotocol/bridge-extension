import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
	CREATE_ACCOUNT_PATH,
	CREATE_SUCCESS_PATH,
	INDEX_PATH, WELCOME_PATH,
} from '../../constants/RouterConstants';
import { FORM_SIGN_UP } from '../../constants/FormConstants';

import { storageGetDraft, storageRemoveDraft, storageSetDraft } from '../../actions/GlobalActions';
import { createAccount } from '../../actions/AuthActions';
import { setValue, clearForm } from '../../actions/FormActions';

import CreateComponent from './CreateComponent';


class CreateAccount extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			name: '',
		};
	}

	componentDidMount() {
		const { pathname, search } = this.props.location;

		if (`${pathname}${search}` === CREATE_SUCCESS_PATH) {
			this.props.history.push(CREATE_ACCOUNT_PATH);
		}

		storageGetDraft().then((draft) => {
			if (!draft) {
				return null;
			}

			Object
				.entries(draft[FORM_SIGN_UP])
				.forEach(([key, value]) => {
					if (key === 'error') {
						this.props.setValue(value);
					}
					this.setState({ [key]: value });
				});

			return null;
		});
	}

	componentWillReceiveProps(nextProps) {

		if (this.state.name) {
			const { accounts, networkName } = nextProps;

			const accountsNetwork = accounts.get(networkName);

			if (!accountsNetwork) {
				return false;
			}

		}
		return true;
	}

	componentWillUnmount() {
		const { accounts, networkName } = this.props;
		if (accounts.get(networkName).size) {
			storageRemoveDraft();
		}


		this.props.clearForm();
	}


	onChangeName(name) {
		this.setState({ name });

		storageSetDraft(FORM_SIGN_UP, 'name', name);

		if (this.props.name.error || this.props.name.example) {
			this.props.setValue({ error: null, example: '' });
		}
	}

	onCreateAccount() {
		this.props.createAccount(this.state.name, WELCOME_PATH);
	}

	onProceedClick() {
		this.props.history.push(INDEX_PATH);
	}


	render() {
		const { name } = this.state;
		const {
			loading, name: { error, example },
		} = this.props;


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
	accounts: PropTypes.object.isRequired,
	networkName: PropTypes.string.isRequired,
	createAccount: PropTypes.func.isRequired,
	setValue: PropTypes.func.isRequired,
	clearForm: PropTypes.func.isRequired,
};

export default connect(
	(state) => ({
		loading: state.form.getIn([FORM_SIGN_UP, 'loading']),
		name: state.form.getIn([FORM_SIGN_UP, 'accountName']),
		accounts: state.global.get('accounts'),
		networkName: state.global.getIn(['network', 'name']),
	}),
	(dispatch) => ({
		createAccount: (name, link) => dispatch(createAccount(name, link)),
		clearForm: () => dispatch(clearForm(FORM_SIGN_UP)),
		setValue: (value) => dispatch(setValue(FORM_SIGN_UP, 'accountName', value)),
	}),
)(CreateAccount);
