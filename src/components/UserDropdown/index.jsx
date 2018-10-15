import React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import CustomScroll from 'react-custom-scroll';

import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { withRouter } from 'react-router';

import { initAccount, removeAccount } from '../../actions/GlobalActions';

import FormatHelper from '../../helpers/FormatHelper';

import { IMPORT_ACCOUNT_PATH, CREATE_ACCOUNT_PATH } from '../../constants/RouterConstants';
import { ECHO } from '../../constants/GlobalConstants';

import UserIcon from '../UserIcon';

class UserDropdown extends React.PureComponent {

	constructor(props) {
		super(props);

		this.state = {
			menuHeight: null,
		};
	}


	componentDidUpdate() {
		this.setDDMenuHeight();
	}

	onSelect(name) {
		if (!this.props.preview.find((i) => i.name === name)) {
			return;
		}
		const { activeUser, networkName } = this.props;

		if (activeUser.get('name') === name) {
			return;
		}

		this.props.initAccount(name, networkName);
	}

	onRemoveAccount(e, name) {
		e.stopPropagation();

		const { networkName } = this.props;

		this.props.removeAccount(name, networkName);
	}

	// Устанавливает высоту react-custom-scroll
	// Не апдейдится высота, при удалении и добавлении юзера
	setDDMenuHeight() {
		const elm = document.querySelector('#user-menu');
		return elm.getBoundingClientRect().height > 350 ?
			this.setState({ menuHeight: 350 }) :
			this.setState({ menuHeight: elm.getBoundingClientRect().height });
	}

	renderList(preview, activeUser) {

		return preview.map(({
			name, balance: { amount, precision, symbol }, icon,
		}, i) => {
			const content = (
				<MenuItem
					active={activeUser.get('name') === name}
					key={name}
					eventKey={i}
					onSelect={() => this.onSelect(name)}

				>
					<UserIcon color="green" avatar={`ava${icon}`} />
					<div className="user-name">{name}</div>
					<div className={classnames('user-balance', { positive: !!amount })}>
						{FormatHelper.formatAmount(amount, precision, symbol) || `0 ${ECHO}`}
					</div>
					<Button className="btn-logout" onClick={(e) => this.onRemoveAccount(e, name)} />
				</MenuItem>
			);

			return content;
		});
	}

	render() {
		const { preview, activeUser } = this.props;
		console.log(this.state.menuHeight);
		const menuHeight = {
			height: `${this.state.menuHeight}px`,
		};

		return (
			<Dropdown
				className="dropdown-user"
				id="dropdown-user"
			>
				<Dropdown.Toggle noCaret>
					<UserIcon color="green" avatar={`ava${activeUser.get('icon')}`} />
					<i aria-hidden="true" className="dropdown icon" />
				</Dropdown.Toggle>
				<Dropdown.Menu >
					<div
						className="user-scroll"
						id="user-menu"
						style={menuHeight}
					>
						<CustomScroll
							flex="1"
							heightRelativeToParent="calc(100%)"
						>
							<ul className="user-list">
								{this.renderList(preview, activeUser)}
							</ul>
							<div className="dropdown-footer">
								<span>Add account: </span>
								{/* Не закрывается дропдаун, при переходе по ссылке */}
								<MenuItem
									href={`#${CREATE_ACCOUNT_PATH}`}
									eventKey={preview.size + 1}
								>
									create
								</MenuItem>
								<span>or </span>
								{/* Не закрывается дропдаун, при переходе по ссылке */}
								<MenuItem
									href={`#${IMPORT_ACCOUNT_PATH}`}
									eventKey={preview.size + 2}
								>
									import
								</MenuItem>
							</div>
						</CustomScroll>
					</div>
				</Dropdown.Menu>
			</Dropdown>
		);
	}

}

UserDropdown.propTypes = {
	activeUser: PropTypes.object.isRequired,
	networkName: PropTypes.string.isRequired,
	preview: PropTypes.object.isRequired,
	initAccount: PropTypes.func.isRequired,
	removeAccount: PropTypes.func.isRequired,
};

export default withRouter(connect(
	(state) => ({
		preview: state.balance.get('preview'),
		activeUser: state.global.get('activeUser'),
		networkName: state.global.getIn(['network', 'name']),
	}),
	(dispatch) => ({
		initAccount: (name, network) => dispatch(initAccount(name, network)),
		removeAccount: (name, network) => dispatch(removeAccount(name, network)),
	}),
)(UserDropdown));
