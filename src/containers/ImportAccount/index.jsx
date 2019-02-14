import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
	INDEX_PATH, SETTINGS_PATH,
	WELCOME_PATH, NEW_KEY_PATH,
	IMPORT_ACCOUNT_PATH, IMPORT_SUCCESS_PATH,
} from '../../constants/RouterConstants';
import { FORM_SIGN_IN } from '../../constants/FormConstants';

import { importAccount } from '../../actions/AuthActions';
import { clearForm, setValue } from '../../actions/FormActions';
import ImportComponent from './ImportComponent';
import { storageGetDraft, storageRemoveDraft, storageSetDraft } from '../../actions/GlobalActions';


class ImportAccount extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			name: '',
			password: '',
		};
	}


	componentDidMount() {
		const { pathname, search } = this.props.location;
		const { success } = this.state;

		if (`${pathname}${search}` === IMPORT_SUCCESS_PATH && !success) {
			this.props.history.push(IMPORT_ACCOUNT_PATH);
		}

		storageGetDraft().then((draft) => {
			if (!draft) {
				return null;
			}

			Object
				.entries(draft[FORM_SIGN_IN])
				.forEach(([key, value]) => this.setState({ [key]: value }));

			return null;
		});
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
		storageRemoveDraft();

		this.props.clearForm();
	}

	onChange(key, value) {
		this.setState({ [key]: value });

		storageSetDraft(FORM_SIGN_IN, key, value);

		if (this.props[`${key}Error`]) {
			this.props.clearError(`${key}Error`);
		}
	}

	async onImportAccount() {

		const { name, password } = this.state;
		const success = await this.props.importAccount(name, password);

		if (success) {
			this.setState({
				name: success.name,
			});

			if (success.isAccAdded) {
				this.props.history.push(NEW_KEY_PATH);
				return null;
			}
			this.props.history.push(WELCOME_PATH);
		}
		return null;
	}

	onProceedClick() {
		this.props.history.push(INDEX_PATH);
	}

	onChangeIcon() {
		this.props.history.push(SETTINGS_PATH);
	}


	render() {
		const {
			nameError, passwordError, loading,
		} = this.props;
		const {
			name, password, // success,
		} = this.state;

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
	location: PropTypes.object.isRequired,
	loading: PropTypes.bool.isRequired,
	history: PropTypes.object.isRequired,
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
