import React from 'react';
import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';

import classnames from 'classnames';
import { Input } from 'semantic-ui-react';

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
		this.props.onChange(e);
	}

	render() {

		const { label, value, name } = this.props;

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
					value={value}
					name={name}
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
	value: PropTypes.string,
	name: PropTypes.string,
	onChange: PropTypes.func,
};

BridgeTextArea.defaultProps = {
	label: null,
	value: '',
	name: '',
	onChange: null,
};

export default BridgeTextArea;
