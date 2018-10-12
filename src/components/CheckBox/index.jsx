import React from 'react';
import PropTypes from 'prop-types';

class CheckBox extends React.Component {

	render() {
		const { label, additionalClass, id } = this.props;

		return (
			<div className={`checkbox-container ${(additionalClass) && additionalClass}`}>
				<input type="checkbox" id={id} />
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
};

CheckBox.defaultProps = {
	label: '',
	additionalClass: '',
	id: '',
};


export default CheckBox;
