import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import UserDropdown from '../UserDropdown';
import NetworkDropdown from '../NetworkDropdown';

class Header extends React.PureComponent {

	render() {
		const { preview } = this.props;

		return (
			<header className="header">
				{preview.length ? <UserDropdown /> : null}
				<NetworkDropdown />
			</header>
		);
	}

}

Header.propTypes = {
	preview: PropTypes.array.isRequired,
};

export default connect(
	(state) => ({
		preview: state.balance.get('preview').toJS(),
	}),
	() => ({}),
)(Header);
