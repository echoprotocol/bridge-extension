import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar, Button } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';

import { sidebarToggle } from '../../actions/GlobalActions';
import { userLockCrypto } from '../../actions/CryptoActions';

import {
	BACKUP_PATH,
	TRANSACTIONS_PATH,
	ABOUT_PATH,
	WALLET_PATH,
} from '../../constants/RouterConstants';

import UserIcon from '../UserIcon';
import LockIcon from '../../assets/images/icons/lock.svg';

// import iconWallet from '../../assets/images/icons/navigation_wallet_grey.svg';


class BridgeSidebar extends React.PureComponent {

	lock() {
		this.props.sidebarToggle(this.props.visibleSidebar);
		this.props.lock();
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
							className="btn-icon"
							onClick={() => this.props.sidebarToggle(visibleSidebar)}
							content={
								<React.Fragment>
									<i className="icon-closeBig" />
								</React.Fragment>
							}
						/>
						{
							account &&
							<div className="sidebar-user">
								<UserIcon
									color={account.get('iconColor')}
									avatar={`ava${account.get('icon')}`}
									size="medium"
								/>
								<div className="name">{account.get('name')}</div>
							</div>
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
									<i className="icon-navWallet" />
									<div className="nav-title">My wallet</div>
								</NavLink>
							</li>
							<li>
								<NavLink
									exact
									onClick={() => this.props.sidebarToggle(visibleSidebar)}
									to={TRANSACTIONS_PATH}
								>
									<i className="icon-navHistory" />
									<div className="nav-title">Transactions history</div>
								</NavLink>
							</li>
							<li>
								<NavLink
									exact
									onClick={() => this.props.sidebarToggle(visibleSidebar)}
									to={BACKUP_PATH}
								>
									<i className="icon-navBackup" />
									<div className="nav-title">Backup account</div>
								</NavLink>
							</li>
							<li>
								<NavLink
									exact
									onClick={() => this.props.sidebarToggle(visibleSidebar)}
									to={ABOUT_PATH}
								>
									<i className="icon-navInfo" />
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
	visibleSidebar: PropTypes.bool.isRequired,
	sidebarToggle: PropTypes.func.isRequired,
	lock: PropTypes.func.isRequired,
};

BridgeSidebar.defaultProps = {
	account: null,
};

export default connect(
	(state) => ({
		visibleSidebar: state.global.get('visibleSidebar'),
		account: state.global.get('account'),
	}),
	(dispatch) => ({
		lock: () => dispatch(userLockCrypto()),
		sidebarToggle: (value) => dispatch(sidebarToggle(value)),
	}),
)(BridgeSidebar);
