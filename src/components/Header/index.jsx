import React from 'react';
import UserDropdown from '../UserDropdown';
import NetworkDropdown from '../NetworkDropdown';

class Header extends React.PureComponent {

	render() {


		return (
			<header className="header">
				<UserDropdown />
				<NetworkDropdown />
			</header>
		);
	}

}

export default Header;

