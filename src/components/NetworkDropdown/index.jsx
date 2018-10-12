import React from 'react';
import { connect } from 'react-redux';
import { Dropdown, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import classnames from 'classnames';

import { changeNetwork, deleteNetwork } from '../../actions/GlobalActions';

import { NETWORKS } from '../../constants/GlobalConstants';
import { ADD_NETWORK_PATH } from '../../constants/RouterConstants';

import NetworkInfo from './NetworkInfo';
import UserIcon from '../UserIcon';

class NetworkDropdown extends React.PureComponent {

	constructor(props) {
		super(props);

		this.state = {
			opened: false,
			hover: false,
		};
	}

	onDropdownChange(_, value) {
		switch (value) {
			case 'current_net':
				break;

			case 'add-net':
				this.props.history.push(ADD_NETWORK_PATH);
				break;

			default:
				this.onChangeNetwork(value);
		}
	}

	onDeleteNetwork(e, name) {
		e.stopPropagation();
		const { networks } = this.props;

		const network = NETWORKS.concat(networks.toJS()).find((i) => i.name === name);
		this.props.deleteNetwork(network);
	}

	onChangeNetwork(name) {
		const { networks } = this.props;

		const network = NETWORKS.concat(networks.toJS()).find((i) => i.name === name);
		this.props.changeNetwork(network);
	}

	onOpen() {
		this.setState({ opened: true });
	}

	onClose() {
		this.setState({ opened: false });
	}

	onToggleHoverClose() {
		this.setState({ hover: !this.state.hover });
	}

	getList() {
		const { network } = this.props;

		const name = network.get('name');

		const options = NETWORKS.map((n) => ({
			value: n.name === name ? 'current_net' : n.name,
			key: n.name,
			as: 'section',
			className: classnames('network-item', { active: n.name === name }),
			content: (
				<div className="network-item-wrap">
					<div className="network-content">
						<div className="network-title">{n.name}</div>
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
					</div>
				</div>
			),
		}));

		options.push(...this.props.networks.toJS().map((n) => ({
			value: n.name === name ? 'current_net' : n.name,
			key: n.name,
			className: classnames('network-item', { active: n.name === name }),
			content: (
				<React.Fragment>
					<div className="network-item-bg" />
					<div className="network-item-wrap">
						<div className="network-content">
							<Button className="btn-round-close" onClick={(e) => this.onDeleteNetwork(e, n.name)} />
							<div className="network-title">
								{n.name}
							</div>
							<ul className="accounts">
								<li>No accounts</li>
							</ul>
						</div>
					</div>
				</React.Fragment>
			),
		})));

		options.push({
			value: 'add-net',
			key: 'add-net',
			as: 'button',
			className: 'add-network',
			content: '+ Add Network',
		});
		options.push({
			value: 'fake-element',
			key: 'fake-element',
			as: 'span',
			disabled: true,
			content: (
				<React.Fragment>
					<div className="network-body" />
					<div className="network-footer" />
				</React.Fragment>
			),
		});

		return options;
	}

	netInfoAir(options) {

		const fixedElementsCount = 2;
		const edgeElementsCount = 6;
		const elementSize = 37;
		const longOffset = 115;
		const smallOffset = 110;
		return (
			(options.length - fixedElementsCount) * elementSize
		) + (options.length === edgeElementsCount ? longOffset : smallOffset);
	}

	render() {
		const { network } = this.props;
		const name = network.get('name');
		const options = this.getList();
		const netInfoAir = this.netInfoAir(options);
		return (
			<React.Fragment>
				<Dropdown

					className={classnames('dropdown-network', { 'hover-trigger': this.state.hover })}
					onOpen={() => this.onOpen()}
					onClose={() => this.onClose()}
					trigger={
						<div
							className="dropdown-trigger"
							onMouseEnter={() => this.onToggleHoverClose()}
							onMouseLeave={() => this.onToggleHoverClose()}
						>
							<div className={classnames('current-network', { connected: true })}>
								<span className="cut">{this.state.height}{name}</span>
							</div>
							<i aria-hidden="true" className="dropdown icon" />
						</div>
					}
					onChange={(e, { value }) => this.onDropdownChange(e, value)}
					options={options}
					selectOnBlur={false}
					icon={false}
				/>

				{ !this.state.opened ? <NetworkInfo /> : <NetworkInfo netAir={netInfoAir} />}

			</React.Fragment>

		);
	}

}

NetworkDropdown.propTypes = {
	network: PropTypes.object.isRequired,
	networks: PropTypes.object.isRequired,
	changeNetwork: PropTypes.func.isRequired,
	deleteNetwork: PropTypes.func.isRequired,
	history: PropTypes.object.isRequired,
};

export default withRouter(connect(
	(state) => ({
		network: state.global.get('network'),
		networks: state.global.get('networks'),
	}),
	(dispatch) => ({
		changeNetwork: (network) => dispatch(changeNetwork(network)),
		deleteNetwork: (network) => dispatch(deleteNetwork(network)),
	}),
)(NetworkDropdown));

