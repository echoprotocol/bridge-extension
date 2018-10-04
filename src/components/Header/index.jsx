import React from 'react';
import UserDropdown from '../UserDropdown';

class Header extends React.PureComponent {

	render() {


		return (
			<header className="header">
				<UserDropdown />
			</header>
		);
	}

}

export default Header;

