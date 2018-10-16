import React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import CustomScroll from 'react-custom-scroll';

import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { withRouter } from 'react-router';

import { initAccount, removeAccount } from '../../actions/GlobalActions';
import { resetAssets } from '../../actions/BalanceActions';

import FormatHelper from '../../helpers/FormatHelper';

import { IMPORT_ACCOUNT_PATH, CREATE_ACCOUNT_PATH } from '../../constants/RouterConstants';
import { ECHO } from '../../constants/GlobalConstants';

import UserIcon from '../UserIcon';

class UserDropdown extends React.PureComponent {

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

	onSelect(name) {
		if (!this.props.preview.find((i) => i.accountName === name)) {
			return;
		}
		const { activeUser, networkName } = this.props;

		if (activeUser.get('name') === name) {
			return;
		}

		this.props.resetAssets();
		this.props.initAccount(name, networkName);
	}

	onRemoveAccount(e, name) {
		e.stopPropagation();

		const { networkName } = this.props;

		this.props.removeAccount(name, networkName);
	}

	setDDMenuHeight() {

		const MAX_MENU_HEIGHT = 300;
		const el = document.getElementById('user-menu-container');

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

	toggleDropdown() {
		this.setState({ opened: !this.state.opened });
	}

	closeDropDown() {
		this.setState({ opened: false });
	}

	renderList(preview, activeUser) {

		return preview.map((account, i) => {
			const content = (
				<MenuItem
					active={activeUser.get('name') === account.accountName}
					tabIndex="-1"
					key={account.accountName}
					eventKey={i}
					onClick={() => this.closeDropDown()}
					onSelect={() => this.onSelect(account.accountName)}
				>
					<UserIcon color="green" avatar={`ava${account.icon}`} />
					<div className="user-name">{account.accountName}</div>
					<div className={classnames('user-balance', { positive: !!account.balance })}>
						{FormatHelper.formatAmount(account.balance, account.precision, account.symbol) || `0 ${ECHO}`}
					</div>
					<Button className="btn-logout" onClick={(e) => this.onRemoveAccount(e, account.accountName)} />
				</MenuItem>
			);

			return content;
		});
	}

	render() {
		const { preview, activeUser } = this.props;
		const menuHeight = {
			height: `${this.state.menuHeight}px`,
		};

		return (
			<Dropdown
				className="dropdown-user"
				id="dropdown-user"
				onToggle={() => this.toggleDropdown()}
				open={this.state.opened}
			>
				<Dropdown.Toggle noCaret>
					<UserIcon color="green" avatar={`ava${activeUser.get('icon')}`} />
					<i aria-hidden="true" className="dropdown icon" />
				</Dropdown.Toggle>
				<Dropdown.Menu >
					<div
						className="user-scroll"
						style={menuHeight}
					>
						<CustomScroll
							flex="1"
							heightRelativeToParent="calc(100%)"
						>
							<div id="user-menu-container">
								<ul className="user-list">
									{this.renderList(preview, activeUser)}
								</ul>

							</div>

						</CustomScroll>
					</div>
					<div className="dropdown-footer">
						<span>Add account: </span>
						<MenuItem
							onClick={() => this.closeDropDown()}
							href={`#${CREATE_ACCOUNT_PATH}`}
							eventKey={preview.size + 1}
						>
										create
						</MenuItem>
						<span>or </span>
						<MenuItem
							onClick={() => this.closeDropDown()}
							href={`#${IMPORT_ACCOUNT_PATH}`}
							eventKey={preview.size + 2}
						>
										import
						</MenuItem>
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
	resetAssets: PropTypes.func.isRequired,
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
		resetAssets: () => dispatch(resetAssets()),
	}),
)(UserDropdown));
