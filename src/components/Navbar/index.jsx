import React from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import { HEADER_TITLE } from '../../constants/GlobalConstants';

class Navbar extends React.PureComponent {

	onClick(e) {
		e.target.blur();
		this.props.onSidebarToggle();
	}

	renderTitle() {
		const { pathname, search } = this.props.location;

		const item = HEADER_TITLE.find(({ path }) => (path === `${pathname}${search}`));

		return item || {};
	}

	render() {
		const { title, link } = this.renderTitle();

		return (
		// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// НУЖНО СКРЫВАТЬ НАВБАР, ПОСЛЕ ОТПРАВКИ ТРАНЗАКЦИИ НА СТРАНИЦАХ
		// ErrorTransactions и SuccessTransactions
		// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
	location: PropTypes.object.isRequired,
	onSidebarToggle: PropTypes.func.isRequired,
};

export default withRouter(Navbar);
