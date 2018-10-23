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
				{(accounts && accounts.size) ? <UserDropdown /> : null}
				<NetworkDropdown />
			</header>
		);
	}

}

Header.propTypes = {
	accounts: PropTypes.object,
};

Header.defaultProps = {
	accounts: null,
};

export default connect(
	(state) => {
		const networkName = state.global.getIn(['network', 'name']);
		const accounts = state.global.getIn(['accounts', networkName]);
		return { accounts };
	},
	() => ({}),
)(Header);
