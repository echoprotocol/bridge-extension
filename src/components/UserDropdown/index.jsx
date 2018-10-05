import React from 'react';
import { Dropdown, Button } from 'semantic-ui-react';

class UserDropdown extends React.PureComponent {

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

	<div className="user-item-wrap">
		<div className="user-icon-wrap" />
		<div className="user-name">Homersimpson</div>
		<div className="user-balance">0 ECHO</div>
		<Button className="btn-logout" />
	</div>,

			},
			{
				value: 'User1',
				key: 'user1',
				className: 'user-item',
				content:

	<div className="user-item-wrap">
		<div className="user-icon-wrap" />
		<div className="user-name">Jellyjade354</div>
		<div className="user-balance positive">134.345 ECHO</div>
		<Button className="btn-logout" />
	</div>,

			},
			{
				value: 'User2',
				key: 'user2',
				className: 'user-item',
				content:

	<div className="user-item-wrap">
		<div className="user-icon-wrap" />
		<div className="user-name">HenryHansen125</div>
		<div className="user-balance">0 ECHO</div>
		<Button className="btn-logout" />
	</div>,

			},

			// 1) ТУТ ЗАКАНЧИВАЕТСЯ .map С ЮЗЕРАМИ И КОНКАТИТСЯ С НИЖНИМИ OPTIONS
			// 2) Сейчас реализовано так, что при нажатию на стрелки (дропдаун меняет state),
			// поменять поведение, чтобы менялось при нажатии на пробел и на ентер
			// (Как в Echo Desctop функ-я onChange)

			{
				value: 'fake-element',
				key: 'fake-element',
				disabled: true,
				content:
	<React.Fragment>
		<div className="user-body" />
		<div className="user-footer-area" />
		<div className="create-sub">Add account:</div>
		<div className="import-sub">or</div>

		<div className="user-footer" />
	</React.Fragment>,
			},
			{
				value: 'create',
				key: 'create-account',
				className: ' user-create',
				content: (
					<React.Fragment>
						<a href="">create</a>
					</React.Fragment>
				),
			},
			{
				value: 'import',
				key: 'import-account',
				className: 'user-import',
				content: (
					<React.Fragment>
						{/* <span>or</span> */}
						<a href="">import</a>
					</React.Fragment>
				),
			},
		];

		return (
			<Dropdown
				className="dropdown-user"
				trigger={
					<div className="dropdown-trigger">
						<div className="user-icon-wrap">
							<i aria-hidden="true" className="icon-ava7" />

						</div>
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

export default UserDropdown;

