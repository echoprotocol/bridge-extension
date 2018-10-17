import React from 'react';
import PropTypes from 'prop-types';
import { TextArea } from 'semantic-ui-react';
import classnames from 'classnames';

class BridgeTextArea extends React.Component {

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

	onBlur() {
		this.setState({ up: false });
	}

	onChange(e) {
		this.setState({ filled: !!e.target.value.trim().length });
	}

	render() {

		const { autoHeight, label } = this.props;

		const {
			up, filled,
		} = this.state;

		return (
			<div
				className={classnames(
					'input-wrap textarea-wrap',
					{ up },
					{ filled },
				)}
			>
				<TextArea
					autoHeight={autoHeight}
					rows={1}
					onChange={(e) => this.onChange(e)}
					onFocus={() => this.onFocus()}
					onBlur={() => this.onBlur()}
				/>
				<span className="label">{label}</span>
			</div>
		);
	}

}

BridgeTextArea.propTypes = {
	autoHeight: PropTypes.bool,
	label: PropTypes.string,
};

BridgeTextArea.defaultProps = {
	autoHeight: false,
	label: null,
};

export default BridgeTextArea;
