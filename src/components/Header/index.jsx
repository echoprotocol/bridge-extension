import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import UserDropdown from '../UserDropdown';
import NetworkDropdown from '../NetworkDropdown';
import { sidebarToggle } from '../../actions/GlobalActions';

class Header extends React.PureComponent {

	render() {
		const { accounts } = this.props;

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
