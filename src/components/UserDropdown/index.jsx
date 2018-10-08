import React from 'react';
import { Dropdown, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import { initAccount, removeAccount } from '../../actions/GlobalActions';

import FormatHelper from '../../helpers/FormatHelper';

import { IMPORT_ACCOUNT_PATH, INDEX_PATH } from '../../constants/RouterConstants';

import UserIcon from '../UserIcon';

class UserDropdown extends React.PureComponent {

	onDropdownChange(e, name) {
		const handledKey = e.key || e.type;
		const { activeUser, networkName } = this.props;

		if (['click', 'Enter'].includes(handledKey)) {
			if (activeUser.name === name) {
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
					<div className={classnames('user-balance', { positive: !!amount })}>{FormatHelper.formatAmount(amount, precision, symbol) || '0 ECHO'}</div>
					<Button className="btn-logout" onClick={(e) => this.onRemoveAccount(e, name)} />
				</div>
			);

			return ({
				value: name,
				key: name,
				className: 'user-item',
				content,
				selected: activeUser.name === name,
			});
		});
	}

	render() {
		const { activeUser } = this.props;

		const optionsEnd = [
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
						<Link to={INDEX_PATH}>create</Link>
					</React.Fragment>
				),
			},
			{
				value: 'import',
				key: 'import-account',
				className: 'user-import',
				content: (
					<React.Fragment>
						<Link to={IMPORT_ACCOUNT_PATH}>import
						</Link>
					</React.Fragment>
				),
			},
		];

		return (
			<Dropdown
				className="dropdown-user"
				trigger={
					<div className="dropdown-trigger">
						<UserIcon color="green" avatar={`ava${activeUser.icon}`} />

						<i aria-hidden="true" className="dropdown icon" />
					</div>
				}
				onChange={(e, { value }) => this.onDropdownChange(e, value)}
				options={this.renderList().concat(optionsEnd)}
				selectOnBlur={false}
				icon={false}
			/>
		);
	}

}

UserDropdown.propTypes = {
	activeUser: PropTypes.object.isRequired,
	networkName: PropTypes.string.isRequired,
	preview: PropTypes.array.isRequired,
	initAccount: PropTypes.func.isRequired,
	removeAccount: PropTypes.func.isRequired,
};

export default withRouter(connect(
	(state) => ({
		preview: state.balance.get('preview').toJS(),
		activeUser: state.global.get('activeUser'),
		networkName: state.global.getIn(['network', 'name']),
	}),
	(dispatch) => ({
		initAccount: (name, network) => dispatch(initAccount(name, network)),
		removeAccount: (name, network) => dispatch(removeAccount(name, network)),
	}),
)(UserDropdown));
