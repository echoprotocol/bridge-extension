import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'semantic-ui-react';
import classnames from 'classnames';

class BridgeInput extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			up: false,
			filled: false,
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

	renderError() {
		return (
			<React.Fragment>

				<div className="message-error">
					{ this.props.errorText}
				</div>

				{
					this.props.hintText.length > 0 ?
						<div className="message-hint">
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

	render() {
		return (

			<div className={classnames('input-wrap', this.props.theme)} >
				<Input
					name={this.props.name}
					label={this.props.labelText}
					type={this.props.type}
					error={this.props.error}
					onFocus={() => this.onFocus()}

					onBlur={() => this.onBlur()}
					onChange={(e) => this.onChange(e)}

					className={classnames(
						{ up: this.state.up },
						{ focused: this.state.focus },
						{ filled: this.state.filled },
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
	type: PropTypes.string,
	position: PropTypes.string,
	labelText: PropTypes.string,
	errorText: PropTypes.string,
	hintText: PropTypes.string,
	descriptionText: PropTypes.string,
	onChange: PropTypes.func,
	onClick: PropTypes.func,
};

BridgeInput.defaultProps = {
	name: '',
	theme: 'light',
	error: false,
	type: 'text',
	position: '',
	labelText: '',
	errorText: '',
	hintText: '',
	descriptionText: '',
	onChange: null,
	onClick: null,
};

export default BridgeInput;
