import React from 'react';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import BridgeInput from '../../components/BridgeInput';

import { FORM_CREATE_PIN } from '../../constants/FormConstants';
import { MIN_PIN_LENGTH } from '../../constants/ValidationConstants';
import { KEY_CODE_ENTER } from '../../constants/GlobalConstants';

import { unlockCrypto } from '../../actions/CryptoActions';
import { setValue, clearForm } from '../../actions/FormActions';

class CreatePin extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			pin: '',
			repeat: '',
			repeatError: null,
		};

		this.passwordRef = null;
		this.repeatRef = null;
	}

	componentWillUnmount() {
		this.props.clearForm();
	}

	onChange(e) {
		const { name, value } = e.target;

		this.setState({ [name]: value, repeatError: null });

		if (this.props.error) {
			this.props.clearError();
		}
	}

	async onSubmit() {
		const { pin, repeat, repeatError } = this.state;

		if (repeatError || this.props.error) {
			return;
		}

		if (pin !== repeat) {
			this.setState({ repeatError: 'Repeat PIN correctly' });
			if (this.repeatRef) { this.repeatRef.focus(); }
			return;
		}

		const created = await this.props.createPin(pin);

		if (!created && this.passwordRef) {
			this.passwordRef.focus();
		}
	}

	onKeyDown(e) {
		const { pin, repeat, repeatError } = this.state;
		const { loading, error } = this.props;

		if (loading || !pin || !repeat || error || repeatError) { return; }

		const { keyCode } = e;

		if ([KEY_CODE_ENTER].includes(keyCode)) {
			e.preventDefault();
			this.onSubmit(pin);
		}

	}

	handleRef(ref, type) {
		if (ref) {
			this[`${type}Ref`] = ref.bridgeInput;
		}
	}

	render() {
		const { pin, repeat, repeatError } = this.state;
		const { loading, error } = this.props;

		return (
			<div className="page-wrap">
				<div className="page pin-screen">
					<div className="icon-pagePin">
						<span className="path1" />
						<span className="path2" />
						<span className="path3" />
						<span className="path4" />
						<span className="path5" />
						<span className="path6" />
					</div>
					<div className="two-input-wrap">
						<BridgeInput
							error={!!error}
							errorText={error}
							theme="input-dark"
							labelText="Create PIN"
							type="password"
							value={pin}
							name="pin"
							onChange={(e) => this.onChange(e)}
							disabled={loading}
							onKeyDown={(e) => this.onKeyDown(e)}
							ref={(r) => this.handleRef(r, 'password')}
						/>
						<BridgeInput
							error={!!repeatError}
							errorText={repeatError}
							theme="input-dark"
							labelText="Repeat PIN"
							type="password"
							descriptionText={`At least ${MIN_PIN_LENGTH} symbols. PIN will be used only to unlock extension`}
							value={repeat}
							name="repeat"
							onChange={(e) => this.onChange(e)}
							disabled={loading}
							onKeyDown={(e) => this.onKeyDown(e)}
							ref={(r) => this.handleRef(r, 'repeat')}
						/>
					</div>
				</div>
				<div className="page-action-wrap pin-screen">
					<div className="one-btn-wrap" >
						<Button
							className={classnames('btn-in-dark', { loading })}
							content={<span className="btn-text">Create</span>}
							type="submit"
							onClick={(e) => this.onSubmit(e)}
							disabled={!!(loading || !pin || !repeat || error || repeatError)}
						/>
					</div>
				</div>
			</div>
		);

	}

}

CreatePin.defaultProps = {
	loading: false,
	error: null,
};

CreatePin.propTypes = {
	loading: PropTypes.bool,
	error: PropTypes.any,
	createPin: PropTypes.func.isRequired,
	clearError: PropTypes.func.isRequired,
	clearForm: PropTypes.func.isRequired,
};

export default connect(
	(state) => ({
		loading: state.form.getIn([FORM_CREATE_PIN, 'loading']),
		error: state.form.getIn([FORM_CREATE_PIN, 'error']),
	}),
	(dispatch) => ({
		createPin: (value) => dispatch(unlockCrypto(FORM_CREATE_PIN, value)),
		clearError: () => dispatch(setValue(FORM_CREATE_PIN, 'error', null)),
		clearForm: () => dispatch(clearForm(FORM_CREATE_PIN)),
	}),
)(CreatePin);
