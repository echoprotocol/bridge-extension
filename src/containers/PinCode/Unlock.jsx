import React from 'react';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { withRouter } from 'react-router';

import BridgeInput from '../../components/BridgeInput';

import { FORM_UNLOCK } from '../../constants/FormConstants';
import { BACKUP_PATH, WIPE_PIN_PATH } from '../../constants/RouterConstants';
import { KEY_CODE_ENTER } from '../../constants/GlobalConstants';

import { unlockAccount, unlockCrypto } from '../../actions/CryptoActions';
import { setValue, clearForm } from '../../actions/FormActions';
import arrowLeft from '../../assets/images/icons/arrow_emerald_left.svg';


class Unlock extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			pin: '',
		};

		this.inputRef = null;
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

	async onSubmit() {
		const unlocked = await this.props.unlock(this.state.pin);

		if (!unlocked && this.inputRef) {
			this.inputRef.focus();
		}
	}

	onKeyDown(e) {
		const { loading, error } = this.props;
		const { pin } = this.state;

		if (loading || !pin || error) { return; }

		const { keyCode } = e;

		if ([KEY_CODE_ENTER].includes(keyCode)) {
			e.preventDefault();
			this.onSubmit(pin);
		}
	}

	handleRef(ref) {
		if (ref) {
			this.inputRef = ref.bridgeInput;
		}
	}

	goBack() {
		this.props.unlockAccount();
		this.props.history.go(-2);
	}

	render() {
		const { loading, error, goTo } = this.props;
		const { pin } = this.state;

		return (
			<div className="page-wrap">
				{goTo === BACKUP_PATH &&
					<div className="return-block transparent absolute">
						<Link to="" className="link-return green" onClick={() => this.goBack()}>
							<img src={arrowLeft} alt="" />
							<span className="link-text">Return</span>
						</Link>
					</div>}
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
							ref={(r) => this.handleRef(r)}
						/>
					</div>
				</div>
				<div className="page-action-wrap pin-screen enter-pin">
					<div className="one-btn-wrap">
						<Button
							className={classnames('btn-in-dark', { loading })}
							disabled={Boolean(loading || !pin || error)}
							content={<span className="btn-text">Unlock</span>}
							type="submit"
							onClick={(e) => this.onSubmit(e)}
						/>
						{goTo !== BACKUP_PATH &&
						<Link className="link gray forgot-password" to={WIPE_PIN_PATH}>Forgot PIN?</Link>}
					</div>
				</div>
			</div>
		);
	}

}

Unlock.defaultProps = {
	loading: false,
	error: null,
	history: null,
	goTo: '',
};

Unlock.propTypes = {
	loading: PropTypes.bool,
	history: PropTypes.object,
	error: PropTypes.any,
	goTo: PropTypes.string,
	unlock: PropTypes.func.isRequired,
	clearError: PropTypes.func.isRequired,
	clearForm: PropTypes.func.isRequired,
	unlockAccount: PropTypes.func.isRequired,
};

export default withRouter(connect(
	(state) => ({
		isLocked: state.global.getIn(['crypto']),
		loading: state.form.getIn([FORM_UNLOCK, 'loading']),
		error: state.form.getIn([FORM_UNLOCK, 'error']),
		goTo: state.global.getIn(['crypto', 'goTo']),
	}),
	(dispatch) => ({
		unlock: (value) => dispatch(unlockCrypto(FORM_UNLOCK, value)),
		unlockAccount: () => dispatch(unlockAccount()),
		clearError: () => dispatch(setValue(FORM_UNLOCK, 'error', null)),
		clearForm: () => dispatch(clearForm(FORM_UNLOCK)),
	}),
)(Unlock));
