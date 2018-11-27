import React from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { sidebarToggle } from '../../actions/GlobalActions';

import { HEADER_TITLE } from '../../constants/GlobalConstants';
import { HIDE_NAVBAR_PATHS } from '../../constants/RouterConstants';

class Navbar extends React.PureComponent {

	onClick(e) {
		e.target.blur();
		this.props.sidebarToggle(this.props.visibleSidebar);
	}

	renderTitle() {
		const { pathname, search } = this.props.locationRouter;

		const item = HEADER_TITLE.find(({ path }) => (path === `${pathname}${search}`));

		return item || {};
	}

	render() {
		const { pathname } = this.props.locationRouter;
		const { title, link } = this.renderTitle();

		return (
			!HIDE_NAVBAR_PATHS.includes(pathname) &&
			<div className="navbar">
				<ul>
					<li className="btn-nav-wrap" >
						<Button onClick={(e) => this.onClick(e)} className="icon-menu btn-nav" />
					</li>
					{ title ? <li className="page-title">{title}</li> : null }
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
};

export default connect(
	(state) => ({
		visibleSidebar: state.global.get('visibleSidebar'),
		locationRouter: state.router.location,
	}),
	(dispatch) => ({
		sidebarToggle: (value) => dispatch(sidebarToggle(value)),
	}),
)(Navbar);
