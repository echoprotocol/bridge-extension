import React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import CustomScroll from 'react-custom-scroll';

import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { withRouter } from 'react-router';

import { switchAccount } from '../../actions/GlobalActions';
import { openModal } from '../../actions/ModalActions';

import FormatHelper from '../../helpers/FormatHelper';

import { MODAL_LOGOUT } from '../../constants/ModalConstants';
import { IMPORT_ACCOUNT_PATH, CREATE_ACCOUNT_PATH } from '../../constants/RouterConstants';
import { CORE_ID, CORE_SYMBOL } from '../../constants/GlobalConstants';

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

	componentWillReceiveProps(nextProps) {

		if (!nextProps.account) {
			this.setState({
				opened: false,
			});
		}
	}

	componentDidUpdate() {
		this.setDDMenuHeight();
	}

	onSelect(name) {
		const { account } = this.props;

		if (!account) {
			return false;
		}

		if (account.get('name') === name) {
			return false;
		}

		this.props.switchAccount(name);

		return true;
	}

	onOpenLogout() {
		this.props.openModal();
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

	renderList() {

		const {
			balances, assets, accounts, account: activeAccount, networkName,
		} = this.props;
		const asset = assets.get(CORE_ID);
		const accountsNetwork = accounts.get(networkName);

		if (!activeAccount || !asset || !accountsNetwork) {
			return null;
		}

		return accountsNetwork.map((account, i) => {

			const userBalance = balances.find((value) => ((value.get('owner') === account.id) && (value.get('asset_type') === CORE_ID)));

			if (!userBalance) {
				return null;
			}

			return (
				<MenuItem
					active={activeAccount.get('name') === account.name}
					tabIndex="-1"
					key={account.name}
					eventKey={i}
					onClick={() => this.closeDropDown()}
					onSelect={() => this.onSelect(account.name)}
				>

					<UserIcon
						color={account.iconColor}
						tabSelect
						avatar={`ava${account.icon}`}
					/>
					<div className="user-name">{account.name}</div>
					<div className={classnames('user-balance', { positive: !!userBalance.get('balance') })}>
						{FormatHelper.formatAmount(userBalance.get('balance'), asset.get('precision'), asset.get('symbol')) || `0 ${CORE_SYMBOL}`}

					</div>
					<Button className="btn-logout" onClick={(e) => this.onOpenLogout(e)} />
				</MenuItem>
			);

		});
	}

	render() {
		const { account, accounts } = this.props;

		if (!account) {
			return null;
		}

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

					<UserIcon
						color={account.get('iconColor')}
						avatar={`ava${account.get('icon')}`}
					/>

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
									{this.renderList()}
								</ul>

							</div>

						</CustomScroll>
					</div>
					<div className="dropdown-footer">
						<span>Add account: </span>
						<MenuItem
							onClick={() => this.closeDropDown()}
							href={`#${CREATE_ACCOUNT_PATH}`}
							eventKey={accounts.size + 1}
						>
                            create
						</MenuItem>
						<span>or </span>
						<MenuItem
							onClick={() => this.closeDropDown()}
							href={`#${IMPORT_ACCOUNT_PATH}`}
							eventKey={accounts.size + 2}
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
	accounts: PropTypes.object.isRequired,
	balances: PropTypes.object.isRequired,
	assets: PropTypes.object.isRequired,
	account: PropTypes.object,
	networkName: PropTypes.string.isRequired,
	switchAccount: PropTypes.func.isRequired,
	openModal: PropTypes.func.isRequired,
};

UserDropdown.defaultProps = {
	account: null,
};

export default withRouter(connect(
	(state) => ({
		balances: state.balance.get('balances'),
		assets: state.balance.get('assets'),
		account: state.global.get('account'),
		accounts: state.global.get('accounts'),
		networkName: state.global.getIn(['network', 'name']),
	}),
	(dispatch) => ({
		openModal: () => dispatch(openModal(MODAL_LOGOUT)),
		switchAccount: (name) => dispatch(switchAccount(name)),
	}),
)(UserDropdown));
