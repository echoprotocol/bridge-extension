import React from 'react';
import { Dropdown } from 'semantic-ui-react';

class NetworkDropdown extends React.PureComponent {

	onDropdownChange(e, value) {
		console.log(e, value);
	}

	render() {
		const options = [
			{
				value: 'User0',
				key: 'user0',
				className: 'user-item',
				content:

	<div className="network-item-wrap">
		<div className="network-name">Homersimpson</div>
	</div>,

			},
			{
				value: 'User1',
				key: 'user1',
				className: 'user-item',
				content:

	<div className="network-item-wrap">
		<div className="network-name">Homersimpson</div>
	</div>,

			},
			{
				value: 'User2',
				key: 'user2',
				className: 'user-item',
				content:

	<div className="network-item-wrap">
		<div className="network-name">Homersimpson</div>
	</div>,

			},
			{
				value: 'fake-element',
				key: 'fake-element',
				disabled: true,
				content:
	<React.Fragment>
		<div className="network-body" />
	</React.Fragment>,
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

