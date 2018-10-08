import React from 'react';
import { connect } from 'react-redux';
import { Dropdown, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';

import { changeNetwork, deleteNetwork } from '../../actions/GlobalActions';

import { NETWORKS } from '../../constants/GlobalConstants';

import NetworkInfo from './NetworkInfo';
import UserIcon from '../UserIcon';

class NetworkDropdown extends React.PureComponent {

	constructor(props) {
		super(props);

		this.state = {
			opened: false,
		};
	}

	onDropdownChange(e, value) {
		if ((e.type !== 'click' && e.keyCode !== 13) || e.target.id === 'btn-dlt') {
			return;
		}

		if (value === 'custom') {
			// this.props.history.push(NETWORKS_PATH);
		} else {
			this.onChangeNetwork(value);
		}
	}

	onDeleteNetwork(network, e) {
		e.preventDefault();

		this.props.deleteNetwork(network);
	}

	onChangeNetwork(name) {
		const { networks, network: oldNetwork } = this.props;

		if (name === oldNetwork.name || name === 'custom') {
			return;
		}

		const network = NETWORKS.concat(networks).find((i) => i.name === name);

		this.props.changeNetwork(network);
	}

	getList() {
		const { name } = this.props.network;
		const options = NETWORKS.map((n) => ({
			value: 'net0',
			key: 'net0',
			as: 'section',
			className: 'network-item',
			content: (
				<div className="network-item-wrap">
					<div className="network-content">
						<div className="network-title">{n.name}</div>
						<ul className="accounts">
							<li>No accounts</li>
						</ul>
					</div>
				</div>
			),
		}));

		options.concat(this.props.networks.map((n) => ({
			value: 'custom-net0',
			key: 'custom-net0',
			className: 'network-item',
			content: (
				<React.Fragment>
					<div className="network-item-bg" />
					<div className="network-item-wrap">
						<div className="network-content">
							<Button className="btn-round-close" onClick={(e) => this.onDeleteNetwork(n.name, e)} />
							<div className="network-title">
								{n.name}
							</div>

						</div>
					</div>
				</React.Fragment>
			),
		})));


		return options;
	}

	onOpen() {
		this.setState({ opened: true });
	}

	onClose() {
		this.setState({ opened: false });
	}

	render() {
		const options = [
			// DEFAULT  NEWORKS:
			{
				value: 'net0',
				key: 'net0',
				as: 'section',
				className: 'network-item',
				content:

	<div className="network-item-wrap">
		<div className="network-content">

			<div className="network-title">Main Network</div>
			<ul className="accounts">
				<li>No accounts</li>
			</ul>
		</div>
	</div>,

			},
			{
				value: 'net1',
				key: 'net1',
				as: 'section',
				className: 'network-item',
				content:

	<div className="network-item-wrap">
		<div className="network-content">
			<div className="network-title">Test Network</div>
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
	</div>,

			},
			{
				value: 'net2',
				key: 'net2',
				as: 'section',
				className: 'network-item',
				content:

	<div className="network-item-wrap">
		<div className="network-content">
			<div className="network-title">Dev Network</div>
			<ul className="accounts">
				<li>
					<UserIcon color="pink" avatar="ava8" />
				</li>
			</ul>
		</div>
	</div>,

			},

			// CUSTOM  NEWORKS:
			// У кастомных стей у объектов нет свойств: as: 'span'


			{
				value: 'custom-net0',
				key: 'custom-net0',
				className: 'network-item',
				content:
	<React.Fragment>
		<div className="network-item-bg" />
		<div className="network-item-wrap">
			<div className="network-content">
				<Button className="btn-round-close" />
				<div className="network-title">
                Whitepowernet
				</div>

			</div>
		</div>
	</React.Fragment>,

			},
			{
				value: 'custom-net1',
				key: 'custom-net1',
				className: 'network-item',
				content:
	<React.Fragment>
		<div className="network-item-bg" />
		<div className="network-item-hover" />
		<div className="network-item-wrap">
			<div className="network-content">
				<Button className="btn-round-close" />
				<div className="network-title">Hellelujahnet</div>
			</div>
		</div>
	</React.Fragment>,

			},
			{
				value: 'custom-net2',
				key: 'custom-net2',
				className: 'network-item',
				content:
	<React.Fragment>
		<div className="network-item-bg" />
		<div className="network-item-hover" />
		<div className="network-item-wrap">
			<div className="network-content">
				<Button className="btn-round-close" />
				<div className="network-title">Homersimpsonnet</div>
			</div>
		</div>
	</React.Fragment>,

			},
			{
				value: 'custom-net3',
				key: 'custom-net3',
				className: 'network-item',
				content:
	<React.Fragment>
		<div className="network-item-bg" />
		<div className="network-item-wrap">
			<div className="network-content">
				<Button className="btn-round-close" />
				<div className="network-title">Mytestnet</div>
			</div>
		</div>
	</React.Fragment>,

			},

			{
				value: 'fake-element',
				key: 'fake-element',
				as: 'span',
				disabled: true,
				content:
	<React.Fragment>
		<div className="network-body" />
	</React.Fragment>,
			},
			{
				value: 'add-net',
				key: 'add-net',
				className: 'last-element',
				as: 'a',
				content: '+ Add Network',
			},
			{
				value: 'network-info',
				key: 'network-info',
				className: 'network-info',
				disabled: true,
				as: 'span',
				content: <NetworkInfo />,
			},
		];

		return (
			<React.Fragment>
				<Dropdown
					className="dropdown-network"
					onOpen={() => this.onOpen()}
					onClose={() => this.onClose()}
					trigger={
						<div className="dropdown-trigger">
							<div className="current-network">
								<span className="cut">{this.state.height}Main Network</span>
							</div>
							<i aria-hidden="true" className="dropdown icon" />
						</div>
					}
					onChange={(e, { value }) => this.onDropdownChange(e, value)}
					options={options}
					selectOnBlur={false}
					icon={false}
				/>

				{ !this.state.opened ? <NetworkInfo /> : null}

			</React.Fragment>

		);
	}

}

NetworkDropdown.propTypes = {
	// loading: PropTypes.bool,
	network: PropTypes.object.isRequired,
	networks: PropTypes.array.isRequired,
	changeNetwork: PropTypes.func.isRequired,
	deleteNetwork: PropTypes.func.isRequired,
	// disconnected: PropTypes.bool,
};

NetworkDropdown.defaultProps = {
	// disconnected: false,
	// loading: false,
};

export default connect(
	(state) => ({
		network: state.global.get('network').toJS(),
		networks: state.global.get('networks').toJS(),
		// loading: state.form.getIn([FORM_SIGN_UP, 'loading']),
	}),
	(dispatch) => ({
		changeNetwork: (network) => dispatch(changeNetwork(network)),
		deleteNetwork: (network) => dispatch(deleteNetwork(network)),
	}),
)(NetworkDropdown);

