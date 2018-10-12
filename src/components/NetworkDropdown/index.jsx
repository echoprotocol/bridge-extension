import React from 'react';
import { Dropdown, Button } from 'semantic-ui-react';
import classnames from 'classnames';
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
				value: 'add-net',
				key: 'add-net',
				className: 'add-network',
				as: 'button',
				content: '+ Add Network',
			},
			{
				value: 'fake-element',
				key: 'fake-element',
				as: 'span',
				disabled: true,
				content:
	<React.Fragment>
		<div className="network-body" />
		<div className="network-footer" />
	</React.Fragment>,
			},
		];

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

				{ !this.state.opened ? <NetworkInfo /> : <NetworkInfo netAir={netInfoAir} />}

			</React.Fragment>

		);
	}

}

export default NetworkDropdown;

