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
		};
	}


	componentDidMount() {
		this.setDDMenuHeight();
	}

	// Устанавливает высоту react-custom-scroll
	setDDMenuHeight() {
		const elm = document.querySelector('#network-menu');
		return elm.getBoundingClientRect().height > 350 ?
			this.setState({ menuHeight: 350 }) :
			this.setState({ menuHeight: elm.getBoundingClientRect().height });

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
							<ul className="default-networks">

								<MenuItem eventKey="1">
									<span className="title">Main Network</span>
									<ul className="accounts">
										<li>No accounts</li>
									</ul>
								</MenuItem>

								<MenuItem eventKey="2" active>
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
								<MenuItem eventKey="3">
									<span className="title">Dev Network</span>
									<ul className="accounts">
										<li>
											<UserIcon color="pink" avatar="ava8" />
										</li>
									</ul>
								</MenuItem>
							</ul>
							<ul className="custom-networks">
								<MenuItem eventKey="4">
									<Button className="btn-round-close" />
									<span className="title">Whitepowernet</span>
								</MenuItem>
								<MenuItem eventKey="5">
									<Button className="btn-round-close" />
									<span className="title">Hellelujahnet</span>
								</MenuItem>
								<MenuItem eventKey="6">
									<Button className="btn-round-close" />
									<span className="title">Homersimpsonnet</span>
								</MenuItem>
								<MenuItem eventKey="7">
									<Button className="btn-round-close" />
									<span className="title">Mytestnet</span>
								</MenuItem>
							</ul>
							<div className="dropdown-footer">
								<MenuItem eventKey="9">+ Add Networks</MenuItem>
							</div>
						</CustomScroll>

					</div>

				</Dropdown.Menu>

			</Dropdown>

		);
	}

}

export default NetworkDropdown;

