import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar, Button } from 'semantic-ui-react';
import { PanelGroup, Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { WALLET_PATH } from '../../constants/RouterConstants';
import UserIcon from '../UserIcon';


class BridgeSidebar extends React.PureComponent {

	render() {
		const { visible, onSidebarToggle } = this.props;
		return (
			<React.Fragment>
				<Sidebar
					visible={visible}
					animation="overlay"
				>
					<div className="sidebar-header">
						<Button
							className="btn-icon"
							onClick={() => onSidebarToggle()}
							content={
								<React.Fragment>
									<i className="icon-closeBig" />
								</React.Fragment>
							}
						/>
						<div className="sidebar-user">
							<UserIcon
								color="green"
								avatar="ava1"
								medium
							/>
							<div className="name">Homersimpson46</div>
						</div>
					</div>
					<nav className="sidebar-body">
						<ul className="nav-list">
							<li>
								<PanelGroup accordion id="accordion-example">
									<Panel eventKey="1">
										<Panel.Heading>
											<Panel.Title toggle>
												<i className="icon-navWallet" />
												<div className="nav-title">My wallet</div>
											</Panel.Title>
										</Panel.Heading>
										<Panel.Body collapsible>
											<div>
												<Link onClick={() => onSidebarToggle()} to={WALLET_PATH}>Send</Link>
											</div>
											<div>
												<Link onClick={() => onSidebarToggle()} to={WALLET_PATH}>Receive</Link>
											</div>
											<div>
												<Link onClick={() => onSidebarToggle()} to={WALLET_PATH}>
                                                    Watch token
												</Link>
											</div>


										</Panel.Body>
									</Panel>
								</PanelGroup>
							</li>
							<li>
								<Link onClick={() => onSidebarToggle()} to={WALLET_PATH}>
									<i className="icon-navHistory" />
									<div className="nav-title">Transactions history</div>
								</Link>
							</li>
							<li>
								<Link onClick={() => onSidebarToggle()} to={WALLET_PATH}>
									<i className="icon-navBackup" />
									<div className="nav-title">Backup account</div>
								</Link>
							</li>
							<li>
								<Link
									onClick={() => onSidebarToggle()}
									to={WALLET_PATH}
								>
									<i className="icon-navInfo" />
									<div className="nav-title">About Bridge</div>
								</Link>
							</li>
						</ul>
					</nav>
					<Button
						onClick={() => onSidebarToggle()}
						tabIndex="-1"
						className="sidebar-dimmer"
					/>

				</Sidebar>
			</React.Fragment>
		);
	}

}

BridgeSidebar.propTypes = {
	visible: PropTypes.bool.isRequired,
	onSidebarToggle: PropTypes.func.isRequired,

};

export default BridgeSidebar;
