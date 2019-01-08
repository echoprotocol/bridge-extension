import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
	IMPORT_ACCOUNT_PATH,
	IMPORT_SUCCESS_PATH,
	INDEX_PATH, IMPORT_SETTINGS_PATH,
} from '../../constants/RouterConstants';
import { FORM_SIGN_IN } from '../../constants/FormConstants';

import { importAccount } from '../../actions/AuthActions';
import { clearForm, setValue } from '../../actions/FormActions';

import ImportComponent from './ImportComponent';
import WelcomeComponent from '../../components/WelcomeComponent';
import SettingsAccount from '../SettingsAccount';

class ImportAccount extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			name: '',
			password: '',
			success: false,
			settings: false,
		};
	}

	componentDidMount() {
		const { pathname, search } = this.props.location;
		const { success } = this.state;

		if (`${pathname}${search}` === IMPORT_SUCCESS_PATH && !success) {
			this.props.history.push(IMPORT_ACCOUNT_PATH);
		}
	}

	componentWillReceiveProps(nextProps) {
		const { pathname: nextPath, search: nextSearch } = nextProps.location;
		const { pathname, search } = this.props.location;

		if (
			(`${nextPath}${nextSearch}` !== `${pathname}${search}`)
			&& (`${nextPath}${nextSearch}` === IMPORT_ACCOUNT_PATH)
		) {
			this.setState({
				name: '',
				password: '',
				success: false,
				settings: false,
			});
		}
	}

	componentDidUpdate(prevProps, prevState) {
		const { success, settings } = this.state;
		const { success: prevSuccess, settings: prevSettings } = prevState;

		if (
			!success
			&& !settings
			&& (settings !== prevSettings)
			&& (success !== prevSuccess)
		) {
			this.props.history.push(IMPORT_ACCOUNT_PATH);
		}
	}

	componentWillUnmount() {
		this.props.clearForm();
	}

	onChange(key, value) {
		this.setState({ [key]: value });

		if (this.props[`${key}Error`]) {
			this.props.clearError(`${key}Error`);
		}
	}

	async onImportAccount() {

		const { name, password } = this.state;

		const success = await this.props.importAccount(name, password);

		if (success) {
			this.setState({ success: true, name: success });
			this.props.history.push(IMPORT_SUCCESS_PATH);
		}
	}

	onProceedClick() {
		this.props.history.push(INDEX_PATH);
	}

	onChangeIcon() {
		this.setState({
			success: false,
			settings: true,
		});

		this.props.history.push(IMPORT_SETTINGS_PATH);
	}

	onBack() {
		this.setState({
			success: true,
			settings: false,
		});

		this.props.history.goBack();
	}

	render() {
		const {
			nameError, passwordError, loading, accounts, networkName,
		} = this.props;
		const {
			name, password, success, settings,
		} = this.state;

		if (success) {
			const accountsNetwork = accounts.get(networkName);

			if (!accountsNetwork) {
				return null;
			}

			const account = accountsNetwork.find((i) => i.name === name);

			if (!account) {
				return null;
			}

			return (
				<WelcomeComponent
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
			<ImportComponent
				name={name}
				password={password}
				loading={loading}
				nameError={nameError}
				passwordError={passwordError}
				change={(key, value) => this.onChange(key, value)}
				importAccount={() => this.onImportAccount()}
			/>
		);
	}

}

ImportAccount.defaultProps = {
	nameError: null,
	passwordError: null,
};

ImportAccount.propTypes = {
	nameError: PropTypes.any,
	passwordError: PropTypes.any,
	loading: PropTypes.bool.isRequired,
	location: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
	accounts: PropTypes.object.isRequired,
	networkName: PropTypes.string.isRequired,
	importAccount: PropTypes.func.isRequired,
	clearForm: PropTypes.func.isRequired,
	clearError: PropTypes.func.isRequired,
};

export default connect(
	(state) => ({
		loading: state.form.getIn([FORM_SIGN_IN, 'loading']),
		nameError: state.form.getIn([FORM_SIGN_IN, 'nameError']),
		passwordError: state.form.getIn([FORM_SIGN_IN, 'passwordError']),
		accounts: state.global.get('accounts'),
		networkName: state.global.getIn(['network', 'name']),
	}),
	(dispatch) => ({
		importAccount: (name, password) => dispatch(importAccount(name, password)),
		clearForm: () => dispatch(clearForm(FORM_SIGN_IN)),
		clearError: (value) => dispatch(setValue(FORM_SIGN_IN, value, null)),
	}),
)(ImportAccount);
