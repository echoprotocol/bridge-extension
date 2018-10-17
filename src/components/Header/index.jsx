import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import UserDropdown from '../UserDropdown';
import NetworkDropdown from '../NetworkDropdown';

class Header extends React.PureComponent {

	render() {
		const { accounts } = this.props;

		return (
			<header className="header">
				{accounts.size ? <UserDropdown /> : null}
				<NetworkDropdown />
			</header>
		);
	}

}

Header.propTypes = {
	accounts: PropTypes.object.isRequired,
};

export default connect(
	(state) => ({
		accounts: state.global.get('accounts'),
	}),
	() => ({}),
)(Header);
