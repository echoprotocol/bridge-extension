import React from 'react';
import { Dropdown } from 'semantic-ui-react';

class NetworkDropdown extends React.PureComponent {

	onDropdownChange(e, value) {
		console.log(e, value);
	}

	render() {
		const options = [
			// DEFAULT  NEWORKS:
			{
				value: 'net0',
				key: 'net0',
				as: 'span',
				className: 'network-item',
				content:

	<div className="network-item-wrap">
		<div className="network-title">Main Network</div>
	</div>,

			},
			{
				value: 'net1',
				key: 'net1',
				as: 'span',
				className: 'network-item',
				content:

	<div className="network-item-wrap">
		<div className="network-title">Test Network</div>
	</div>,

			},
			{
				value: 'net2',
				key: 'net2',
				as: 'span',
				className: 'network-item',
				content:

	<div className="network-item-wrap">
		<div className="network-title">Dev Network</div>
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
			<div className="network-title">Whitepowernet</div>
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
			<div className="network-title">Hellelujahnet</div>
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
			<div className="network-title">Homersimpsonnet</div>
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
			<div className="network-title">Mytestnet</div>
		</div>
	</React.Fragment>,

			},

			{
				value: 'fake-element',
				key: 'fake-element',
				as: 'section',
				disabled: true,
				content:
	<React.Fragment>
		<div className="network-body" />
	</React.Fragment>,
			},
			{
				value: 'add-net',
				key: 'add-net',
				as: 'a',
				content: '+ Add Network',
			},
		];

		return (
			<Dropdown
				className="dropdown-network"
				open
				trigger={
					<div className="dropdown-trigger">
						<span className="user-icon-wrap" />
						<i aria-hidden="true" className="dropdown icon" />
					</div>
				}

				onChange={(e, { value }) => this.onDropdownChange(e, value)}
				options={options}
				selectOnBlur={false}
				icon={false}
			/>

		);
	}

}

export default NetworkDropdown;

