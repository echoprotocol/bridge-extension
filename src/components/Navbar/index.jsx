import React from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { sidebarToggle } from '../../actions/GlobalActions';

import { HEADER_TITLE } from '../../constants/GlobalConstants';

class Navbar extends React.PureComponent {

	onClick(e) {
		e.target.blur();
		this.props.sidebarToggle(this.props.visibleSidebar);
	}

	renderTitle() {
		const { pathname, search } = this.props.location;

		console.log(pathname, search);
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
	visibleSidebar: PropTypes.bool.isRequired,
	location: PropTypes.object.isRequired,
	sidebarToggle: PropTypes.func.isRequired,
};

export default withRouter(connect(
	(state) => ({
		visibleSidebar: state.global.get('visibleSidebar'),
	}),
	(dispatch) => ({
		sidebarToggle: (value) => dispatch(sidebarToggle(value)),
	}),
)(Navbar));
