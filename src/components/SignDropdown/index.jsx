import React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import CustomScroll from 'react-custom-scroll';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { withRouter } from 'react-router';
import { Map } from 'immutable';

import { CORE_ID, CORE_SYMBOL } from '../../constants/GlobalConstants';

import FormatHelper from '../../helpers/FormatHelper';
import UserIcon from '../UserIcon';

import GlobalReducer from '../../reducers/GlobalReducer';

class SignDropdown extends React.PureComponent {

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
		const { accounts, account } = this.props;

		if (!accounts.find((i) => i.name === name)) {
			return;
		}

		const accountToChange = accounts.find((value) => name === value.name);

		if (account.get('name') === accountToChange.name) { return; }

		this.props.set('signAccount', new Map(accountToChange));
	}

	setDDMenuHeight() {

		const MAX_MENU_HEIGHT = 300;
		const el = document.getElementById('user-menu-container');

		if (el) {
			const height = el.clientHeight;
			if (this.state.menuHeight !== height && this.state.menuHeight !== MAX_MENU_HEIGHT) {
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

	renderList(activeAccount) {
		const { balances, assets, accounts } = this.props;
		const asset = assets.get(CORE_ID);

		if (!asset) {
			return null;
		}

		return accounts.map((account, i) => {

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
						{
							FormatHelper.formatAmount(
								userBalance.get('balance'),
								asset.get('precision'),
								asset.get('symbol'),
							) || `0 ${CORE_SYMBOL}`
						}
					</div>
				</MenuItem>
			);

		});
	}

	render() {
		const {
			transaction, accounts, loading, account,
		} = this.props;

		if (!transaction || !accounts) { return null; }

		const menuHeight = {
			height: `${this.state.menuHeight}px`,
		};

		return (
			<Dropdown
				disabled={loading}
				className="dropdown-user"
				id="dropdown-user"
				onToggle={() => this.toggleDropdown()}
				open={this.state.opened}
			>
				<Dropdown.Toggle noCaret>
					{
						account.size ? (
							<React.Fragment>
								<UserIcon
									color={account.get('iconColor')}
									avatar={`ava${account.get('icon')}`}
								/>

								<i aria-hidden="true" className="dropdown icon" />
							</React.Fragment>
						) : null
					}

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
									{this.renderList(account)}
								</ul>

							</div>

						</CustomScroll>
					</div>
				</Dropdown.Menu>
			</Dropdown>
		);
	}

}

SignDropdown.propTypes = {
	loading: PropTypes.bool,
	transaction: PropTypes.object,
	accounts: PropTypes.object,
	account: PropTypes.object,
	balances: PropTypes.object.isRequired,
	assets: PropTypes.object.isRequired,
	set: PropTypes.func.isRequired,
};

SignDropdown.defaultProps = {
	loading: false,
	transaction: null,
	accounts: null,
	account: null,
};

export default withRouter(connect(
	(state) => ({
		loading: state.global.get('loading'),
		transaction: state.global.getIn(['sign', 'current']),
		balances: state.balance.get('balances'),
		assets: state.balance.get('assets'),
		accounts: state.global.getIn([
			'accounts',
			state.global.getIn(['network', 'name']),
		]),
		account: state.global.get('signAccount'),
	}),
	(dispatch) => ({
		set: (field, value) => dispatch(GlobalReducer.actions.set({ field, value })),
	}),
)(SignDropdown));
