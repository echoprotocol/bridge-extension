import React from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from 'semantic-ui-react';
import classnames from 'classnames';

class BridgeInput extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			up: false,
			filled: false,
			showPas: false,
		};
	}


	onFocus() {
		this.setState({ up: true });
	}


	onBlur() {
		this.setState({ up: false });
	}

	onTogglePrivacy() {
		this.setState({ showPas: !this.state.showPas });
	}

	onChange(e) {
		this.setState({ filled: !!this.bridgeInput.inputRef.value });
		this.props.onChange(e);
	}

	renderError() {
		return (<div className="message-error"> {this.props.errorText}</div>);
	}

	renderHint() {
		const { hintText, hintClickable } = this.props;

		return (
			<div className="message-hint">
				{
					hintClickable ?
						<button onClick={(e) => this.props.onHintClick(e)} className="btn-try">
							{hintText}
						</button> : { hintText }
				}
			</div>
		);
	}

	renderPrivacyEye() {
		return (
			<Button
				className={
					classnames(
						'icon-eye',
						{ 'icon-eyeEnable': this.state.showPas },
						{ 'icon-eyeDisabled': !this.state.showPas },
					)
				}
				onClick={() => this.onTogglePrivacy()}
			/>
		);
	}
	render() {
		const {
			name, labelText, type, error, disabled, theme, value,
			autoFocus, privacyEye, position, descriptionText, hintText, onKeyDown,
		} = this.props;

		const {
			up, focus, filled, showPas,
		} = this.state;

		return (

			<div className={classnames('input-wrap', theme)} >
				<Input
					value={value}
					name={name}
					label={labelText}
					type={privacyEye && showPas ? 'text' : type}
					error={error}
					disabled={disabled}
					autoFocus={autoFocus}
					icon={privacyEye ? this.renderPrivacyEye() : false}
					ref={(bridgeInput) => { this.bridgeInput = bridgeInput; }}
					className={classnames(
						{ up },
						{ focused: focus },
						{ filled },
						{ eye: privacyEye },
						position,
					)}
					onFocus={() => this.onFocus()}
					onBlur={() => this.onBlur()}
					onChange={(e) => this.onChange(e)}
					onKeyDown={(e) => (onKeyDown ? onKeyDown(e) : null)}
				/>

				{ error ? this.renderError() : null }
				{ hintText ? this.renderHint() : null }
				{ descriptionText ? <div className="message-description">{ descriptionText }</div> : null }

			</div>

		);
	}

}

BridgeInput.propTypes = {
	value: PropTypes.string,
	name: PropTypes.string,
	theme: PropTypes.string,
	error: PropTypes.bool,
	disabled: PropTypes.bool,
	autoFocus: PropTypes.bool,
	type: PropTypes.string,
	position: PropTypes.string,
	labelText: PropTypes.string,
	errorText: PropTypes.string,
	hintText: PropTypes.string,
	hintClickable: PropTypes.bool,
	descriptionText: PropTypes.string,
	privacyEye: PropTypes.bool,
	onChange: PropTypes.func,
	onHintClick: PropTypes.func,
	onKeyDown: PropTypes.func,
};

BridgeInput.defaultProps = {
	value: '',
	name: '',
	theme: 'light',
	error: false,
	disabled: false,
	autoFocus: false,
	type: 'text',
	position: '',
	labelText: '',
	errorText: '',
	hintText: '',
	hintClickable: false,
	descriptionText: '',
	privacyEye: false,
	onChange: null,
	onHintClick: null,
	onKeyDown: null,
};

export default BridgeInput;
