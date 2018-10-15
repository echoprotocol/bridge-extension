import React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { Button } from 'semantic-ui-react';
import CustomScroll from 'react-custom-scroll';
import classnames from 'classnames';

// Будет использоваться (не удалять)
// import NetworkInfo from './NetworkInfo';
import UserIcon from '../UserIcon';

class NetworkDropdown extends React.PureComponent {

	constructor(props) {
		super(props);

		this.state = {
			menuHeight: null,
			dropdownIsOpen: false,
		};
	}


	componentDidMount() {
		this.setDDMenuHeight();
	}

	componentDidUpdate() {
		this.setDDMenuHeight();
	}


	setDDMenuHeight() {

		const MAX_MENU_HEIGHT = 350;
		const el = document.getElementById('network-menu-container');

		if (el) {
			const height = el.clientHeight;
			if (this.state.menuHeight !== height) {
				return height > MAX_MENU_HEIGHT ?
					this.setState({ menuHeight: MAX_MENU_HEIGHT }) :
					this.setState({ menuHeight: height });
			}
		}

		return true;
	}

	toggleDropdown() {
		this.setState({ dropdownIsOpen: !this.state.dropdownIsOpen });
	}

	closeDropDown() {
		this.setState({ dropdownIsOpen: false });
	}

	render() {
		const menuHeight = {
			height: `${this.state.menuHeight}px`,
		};

		return (
			<Dropdown
				pullRight
				className="dropdown-network"
				id="dropdown-network"
				onToggle={() => this.toggleDropdown()}
				open={this.state.dropdownIsOpen}
			>
				<Dropdown.Toggle noCaret>
					<div className={classnames('current-network', { connected: true })}>
						<span className="cut">Main Network</span>
					</div>
					<i aria-hidden="true" className="dropdown icon" />
				</Dropdown.Toggle>

				<Dropdown.Menu >
					<div
						className="network-scroll"
						id="network-menu"
						style={menuHeight}
					>
						<CustomScroll
							flex="1"
							heightRelativeToParent="calc(100%)"
						>
							<div id="network-menu-container">
								<ul className="default-networks">

									<MenuItem onClick={() => this.closeDropDown()} eventKey="1">
										<span className="title">Main Network</span>
										<ul className="accounts">
											<li>No accounts</li>
										</ul>
									</MenuItem>

									<MenuItem onClick={() => this.closeDropDown()} eventKey="2" active>
										<span className="title">Test Network</span>
										<ul className="accounts">
											<li>
												<UserIcon color="green" avatar="ava7" />
											</li>
											<li>
												<UserIcon color="yellow" avatar="ava3" />
											</li>
											<li>
												<UserIcon color="pink" avatar="ava8" />
											</li>
										</ul>
									</MenuItem>
									<MenuItem onClick={() => this.closeDropDown()} eventKey="3">
										<span className="title">Dev Network</span>
										<ul className="accounts">
											<li>
												<UserIcon color="pink" avatar="ava8" />
											</li>
										</ul>
									</MenuItem>
								</ul>
								<ul className="custom-networks">
									<MenuItem onClick={() => this.closeDropDown()} eventKey="4">
										<Button className="btn-round-close" />
										<span className="title">Whitepowernet</span>
									</MenuItem>
									<MenuItem onClick={() => this.closeDropDown()} eventKey="5">
										<Button className="btn-round-close" />
										<span className="title">Hellelujahnet</span>
									</MenuItem>
									<MenuItem onClick={() => this.closeDropDown()} eventKey="6">
										<Button className="btn-round-close" />
										<span className="title">Homersimpsonnet</span>
									</MenuItem>
									<MenuItem onClick={() => this.closeDropDown()} eventKey="7">
										<Button className="btn-round-close" />
										<span className="title">Mytestnet</span>
									</MenuItem>
								</ul>
								<div className="dropdown-footer">
									{/* Проверить, зароется ли дропдаун при переходе на страницу нетворков */}
									<MenuItem onClick={() => this.closeDropDown()} eventKey="9">+ Add Networks</MenuItem>
								</div>
							</div>
						</CustomScroll>

					</div>

				</Dropdown.Menu>

			</Dropdown>

		);
	}

}

export default NetworkDropdown;

