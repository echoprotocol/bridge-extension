import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import UserDropdown from '../UserDropdown';
import NetworkDropdown from '../NetworkDropdown';
import SignDropdown from '../SignDropdown';

import { SIGN_TRANSACTION_PATH } from '../../constants/RouterConstants';

class Header extends React.PureComponent {

	render() {
		const { accounts, pathname } = this.props;

		if (pathname === SIGN_TRANSACTION_PATH) {
			return (
				<header className="header">
					<SignDropdown />
				</header>
			);
		}

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
	pathname: PropTypes.string.isRequired,
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
