// Будет использоваться (не удалять)
// import NetworkInfo from './NetworkInfo';
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
	deleteNetwork,
	switchAccountNetwork,
	switchAccount,
	globalInit,
} from '../../actions/GlobalActions';

import { NETWORKS } from '../../constants/GlobalConstants';
import { ADD_NETWORK_PATH } from '../../constants/RouterConstants';

import GlobalReducer from '../../reducers/GlobalReducer';

import UserIcon from '../UserIcon';


class NetworkDropdown extends React.PureComponent {

	constructor(props) {
		super(props);

		this.state = {
			menuHeight: null,
			opened: false,
		};
	}

	componentDidMount() {
		this.setDDMenuHeight();
	}

	componentDidUpdate() {
		this.setDDMenuHeight();
	}

	onDeleteNetwork(e, name) {
		e.stopPropagation();
		e.preventDefault();

		const { networks } = this.props;

		const network = networks.concat(NETWORKS).find((i) => i.name === name);
		this.props.deleteNetwork(network);
		this.closeDropDown();
	}

	onChangeNetwork(name) {
		const { network, networks, connected } = this.props;

		if (!network) {
			return false;
		}

		const currentNetworkName = network.get('name');

		if (currentNetworkName === name) {
			if (!connected) {
				this.props.tryToConnect(true);
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

	onSwitchAccount(e, accountName, network) {
		e.stopPropagation();
		e.preventDefault();
		const { network: activeNetwork, account, connected } = this.props;

		if (!account || !activeNetwork) {
			return false;
		}

		if (activeNetwork.get('name') === network.name) {
			if (!connected) {
				this.props.tryToConnect(true);
			}

			if (account.get('name') === accountName) {
				this.closeDropDown();
				return null;
			}

			this.props.switchAccount(accountName);

			this.closeDropDown();

			return false;
		}

		this.props.setGlobalLoad();

		this.props.switchAccountNetwork(accountName, network);

		this.closeDropDown();

		return true;
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

	getAccounts(network) {
		let { accounts } = this.props;

		accounts = accounts.get(network.name);

		if (!accounts) {
			return null;
		}

		return accounts
			.toArray()
			.slice(Math.max(accounts.size - 4, 0))
			.map((account) =>
				(
					<li key={account.id}>
						<div
							role="button"
							tabIndex="0"
							onClick={(e) => this.onSwitchAccount(e, account.name, network)}
							onKeyPress={(e) => this.onSwitchAccount(e, account.name, network)}
						>
							<UserIcon
								avatar={`ava${account.icon}`}
								tabSelect
								color={account.iconColor}
							/>
						</div>
					</li>
				));
	}

	getNetworks(networks, eventKey = 0, custom = false) {
		const { network } = this.props;

		if (!network) {
			return null;
		}

		const name = network.get('name');

		return networks.map((n, i) => {
			const accounts = this.getAccounts(n);

			return (
				<MenuItem
					onClick={() => this.onChangeNetwork(n.name)}
					key={n.name}
					eventKey={i + eventKey}
					active={n.name === name}
				>
					{custom && <Button className="btn-round-close" onClick={(e) => this.onDeleteNetwork(e, n.name)} />}
					<span className="title">{n.name}</span>
					<ul className="accounts">
						{(accounts && accounts.length) ? accounts : 'No accounts'}
					</ul>
				</MenuItem>
			);
		});
	}

	closeDropDown() {
		this.setState({ opened: false });
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
	accounts: PropTypes.object.isRequired,
	account: PropTypes.object,
	changeNetwork: PropTypes.func.isRequired,
	deleteNetwork: PropTypes.func.isRequired,
	setGlobalLoad: PropTypes.func.isRequired,
	switchAccountNetwork: PropTypes.func.isRequired,
	switchAccount: PropTypes.func.isRequired,
	tryToConnect: PropTypes.func.isRequired,
	history: PropTypes.object.isRequired,
	connected: PropTypes.bool,
};

NetworkDropdown.defaultProps = {
	connected: false,
	account: null,
};

export default withRouter(connect(
	(state) => ({
		network: state.global.get('network'),
		networks: state.global.get('networks'),
		connected: state.global.get('connected'),
		accounts: state.global.get('accounts'),
		account: state.global.get('account'),
	}),
	(dispatch) => ({
		changeNetwork: (network) => dispatch(changeNetwork(network)),
		deleteNetwork: (network) => dispatch(deleteNetwork(network)),
		setGlobalLoad: () => dispatch(GlobalReducer.actions.set({ field: 'loading', value: true })),
		switchAccountNetwork: (name, network) => dispatch(switchAccountNetwork(name, network)),
		switchAccount: (name) => dispatch(switchAccount(name)),
		tryToConnect: (isRecreate) => dispatch(globalInit(isRecreate)),
	}),
)(NetworkDropdown));

