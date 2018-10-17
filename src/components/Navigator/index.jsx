import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar, Button } from 'semantic-ui-react';
import { PanelGroup, Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { WALLET_PATH } from '../../constants/RouterConstants';
import UserIcon from '../UserIcon';

class Navbar extends React.PureComponent {

	// componentWillReceiveProps(nextProps) {
	// 	if (nextProps.visible) {
	// 		this.setInitFocus();
	// 	}
	// }
	// setInitFocus() {
	// 	this.bridgeBar.ref.focus();
	// }


	render() {
		const { visible, onSidebarToggle } = this.props;
		return (

			<Sidebar
				animation="overlay"
				visible={visible}
			>
				<div className="sidebar-header">
					<Button
						ref={(bridgeBar) => { this.bridgeBar = bridgeBar; }}
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
											<i className="icon-navWallet" />My Wallet
										</Panel.Title>
									</Panel.Heading>
									<Panel.Body collapsible>
										<div>
											<Link onClick={() => onSidebarToggle()} to={WALLET_PATH}>Send</Link>
										</div>
										<div>
											<Link onClick={() => onSidebarToggle()} to={WALLET_PATH}>Recieve</Link>
										</div>
										<div>
											<Link onClick={() => onSidebarToggle()} to={WALLET_PATH}>Watch token</Link>
										</div>


									</Panel.Body>
								</Panel>
							</PanelGroup>
						</li>
						<li>
							<Link onClick={() => onSidebarToggle()} to={WALLET_PATH}>
								<i className="icon-navHistory" /> Transaction history
							</Link>
						</li>
						<li>
							<Link onClick={() => onSidebarToggle()} to={WALLET_PATH}>
								<i className="icon-navBackup" /> Backup account
							</Link>
						</li>
						<li>
							<Link
								onBlur={() => this.setInintFocus()}
								onClick={() => onSidebarToggle()}
								to={WALLET_PATH}
							>
								<i className="icon-navInfo" /> About Bridge
							</Link>
						</li>
					</ul>


				</nav>
			</Sidebar>
		);
	}

}

Navbar.propTypes = {
	visible: PropTypes.bool.isRequired,
	onSidebarToggle: PropTypes.func.isRequired,

};

export default Navbar;
