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
		return (

			<div className={classnames('input-wrap', this.props.theme)} >
				<Input
					name={this.props.name}
					label={this.props.labelText}
					type={this.props.type}
					error={this.props.error}
					onFocus={() => this.onFocus()}
					ref={this.handleRef}
					onBlur={() => this.onBlur()}
					onChange={(e) => this.onChange(e)}
					disabled={this.props.disabled}
					autoFocus={this.props.autoFocus}
					icon={this.props.privacyEye ? this.renderPrivacyEye() : false}
					className={classnames(
						{ up: this.state.up },
						{ focused: this.state.focus },
						{ filled: this.state.filled },
						{ eye: this.props.privacyEye },
						this.props.position,
					)}
				/>

				{ this.props.error ? this.renderError() : null }
				{ this.props.descriptionText ? <div className="message-description">{ this.props.descriptionText }</div> : null }

			</div>

		);
	}

}

BridgeInput.propTypes = {
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
	descriptionText: PropTypes.string,
	onChange: PropTypes.func,
	onClick: PropTypes.func,
	privacyEye: PropTypes.bool,
};

BridgeInput.defaultProps = {
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
	descriptionText: '',
	onChange: null,
	onClick: null,
	privacyEye: false,
};

export default BridgeInput;
