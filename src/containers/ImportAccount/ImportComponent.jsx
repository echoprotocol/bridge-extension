import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import BridgeInput from '../../components/BridgeInput';

class ImportComponent extends React.Component {

	onChange(e, lowercase) {
		const { name, value } = e.target;

		this.props.change(name, lowercase ? value.trim().toLowerCase() : value.trim());
	}

	onPressEnter(e) {
		if (e.key === 'Enter') {
			e.preventDefault();
			this.props.importAccount(e);
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
						<div className="icon-pageAccount" />
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
							/>
						</div>
					</div>
					<div className="page-action-wrap">
						<div className="one-btn-wrap" >
							<Button
								disabled={!password}
								className={classnames('btn-in-dark', { loading })}
								content={<span className="btn-text">Import</span>}
								type="submit"
								onClick={(e) => this.props.importAccount(e)}
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
