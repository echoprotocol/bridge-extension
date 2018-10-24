import React from 'react';
import PropTypes from 'prop-types';

class CustomMenu extends React.Component {

	render() {
		const { children } = this.props;

		return (
			<ul role="menu" className="dropdown-menu dropdown-menu-right">
				{React.Children.toArray(children)}
				{/* {React.Children.toArray(children).filter(
                        (child) => !value.trim() || child.props.children.indexOf(value) !== -1
                    )} */}
			</ul>
		);
	}

}

CustomMenu.propTypes = {
	children: PropTypes.object,
};

CustomMenu.defaultProps = {
	children: {},
};

export default CustomMenu;
