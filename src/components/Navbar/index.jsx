import React from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import { HEADER_TITLE } from '../../constants/GlobalConstants';

class Navbar extends React.PureComponent {

	renderTitle() {
		const { location } = this.props;

		const item = HEADER_TITLE.find((title) => {
			if (title.path === location.pathname) {
				return true;
			}
			return false;
		});
		return item || '';
	}

	render() {
		const { title, link } = this.renderTitle();

		return (
			<div className="navbar">
				<ul>
					<li className="btn-nav-wrap" >
						<Button className="icon-menu btn-nav" />
					</li>
					{
						title &&
						<li className="page-title">{title}</li>}
					{
						link &&
						<li className="link-nav">
							<Link to={link.value}>{link.name}</Link>
						</li>
					}
				</ul>
			</div>
		);
	}

}

Navbar.propTypes = {
	location: PropTypes.object.isRequired,
};

export default withRouter(Navbar);
