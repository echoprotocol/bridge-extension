import React from 'react';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classnames from 'classnames';

import BridgeInput from '../../components/BridgeInput';

import { FORM_UNLOCK } from '../../constants/FormConstants';
import { WIPE_PIN_PATH } from '../../constants/RouterConstants';

import { unlockCrypto } from '../../actions/CryptoActions';
import { setValue, clearForm } from '../../actions/FormActions';

class Unlock extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			pin: '',
		};
	}

	componentWillUnmount() {
		this.props.clearForm();
	}

	onChange(e) {
		this.setState({ pin: e.target.value });

		if (this.props.error) {
			this.props.clearError();
		}
	}

	onSubmit() {
		this.props.unlock(this.state.pin);
	}

	onKeyDown(e) {
		const { keyCode } = e;

		if ([13, 62].includes(keyCode)) {
			e.preventDefault();
			this.props.unlock(this.state.pin);
		}
	}

	render() {
		const { loading, error } = this.props;
		const { pin } = this.state;

		return (
			<div className="page-wrap">
				<div className="page pin-screen enter-pin">
					<div className="icon-pagePin">
						<span className="path1" />
						<span className="path2" />
						<span className="path3" />
						<span className="path4" />
						<span className="path5" />
						<span className="path6" />
					</div>
					<div className="one-input-wrap">
						<BridgeInput
							error={!!error}
							autoFocus
							name="pin"
							errorText={error}
							value={pin}
							onChange={(e) => this.onChange(e)}
							disabled={loading}
							theme="input-dark"
							labelText="Enter PIN"
							type="password"
							descriptionText="Enter PIN to unlock the Bridge"
							onKeyDown={(e) => this.onKeyDown(e)}
						/>
					</div>
				</div>
				<div className="page-action-wrap pin-screen enter-pin">
					<div className="one-btn-wrap" >
						<Button
							className={classnames('btn-in-light', { loading })}
							disabled={Boolean(loading || !pin || error)}
							content={<span className="btn-text">Unlock</span>}
							type="submit"
							onClick={(e) => this.onSubmit(e)}
						/>
						<Link className="link gray forgot-password" to={WIPE_PIN_PATH}>Forgot PIN?</Link>
					</div>
				</div>
			</div>
		);
	}

}

Unlock.defaultProps = {
	loading: false,
	error: null,
};

Unlock.propTypes = {
	loading: PropTypes.bool,
	error: PropTypes.any,
	unlock: PropTypes.func.isRequired,
	clearError: PropTypes.func.isRequired,
	clearForm: PropTypes.func.isRequired,
};

export default connect(
	(state) => ({
		loading: state.form.getIn([FORM_UNLOCK, 'loading']),
		error: state.form.getIn([FORM_UNLOCK, 'error']),
	}),
	(dispatch) => ({
		unlock: (value) => dispatch(unlockCrypto(FORM_UNLOCK, value)),
		clearError: () => dispatch(setValue(FORM_UNLOCK, 'error', null)),
		clearForm: () => dispatch(clearForm(FORM_UNLOCK)),
	}),
)(Unlock);
