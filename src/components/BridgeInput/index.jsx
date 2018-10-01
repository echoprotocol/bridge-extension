import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'semantic-ui-react';
import classnames from 'classnames';

class BridgeInput extends React.Component {

	constructor() {
		super();

		this.state = {
			up: false,
			focus: false,
		};
	}

	onFocus() {
		this.setState({ up: true, focus: true });
	}

	onBlur(e) {
		if (!this.state.focus || (e.target.value.length < 1)) {
			this.setState({ up: false, focus: false });
		}
	}


	render() {

		return (

			<div className={classnames('input-wrap', this.props.theme)} >
				<Input
					label="Repeat PIN"
					error
					onFocus={() => this.onFocus()}
					onBlur={(e) => this.onBlur(e)}
					className={classnames({ up: this.state.up }, { focused: this.state.focus })}
				/>
				<div className="error-message">Somthing went wrong</div>
			</div>

		);
	}

}

BridgeInput.propTypes = {
	theme: PropTypes.string,

};

BridgeInput.defaultProps = {
	theme: 'asdasd',
};

export default BridgeInput;
