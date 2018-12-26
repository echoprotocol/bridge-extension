import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import BridgeInput from '../../components/BridgeInput';

class ImportComponent extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			btnDisabled: false,
		};

		this.nameRef = null;
		this.passwordRef = null;
	}

	componentDidUpdate(prevProps) {
		const { name: prevName, password: prevPassword } = prevProps;
		const {
			nameError, passwordError, name, password,
		} = this.props;

		if ((name !== prevName) || (password !== prevPassword)) {
			return false;
		}

		if (nameError && this.nameRef) {
			this.nameRef.focus();
		} else if (passwordError && this.passwordRef) {
			this.passwordRef.focus();
		}

		return true;
	}


	onChange(e, lowercase) {
		const { name, value } = e.target;
		this.setState({ btnDisabled: false });
		this.props.change(name, lowercase ? value.trim().toLowerCase() : value.trim());
	}

	onPressEnter(e) {
		if (e.key === 'Enter') {
			e.preventDefault();
			this.props.importAccount(e);
		}
	}

	importAccount(e) {
		this.setState({ btnDisabled: true });
		this.props.importAccount(e);
	}

	isButtonDisabled() {
		const {
			password, nameError, passwordError,
		} = this.props;

		return !!(!password || nameError || passwordError);
	}

	handleRef(ref, type) {
		if (ref) {
			this[`${type}Ref`] = ref.bridgeInput;
		}
	}

	render() {
		const {
			loading, name, password, nameError, passwordError,
		} = this.props;

		return (
			<Form>
				<div className="page-wrap">

					<div className="page">
						<div className="icon-pageAccount">
							<span className="path1" />
							<span className="path2" />
						</div>
						<div className="two-input-wrap">
							<BridgeInput
								error={!!nameError}
								autoFocus
								name="name"
								theme="input-light"
								labelText="Account name"
								errorText={nameError}
								value={name}
								onChange={(e) => this.onChange(e, true)}
								onKeyPress={(e) => this.onPressEnter(e)}
								disabled={loading}
								ref={(r) => this.handleRef(r, 'name')}
							/>
							<BridgeInput
								privacyEye
								error={!!passwordError}
								name="password"
								type="password"
								errorText={passwordError}
								theme="input-light"
								labelText="WIF key / password"
								value={password}
								onChange={(e) => this.onChange(e)}
								onKeyPress={(e) => this.onPressEnter(e)}
								disabled={loading}
								ref={(r) => this.handleRef(r, 'password')}
							/>
						</div>
					</div>
					<div className="page-action-wrap">
						<div className="one-btn-wrap" >
							<Button
								disabled={this.state.btnDisabled || this.isButtonDisabled()}
								className={classnames('btn-in-light', { loading })}
								content={<span className="btn-text">Import</span>}
								type="submit"
								onClick={(e) => this.importAccount(e)}
							/>
						</div>
					</div>
				</div>
			</Form>
		);
	}

}

ImportComponent.defaultProps = {
	loading: false,
	name: '',
	nameError: null,
	password: '',
	passwordError: null,
};

ImportComponent.propTypes = {
	loading: PropTypes.bool,
	name: PropTypes.string,
	nameError: PropTypes.any,
	password: PropTypes.string,
	passwordError: PropTypes.any,
	change: PropTypes.func.isRequired,
	importAccount: PropTypes.func.isRequired,
};

export default ImportComponent;
