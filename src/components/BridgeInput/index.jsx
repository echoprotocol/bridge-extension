import React from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from 'semantic-ui-react';
import classnames from 'classnames';
import UserIcon from '../UserIcon';
import CurrencySelect from '../../components/CurrencySelect';

class BridgeInput extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			up: false,
			filled: false,
			showPas: false,
		};
	}


	// componentDidUpdate() {
	// 	const { name, setFocus } = this.props;
	//
	// 	if (setFocus) {
	// 		this[name].focus();
	// 	}
	// }


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
		const { name } = this.props;
		this.setState({ filled: !!this[name].inputRef.value });
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
					)}
					placeholder={placeholder}
					// ref={this.handleRef}
					onFocus={() => this.onFocus()}
					onBlur={() => this.onBlur()}
					onChange={(e) => this.onChange(e)}
					action={(innerDropdown) && (<CurrencySelect data={innerDropdown} />)}
					onKeyDown={(e) => (onKeyDown ? onKeyDown(e) : null)}
					onKeyPress={(e) => onKeyPress && onKeyPress(e)}
				/>
				{ userIcon ? this.renderImage('green', 3) : null}
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
	descriptionText: PropTypes.string,
	setFocus: PropTypes.bool,
	onChange: PropTypes.func,
	privacyEye: PropTypes.bool,
	innerDropdown: PropTypes.array,
	userIcon: PropTypes.string,
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
	descriptionText: '',
	setFocus: false,
	onChange: null,
	privacyEye: false,
	innerDropdown: null,
	userIcon: null,
	onHintClick: null,
	onKeyDown: null,
	onKeyPress: null,
};

export default BridgeInput;
