import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { sidebarToggle } from '../../actions/GlobalActions';

import {
	BACKUP_PATH,
	CREATE_ACCOUNT_PATH,
	RECEIVE_PATH,
	SEND_PATH,
	TRANSACTIONS_PATH,
	WATCH_TOKEN_PATH,
	WALLET_PATH,
} from '../../constants/RouterConstants';

import UserIcon from '../UserIcon';


class BridgeSidebar extends React.PureComponent {

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
								<div className="panel">
									<Link
										onClick={() => this.props.sidebarToggle(visibleSidebar)}
										className="active"
										to={WALLET_PATH}
									>
										<i className="icon-navWallet" />
										<div className="nav-title">My wallet</div>
									</Link>
									<div className="panel-body">
										<Link
											onClick={() => this.props.sidebarToggle(visibleSidebar)}
											to={SEND_PATH}
										>
													Send
										</Link>

										<Link
											onClick={() => this.props.sidebarToggle(visibleSidebar)}
											to={RECEIVE_PATH}
										>
													Receive
										</Link>

										<Link
											onClick={() => this.props.sidebarToggle(visibleSidebar)}
											to={WATCH_TOKEN_PATH}
										>
                                                    Watch token
										</Link>

									</div>
								</div>
							</li>
							<li>
								<Link
									onClick={() => this.props.sidebarToggle(visibleSidebar)}
									to={TRANSACTIONS_PATH}
								>
									<i className="icon-navHistory" />
									<div className="nav-title">Transactions history</div>
								</Link>
							</li>
							<li>
								<Link onClick={() => this.props.sidebarToggle(visibleSidebar)} to={BACKUP_PATH}>
									<i className="icon-navBackup" />
									<div className="nav-title">Backup account</div>
								</Link>
							</li>
							<li>
								<Link
									onClick={() => this.props.sidebarToggle(visibleSidebar)}
									to={CREATE_ACCOUNT_PATH}
								>
									<i className="icon-navInfo" />
									<div className="nav-title">About Bridge</div>
								</Link>
							</li>
						</ul>
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
		sidebarToggle: (value) => dispatch(sidebarToggle(value)),
	}),
)(BridgeSidebar);
