import React from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom'
import { withRouter } from 'react-router';

import { HEADER_TITLE } from '../../constants/GlobalConstants';

class Navbar extends React.PureComponent {

	renderTitle() {
		const { location } = this.props;

		const item = HEADER_TITLE.find((title) => {
			if (title.path === location.pathname) {
				return true;
			} else if (title.path.split('/')[1] === location.pathname.split('/')[1]) {
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
						<Button
							className="btn-nav"
							content={
								<React.Fragment>
									<div />
									<div />
									<div />
								</React.Fragment>
							}
						/>
					</li>
					<li className="page-title">{title}</li>
					{
						link &&
						<li className="link-nav">
							<a href={link.value}>{link.name}</a>
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
