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

		const { label } = this.props;

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
				<Textarea
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
	label: PropTypes.string,
};

BridgeTextArea.defaultProps = {
	label: null,
};

export default BridgeTextArea;
