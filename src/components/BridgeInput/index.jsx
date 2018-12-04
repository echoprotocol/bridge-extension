import React from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from 'semantic-ui-react';
import classnames from 'classnames';
import UserIcon from '../UserIcon';
import CurrencySelect from '../CurrencySelect/index';

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
		const { hintText, hintClickable, beforeExampleText } = this.props;

		return (
			<div className="message-hint">
				{
					hintClickable ?
						<React.Fragment>
							{beforeExampleText}
							<button onClick={(e) => this.props.onHintClick(e)} className="btn-try">
								{hintText}
							</button>
						</React.Fragment> : { hintText }
				}
			</div>
		);
	}

	renderImage(color, id) {
		return (
			<div className="input-image">
				<UserIcon color={color} avatar={`ava${id}`} />
			</div>
		);
	}

	renderPrivacyEye() {
		return (
			<Button
				tabIndex="-1"
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
			autoFocus, privacyEye, position, descriptionText, leftLabel, placeholder,
			defaultUp, readOnly, userIcon, innerDropdown, hintText, onKeyPress, onKeyDown,
		} = this.props;

		const {
			up, focus, filled, showPas,
		} = this.state;

		return (

			<div className={classnames(
				'input-wrap',
				theme,
				{ 'inner-dropdown': innerDropdown },
			)}
			>
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
						{ 'left-label': leftLabel },
						{ filled: defaultUp },
						{ readOnly },
						{ 'with-image': userIcon },
						position,
						{ 'visible-pas': (privacyEye && showPas) },
					)}
					readOnly={readOnly}
					placeholder={placeholder}
					onFocus={() => this.onFocus()}
					onBlur={() => this.onBlur()}
					onChange={(e) => this.onChange(e)}
					action={
						(innerDropdown) &&
						(
							<CurrencySelect
								data={innerDropdown.dropdownData}
								path={innerDropdown.path}
							/>
						)
					}
					onKeyDown={(e) => (onKeyDown ? onKeyDown(e) : null)}
					onKeyPress={(e) => onKeyPress && onKeyPress(e)}
				/>
				{ userIcon ? this.renderImage(userIcon.color, userIcon.icon) : null}
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
	leftLabel: PropTypes.bool,
	defaultUp: PropTypes.bool,
	readOnly: PropTypes.bool,
	type: PropTypes.string,
	placeholder: PropTypes.string,
	position: PropTypes.string,
	labelText: PropTypes.string,
	errorText: PropTypes.string,
	hintText: PropTypes.string,
	hintClickable: PropTypes.bool,
	beforeExampleText: PropTypes.string,
	descriptionText: PropTypes.string,
	onChange: PropTypes.func,
	privacyEye: PropTypes.bool,
	innerDropdown: PropTypes.object,
	userIcon: PropTypes.object,
	onHintClick: PropTypes.func,
	onKeyDown: PropTypes.func,
	onKeyPress: PropTypes.func,
};

BridgeInput.defaultProps = {
	value: '',
	name: '',
	theme: 'light',
	error: false,
	disabled: false,
	autoFocus: false,
	leftLabel: false,
	defaultUp: false,
	readOnly: false,
	type: 'text',
	placeholder: '',
	position: '',
	labelText: '',
	errorText: '',
	hintText: '',
	hintClickable: false,
	beforeExampleText: '',
	descriptionText: '',
	onChange: null,
	privacyEye: false,
	innerDropdown: null,
	userIcon: null,
	onHintClick: null,
	onKeyDown: null,
	onKeyPress: null,
};

export default BridgeInput;
