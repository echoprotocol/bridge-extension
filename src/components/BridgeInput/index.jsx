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

	onFocus() {
		this.setState({ up: true });
	}

	onChange(e) {
		this.setState({ filled: !!e.target.value.trim().length });
		this.props.onChange(e);
	}

	onBlur() {
		this.setState({ up: false });
	}

	onTogglePrivacy() {
		this.setState({ showPas: !this.state.showPas });
	}

	renderError() {
		return (
			<React.Fragment>

				<div className="message-error">
					{ this.props.errorText}
				</div>

				{
					this.props.hintText.length > 0 ?
						<div className="message-hint">
                            You can try
							<span
								role="button"
								tabIndex="0"
								onClick={this.props.onClick}
								onKeyPress={this.props.onClick}
							> { this.props.hintText }
							</span>
						</div> : null
				}

			</React.Fragment>
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
			defaultUp, readOnly, userIcon, innerDropdown,
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
					ref={this.handleRef}
					onFocus={() => this.onFocus()}
					onBlur={() => this.onBlur()}
					onChange={(e) => this.onChange(e)}
					action={(innerDropdown) && (<CurrencySelect data={innerDropdown} />)}
				/>
				{ userIcon ? this.renderImage('green', 3) : null}
				{ error ? this.renderError() : null }
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
	descriptionText: PropTypes.string,
	onChange: PropTypes.func,
	onClick: PropTypes.func,
	privacyEye: PropTypes.bool,

	innerDropdown: PropTypes.array,
	userIcon: PropTypes.string,
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
	descriptionText: '',
	onChange: null,
	onClick: null,
	privacyEye: false,

	innerDropdown: null,
	userIcon: null,
};

export default BridgeInput;
