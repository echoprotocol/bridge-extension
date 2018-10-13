import React from 'react';
import { ButtonToolbar, Dropdown, MenuItem } from 'react-bootstrap';
import CustomScroll from 'react-custom-scroll';

import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

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


	componentDidMount() {
		this.setDDMenuHeight();
	}
	// Устанавливает высоту react-custom-scroll
	setDDMenuHeight() {
		const elm = document.querySelector('#user-menu');
		return elm.getBoundingClientRect().height > 350 ?
			this.setState({ menuHeight: 350 }) :
			this.setState({ menuHeight: elm.getBoundingClientRect().height });

	}
	onDropdownChange(e, name) {
		if (!this.props.preview.find((i) => i.name === name)) {
			return;
		}

		const handledKey = e.key || e.type;
		const { activeUser, networkName } = this.props;

		if (['click', 'Enter'].includes(handledKey)) {
			if (activeUser.get('name') === name) {
				return;
			}

			this.props.initAccount(name, networkName);
		}
	}

	onRemoveAccount(e, name) {
		e.stopPropagation();

		const { networkName } = this.props;

		this.props.removeAccount(name, networkName);
	}

	renderList() {
		const { preview, activeUser } = this.props;

		return preview.map(({
			name, balance: { amount, precision, symbol }, icon,
		}) => {
			const content = (
				<div key={name} className="user-item-wrap">
					<UserIcon color="green" avatar={`ava${icon}`} />
					<div className="user-name">{name}</div>
					<div className={classnames('user-balance', { positive: !!amount })}>
						{FormatHelper.formatAmount(amount, precision, symbol) || `0 ${ECHO}`}
					</div>
					<Button className="btn-logout" onClick={(e) => this.onRemoveAccount(e, name)} />
				</div>
			);

			return ({
				value: name,
				key: name,
				className: 'user-item',
				content,
				selected: activeUser.get('name') === name,
			});
		}).toArray();
	}

	render() {
		const { activeUser } = this.props;

		const menuHeight = {
			height: `${this.state.menuHeight}px`,
		};

		const optionsEnd = [

			{
				value: 'create',
				key: 'create-account',
				className: ' user-create',
				content: (
					<React.Fragment>
						<Link to={CREATE_ACCOUNT_PATH}>create</Link>
					</React.Fragment>
				),
			},
			{
				value: 'import',
				key: 'import-account',
				className: 'user-import',
				content: (
					<React.Fragment>
						<Link to={IMPORT_ACCOUNT_PATH}>import</Link>
					</React.Fragment>
				),
			},
			{
				value: 'fake-element',
				key: 'fake-element',
				disabled: true,
				content: (
					<React.Fragment>
						<div className="user-body" />
						<div className="user-footer" />
					</React.Fragment>
				),
			},
		];

		return (
			<Dropdown
				className="dropdown-user"
				id="dropdown-user"
				onChange={(e, { value }) => this.onDropdownChange(e, value)}
				options={this.renderList().concat(optionsEnd)}
			>
				<Dropdown.Toggle noCaret>
					<UserIcon color="green" avatar={`ava${activeUser.get('icon')}`} />
					<i aria-hidden="true" className="dropdown icon" />
				</Dropdown.Toggle>
				<Dropdown.Menu >
					<div
						className="network-scroll"
						id="user-menu"
						style={menuHeight}
					>
						<CustomScroll
							flex="1"
							heightRelativeToParent="calc(100%)"
						>
							<div className="dropdown-footer">
								<MenuItem eventKey="9">+ Add Networks</MenuItem>
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
