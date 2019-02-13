import React from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { sidebarToggle } from '../../actions/GlobalActions';

import { HEADER_TITLE } from '../../constants/GlobalConstants';
import { HIDE_NAVBAR_PATHS, NETWORK_PATH } from '../../constants/RouterConstants';
import Hamburger from '../../assets/images/icons/hamburger.svg';

class Navbar extends React.PureComponent {

	onClick(e) {
		e.target.blur();
		this.props.sidebarToggle(this.props.visibleSidebar);
	}


	isNetworkInfoPage(network) {
		const { pathname } = this.props.locationRouter;
		if (NETWORK_PATH !== pathname) {
			return false;
		}
		return !!network;
	}

	renderTitle() {
		const { pathname, search } = this.props.locationRouter;

		const item = HEADER_TITLE.find(({ path }) => (path === `${pathname}${search}`));

		return item || {};
	}
	render() {
		const { pathname } = this.props.locationRouter;
		const { title, link } = this.renderTitle();
		const { accounts, networkInfo } = this.props;
		return (
			!HIDE_NAVBAR_PATHS.includes(pathname) &&
			<div className="navbar">
				<ul>
					{
						(accounts && accounts.size) ?
							<li className="btn-nav-wrap" >
								<Button onClick={(e) => this.onClick(e)} className="btn-nav" >
									<img src={Hamburger} alt="" />
								</Button>
							</li> : null
					}
					{
						this.isNetworkInfoPage(networkInfo.name) ?
							<li className="page-title">
								<span>{networkInfo.name}</span>
								info
							</li>
							: title && <li className="page-title">{title}</li>
					}
					{
						link ?
							<li className="link-nav">
								<Link to={link.value}>{link.name}</Link>
							</li> : null
					}
				</ul>
			</div>
		);
	}

}

Navbar.propTypes = {
	visibleSidebar: PropTypes.bool.isRequired,
	locationRouter: PropTypes.any.isRequired,
	sidebarToggle: PropTypes.func.isRequired,
	accounts: PropTypes.object,
	networkInfo: PropTypes.object,
};

Navbar.defaultProps = {
	accounts: null,
	networkInfo: {},
};

export default connect(
	(state) => ({
		visibleSidebar: state.global.get('visibleSidebar'),
		locationRouter: state.router.location,
		accounts: state.global.getIn(['accounts', state.global.getIn(['network', 'name'])]),
		networkInfo: state.global.get('networkInfo'),
	}),
	(dispatch) => ({
		sidebarToggle: (value) => dispatch(sidebarToggle(value)),
	}),
)(Navbar);

