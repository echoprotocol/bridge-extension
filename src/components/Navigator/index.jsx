import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'semantic-ui-react';

class Navbar extends React.PureComponent {

	render() {
		const { visible } = this.props;
		return (

			<Sidebar
				animation="overlay"
				visible={visible}
				key="sidebar"
			>
            asdasdas
			</Sidebar>
		);
	}

}

Navbar.propTypes = {
	visible: PropTypes.bool.isRequired,
};

export default Navbar;
