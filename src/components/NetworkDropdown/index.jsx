import React from 'react';
import { connect } from 'react-redux';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import CustomScroll from 'react-custom-scroll';
import { withRouter } from 'react-router';
import classnames from 'classnames';

import {
	changeNetwork,
	switchAccountNetwork,
	setNetworkInfo,
} from '../../actions/GlobalActions';

import { NETWORKS } from '../../constants/GlobalConstants';
import { ADD_NETWORK_PATH, NETWORK_PATH } from '../../constants/RouterConstants';

import GlobalReducer from '../../reducers/GlobalReducer';

import downArrow from '../../assets/images/icons/arrow_dropdown_light.svg';
import networkInfo from '../../assets/images/icons/network_info.svg';

class NetworkDropdown extends React.PureComponent {

	constructor(props) {
		super(props);
		this.state = {
			menuHeight: null,
			opened: false,
			disableHover: false,
		};
	}

	componentDidMount() {
		this.setDDMenuHeight();
	}

	componentDidUpdate() {
		this.setDDMenuHeight();
		this.blur();
	}

	onChangeNetwork(name) {

		const { network, networks, connected } = this.props;


		if (!network) {
			return false;
		}

		const currentNetworkName = network.get('name');

		if (currentNetworkName === name) {
			if (!connected) {
				this.props.tryToConnect();
			}
			this.closeDropDown();
			return false;
		}

		this.props.setGlobalLoad();

		const newNetwork = networks.concat(NETWORKS).find((i) => i.name === name);
		setTimeout(() => this.props.changeNetwork(newNetwork), 0);
		this.closeDropDown();

		return true;
	}

	onMouseEnter() {
		this.setState({ disableHover: true });
	}

	onMouseLeave() {
		this.setState({ disableHover: false });
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


	getNetworks(networks, eventKey = 0, custom = false) {
		const { network } = this.props;

		if (!network) {
			return null;
		}

		const name = network.get('name');

		return networks.map((n, i) => (
			<MenuItem
				onClick={() => this.onChangeNetwork(n.name)}
				key={n.name}
				eventKey={i + eventKey}
				active={n.name === name}
				className={classnames({ 'disable-hover': this.state.disableHover })}
			>
				{/* {custom &&
					<Button
						className="btn-round-close"
						onClick={(e) => this.onDeleteNetwork(e, n.name)}
						content={
							<img src={Cross} alt="" />
						}
					/>
				} */}
				<span className="title">{n.name}</span>
				<Button
					className="info-network"
					onMouseEnter={() => this.onMouseEnter()}
					onMouseLeave={() => this.onMouseLeave()}
					onClick={(e) => this.showNetworkInfo(e, n, n.name === name, custom)}
					content={
						<img src={networkInfo} alt="networkInfo" />}
				/>
			</MenuItem>
		));
	}

	showNetworkInfo(e, network, isActive, custom) {
		e.preventDefault();
		e.stopPropagation();
		this.props.setNetworkInfo({
			name: network.name,
			url: network.url,
			isActive,
			custom,
		});
		this.props.history.push(NETWORK_PATH);
		this.closeDropDown();
	}

	closeDropDown() {
		this.setState({ opened: false });
	}

	blur() {
		// fix: has no acces to ref
		if (!this.state.opened && document.getElementById('dropdown-network')) {
			document.getElementById('dropdown-network').blur();
		}
	}

	toggleDropdown() {
		this.setState({ opened: !this.state.opened });
	}

	addNetwork() {
		this.props.history.push(ADD_NETWORK_PATH);
		this.closeDropDown();
	}

	render() {
		const menuHeight = {
			height: `${this.state.menuHeight}px`,
		};

		const { network, networks, connected } = this.props;

		if (!network) {
			return null;
		}

		const name = network.get('name');
		const defaultNetworks = this.getNetworks(NETWORKS);
		const customNetworks = this.getNetworks(networks.toJS(), defaultNetworks.length, true);
		const addNetworkEventKey = defaultNetworks.length + customNetworks.length;

		return (
			<Dropdown
				pullRight
				className="dropdown-network"
				id="dropdown-network"
				onToggle={() => this.toggleDropdown()}
				open={this.state.opened}
			>
				<Dropdown.Toggle noCaret>
					<div className={classnames('current-network', { connected })}>
						<span className="cut">{name}</span>
					</div>
					<img className="ddDown" src={downArrow} alt="" />
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
									{defaultNetworks}
								</ul>
								<ul className="custom-networks">
									{customNetworks}
								</ul>
								<div className="dropdown-footer">
									<MenuItem
										onClick={() => this.addNetwork()}
										eventKey={addNetworkEventKey}
									>+ Add Network
									</MenuItem>
								</div>
							</div>
						</CustomScroll>

					</div>

				</Dropdown.Menu>

			</Dropdown>

		);
	}

}

NetworkDropdown.propTypes = {
	network: PropTypes.object.isRequired,
	networks: PropTypes.object.isRequired,

	changeNetwork: PropTypes.func.isRequired,

	setGlobalLoad: PropTypes.func.isRequired,
	setNetworkInfo: PropTypes.func.isRequired,

	tryToConnect: PropTypes.func.isRequired,
	history: PropTypes.object.isRequired,
	connected: PropTypes.bool,
};

NetworkDropdown.defaultProps = {
	connected: false,
};

export default withRouter(connect(
	(state) => ({
		network: state.global.get('network'),
		networks: state.global.get('networks'),
		connected: state.global.get('connected'),
	}),
	(dispatch) => ({
		changeNetwork: (network) => dispatch(changeNetwork(network)),
		setGlobalLoad: () => dispatch(GlobalReducer.actions.set({ field: 'loading', value: true })),
		setNetworkInfo: (network) => dispatch(setNetworkInfo(network)),
		switchAccountNetwork: (name, network) => dispatch(switchAccountNetwork(name, network)),
		tryToConnect: () => dispatch(changeNetwork()),
	}),
)(NetworkDropdown));

