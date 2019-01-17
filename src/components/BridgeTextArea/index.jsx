import React from 'react';
import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';
import classnames from 'classnames';

class BridgeTextArea extends React.Component {


	constructor(props) {
		super(props);

		this.state = {
			up: false,
			filled: false,
		};
	}
	componentWillMount() {
		this.setState({ filled: !!this.props.value });
	}
	onFocus() {
		this.setState({ up: true });
	}

	onBlur() {
		if (this.props.value.length === 0) {
			this.setState({ filled: false });
		}
		this.setState({ up: false });
	}

	onChange(e) {

		this.setState({ filled: !!e.target.value.trim().length });
		this.props.onChange(e);
	}

	renderError() {
		return (<div className="message-error"> {this.props.errorText}</div>);
	}

	render() {

		const {
			label, value, error, name, disabled,
		} = this.props;

		const {
			up, filled,
		} = this.state;

		return (
			<React.Fragment>
				<div
					className={classnames(
						'input-wrap textarea-wrap',
						{ up },
						{ filled },
					)}
				>
					<Textarea
						rows={1}
						value={value}
						name={name}
						onChange={(e) => this.onChange(e)}
						onFocus={() => this.onFocus()}
						onBlur={() => this.onBlur()}
						disabled={disabled}
					/>

					<span className="label">{label}</span>

				</div>
				{ error ? this.renderError() : null }
			</React.Fragment>
		);
	}

}

BridgeTextArea.propTypes = {
	label: PropTypes.string,
	value: PropTypes.string,
	error: PropTypes.bool,
	errorText: PropTypes.string,
	name: PropTypes.string,
	onChange: PropTypes.func,
	disabled: PropTypes.bool,
};

BridgeTextArea.defaultProps = {
	label: null,
	value: '',
	name: '',
	error: false,
	errorText: '',
	onChange: null,
	disabled: false,
};

export default BridgeTextArea;
