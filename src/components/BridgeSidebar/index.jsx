import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar, Button } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';

import { sidebarToggle } from '../../actions/GlobalActions';
import { changeCrypto, userLockCrypto } from '../../actions/CryptoActions';

import {
	BACKUP_PATH,
	TRANSACTIONS_PATH,
	ABOUT_PATH,
	WALLET_PATH, UNLOCK_PATH,
} from '../../constants/RouterConstants';

import Avatar from '../Avatar';
import LockIcon from '../../assets/images/icons/lock.svg';
import IconClose from '../../assets/images/icons/cross_big.svg';


class BridgeSidebar extends React.PureComponent {

	lock() {
		this.props.sidebarToggle(this.props.visibleSidebar);
		this.props.lock();
	}

	goToBackup(e) {
		e.preventDefault();
		this.props.sidebarToggle(this.props.visibleSidebar);
		if (this.props.location.pathname === BACKUP_PATH) return;
		this.props.history.push(BACKUP_PATH);
		this.props.setGoTo(BACKUP_PATH);
		this.props.history.push(UNLOCK_PATH);
	}

	render() {
		const { visibleSidebar, account } = this.props;

		return (
			<React.Fragment>
				<Sidebar
					visible={visibleSidebar}
					animation="overlay"
				>
					<div className="sidebar-header">
						<Button
							className="btn-close btn-icon"
							onClick={() => this.props.sidebarToggle(visibleSidebar)}
							content={
								<img src={IconClose} alt="" />
							}
						/>
						{
							account && account.size ?
								<div className="sidebar-user">
									<Avatar
										size={42}
										name={account.get('name')}
									/>
									<div className="name">{account.get('name')}</div>
								</div> : null

						}
					</div>
					<nav className="sidebar-body">
						<ul className="nav-list">
							<li>
								<NavLink
									exact
									onClick={() => this.props.sidebarToggle(visibleSidebar)}
									to={WALLET_PATH}
								>
									<div className="nav-title">My wallet</div>
								</NavLink>
							</li>
							<li>
								<NavLink
									exact
									onClick={() => this.props.sidebarToggle(visibleSidebar)}
									to={TRANSACTIONS_PATH}
								>
									<div className="nav-title">Transactions history</div>
								</NavLink>
							</li>
							<li>
								<NavLink
									exact
									onClick={(e) => this.goToBackup(e)}
									to={BACKUP_PATH}
								>
									<div className="nav-title">Backup account</div>
								</NavLink>
							</li>
							<li>
								<NavLink
									exact
									onClick={() => this.props.sidebarToggle(visibleSidebar)}
									to={ABOUT_PATH}
								>
									<div className="nav-title">About Bridge</div>
								</NavLink>
							</li>
						</ul>
						<Button
							onClick={() => this.lock()}
							className="btn-lock"
						>
							<img src={LockIcon} alt="lock app" />
							Lock down
						</Button>
					</nav>
					<Button
						onClick={() => this.props.sidebarToggle(visibleSidebar)}
						tabIndex="-1"
						className="sidebar-dimmer"
					/>

				</Sidebar>
			</React.Fragment>
		);
	}

}

BridgeSidebar.propTypes = {
	account: PropTypes.object,
	history: PropTypes.object,
	location: PropTypes.object,
	visibleSidebar: PropTypes.bool.isRequired,
	setGoTo: PropTypes.func.isRequired,
	sidebarToggle: PropTypes.func.isRequired,
	lock: PropTypes.func.isRequired,
};

BridgeSidebar.defaultProps = {
	account: null,
	history: null,
	location: null,
};

export default withRouter(connect(
	(state) => ({
		visibleSidebar: state.global.get('visibleSidebar'),
		account: state.global.get('account'),
	}),
	(dispatch) => ({
		lock: () => dispatch(userLockCrypto()),
		setGoTo: (value) => dispatch(changeCrypto({ goTo: value })),
		sidebarToggle: (value) => dispatch(sidebarToggle(value)),
	}),
)(BridgeSidebar));
