import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import UserDropdown from '../UserDropdown';
import NetworkDropdown from '../NetworkDropdown';
import SignDropdown from '../SignDropdown';

import {
	EMPTY_PATH,
	ERROR_SEND_PATH,
	SIGN_TRANSACTION_PATH,
	SUCCESS_SEND_PATH,
} from '../../constants/RouterConstants';

import { sidebarToggle } from '../../actions/GlobalActions';

class Header extends React.PureComponent {

	render() {
		const { accounts, pathname } = this.props;

		if (
			[SIGN_TRANSACTION_PATH, SUCCESS_SEND_PATH, ERROR_SEND_PATH, EMPTY_PATH].includes(pathname)
		) {
			return (
				<header className="header">
					<SignDropdown />
				</header>
			);
		}

		return (
			<header
				className="header"
				role="button"
				onClick={() => this.props.sidebarToggle(true)}
				onKeyPress={() => this.props.sidebarToggle(true)}
				tabIndex="-1"
			>
				{(accounts && accounts.size) ? <UserDropdown /> : null}
				<NetworkDropdown />
			</header>
		);
	}

}

Header.propTypes = {
	accounts: PropTypes.object,
	pathname: PropTypes.string.isRequired,
	sidebarToggle: PropTypes.func.isRequired,
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
	(dispatch) => ({
		sidebarToggle: (value) => dispatch(sidebarToggle(value)),
	}),
)(Header);
