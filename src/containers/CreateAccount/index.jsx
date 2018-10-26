import React from 'react';
import PropTypes from 'prop-types';
import query from 'query-string';
import { connect } from 'react-redux';

import {
	CREATE_ACCOUNT_PATH,
	CREATE_SUCCESS_PATH,
	INDEX_PATH, CREATE_SETTINGS_PATH,
} from '../../constants/RouterConstants';
import { FORM_SIGN_UP } from '../../constants/FormConstants';

import { createAccount } from '../../actions/AuthActions';
import { setValue, clearForm } from '../../actions/FormActions';

import CreateComponent from './CreateComponent';
import WelcomeComponent from '../../components/WelcomeComponent';
import SettingsAccount from '../SettingsAccount';


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

	componentWillReceiveProps(nextProps) {

		if (this.state.wif && this.state.name) {
			const { accounts, networkName } = nextProps;

			if (!accounts) {
				return;
			}

			const account = accounts.get(networkName).find((i) => i.name === this.state.name);

			if (!account) {
				this.resetState();
			}
		}

		const { pathname: nextPath, search: nextSearch } = nextProps.location;
		const { pathname, search } = this.props.location;

		if (
			(`${nextPath}${nextSearch}` !== `${pathname}${search}`)
            && (`${nextPath}${nextSearch}` === CREATE_ACCOUNT_PATH)
		) {
			this.setState({
				name: '',
				wif: '',
			});
		}
	}

	componentDidUpdate(prevProps, prevState) {
		const { wif } = this.state;
		const { wif: prevWif } = prevState;

		const { location } = this.props;
		const { settings } = query.parse(location.search);

		const { location: prevLocation } = prevProps;
		const { settings: prevSettings } = query.parse(prevLocation.search);

		if (!wif && !settings && (wif !== prevWif) && (settings !== prevSettings)) {
			this.props.history.push(CREATE_ACCOUNT_PATH);
		}
	}

	componentWillUnmount() {
		this.props.clearForm();
	}


	onChangeName(name) {
		this.setState({ name });

		if (this.props.name.error || this.props.name.example) {
			this.props.setValue({ error: null, example: '' });
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

	onChangeIcon() {
		this.props.history.push(CREATE_SETTINGS_PATH);
	}

	onBack() {
		this.props.history.goBack();
	}

	resetState() {
		this.setState({
			name: '',
			wif: '',
		});
	}

	render() {
		const { name, wif } = this.state;
		const {
			loading, name: { error, example }, location, accounts, networkName,
		} = this.props;

		const { success, settings } = query.parse(location.search);

		if (wif && success) {
			if (!accounts || !accounts.get(networkName)) {
				return null;
			}

			const account = accounts.get(networkName).find((i) => i.name === name);

			if (!account) {
				return null;
			}

			return (
				<WelcomeComponent
					wif={wif}
					name={name}
					icon={account.icon}
					iconColor={account.iconColor}
					proceed={() => this.onProceedClick()}
					onChangeIcon={() => this.onChangeIcon()}
				/>
			);
		} else if (settings) {
			return (
				<SettingsAccount
					onBack={() => this.onBack()}
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
		createAccount: (name) => dispatch(createAccount(name)),
		clearForm: () => dispatch(clearForm(FORM_SIGN_UP)),
		setValue: (value) => dispatch(setValue(FORM_SIGN_UP, 'accountName', value)),
	}),
)(CreateAccount);
