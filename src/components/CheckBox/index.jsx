import React from 'react';
import PropTypes from 'prop-types';

class CheckBox extends React.Component {

	render() {
		const {
			label, additionalClass, id, checked,
		} = this.props;

		return (
			<div className={`checkbox-container ${(additionalClass) && additionalClass}`}>
				<input type="checkbox" id={id} checked={checked} onChange={(e) => this.props.onChange(e)} />
				<label htmlFor={id}>
					<div className="icon-checkbox" />
					{
						(label) && <span className="text">{label}</span>
					}
				</label>
			</div>
		);
	}

}

CheckBox.propTypes = {
	label: PropTypes.string,
	additionalClass: PropTypes.string,
	id: PropTypes.string,
	checked: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
};

CheckBox.defaultProps = {
	label: '',
	additionalClass: '',
	id: '',
	checked: false,
};


export default CheckBox;
