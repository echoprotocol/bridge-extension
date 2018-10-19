import React from 'react';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import BridgeInput from '../../components/BridgeInput';

import { FORM_CREATE_PIN } from '../../constants/FormConstants';

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
	}

	componentWillUnmount() {
		this.props.clearForm();
	}

	onChange(e) {
		const { name, value } = e.target;

		this.setState({ [name]: value.trim(), repeatError: null });

		if (this.props.error) {
			this.props.clearError();
		}
	}

	onSubmit() {
		const { pin, repeat, repeatError } = this.state;

		if (repeatError || this.props.error) {
			return;
		}

		if (pin !== repeat) {
			this.setState({ repeatError: 'Repeat PIN correctly' });
			return;
		}

		this.props.createPin(pin);
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
						/>
						<BridgeInput
							error={!!repeatError}
							errorText={repeatError}
							theme="input-dark"
							labelText="Repeat PIN"
							type="password"
							descriptionText="At least 6 symbols. PIN will be used only to unlock extension"
							value={repeat}
							name="repeat"
							onChange={(e) => this.onChange(e)}
							disabled={loading}
						/>
					</div>
				</div>
				<div className="page-action-wrap pin-screen">
					<div className="one-btn-wrap" >
						<Button
							className="btn-in-light"
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
