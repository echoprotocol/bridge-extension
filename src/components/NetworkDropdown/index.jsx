import React from 'react';
import { connect } from 'react-redux';
import { Dropdown, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { changeNetwork, deleteNetwork } from '../../actions/GlobalActions';

import { NETWORKS } from '../../constants/GlobalConstants';

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

	// onDropdownChange(e, value) {
	// 	if ((e.type !== 'click' && e.keyCode !== 13) || e.target.id === 'btn-dlt') {
	// 		return;
	// 	}
	//
	// 	if (value === 'custom') {
	// 		// this.props.history.push(NETWORKS_PATH);
	// 	} else {
	// 		this.onChangeNetwork(value);
	// 	}
	// }

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

	onOpen() {
		this.setState({ opened: true });
	}

	onClose() {
		this.setState({ opened: false });
	}

	onDropdownChange(e, value) {
		console.log(e, value);

	}

	onToggleHoverClose() {
		this.setState({ hover: !this.state.hover });
	}

	netInfoAir(options) {
		if (options.length === 6) {
			return ((options.length - 2) * 37) + 115;
		}
		return ((options.length - 2) * 37) + 110;
	}

	getList() {
		const { name } = this.props.network;

		const options = NETWORKS.map((n) => ({
			value: n.name,
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

		options.concat(this.props.networks.map((n) => ({
			value: n.name,
			key: n.name,
			className: classnames('network-item', { active: n.name === name }),
			content: (
				<React.Fragment>
					<div className="network-item-bg" />
					<div className="network-item-wrap">
						<div className="network-content">
							<Button className="btn-round-close" onClick={(e) => this.onDeleteNetwork(n.name, e)} />
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
			className: 'add-network',
			as: 'button',
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

	render() {

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
								<span className="cut">{this.state.height}Main Network</span>
							</div>
							<i aria-hidden="true" className="dropdown icon" />
						</div>
					}
					onChange={(e, { value }) => this.onDropdownChange(e, value)}
					options={this.getList()}
					selectOnBlur={false}
					icon={false}
				/>

				{ !this.state.opened ? <NetworkInfo /> : <NetworkInfo />}

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

