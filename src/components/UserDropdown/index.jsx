import React from 'react';
import { Dropdown, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import { switchAccount, removeAccount } from '../../actions/GlobalActions';

import FormatHelper from '../../helpers/FormatHelper';

import { IMPORT_ACCOUNT_PATH, CREATE_ACCOUNT_PATH } from '../../constants/RouterConstants';
import { ECHO } from '../../constants/GlobalConstants';

import UserIcon from '../UserIcon';

class UserDropdown extends React.PureComponent {

	onDropdownChange(e, name) {
		const account = this.props.preview.find((i) => i.name === name);

		if (!account) { return; }

		const handledKey = e.key || e.type;

		if (['click', 'Enter'].includes(handledKey)) {
			if (this.props.account.get('name') === name) { return; }

			this.props.switchAccount(name);
		}
	}

	onRemoveAccount(e, name) {
		e.stopPropagation();

		this.props.removeAccount(name);
	}

	renderList() {
		const { preview, account } = this.props;

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
				selected: account.get('name') === name,
			});
		}).toArray();
	}

	render() {
		const { account } = this.props;

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
				trigger={
					<div className="dropdown-trigger">
						<UserIcon color="green" avatar={`ava${account.get('icon')}`} />

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
	account: PropTypes.object.isRequired,
	preview: PropTypes.object.isRequired,
	switchAccount: PropTypes.func.isRequired,
	removeAccount: PropTypes.func.isRequired,
};

export default withRouter(connect(
	(state) => ({
		preview: state.balance.get('preview'),
		account: state.global.get('account'),
	}),
	(dispatch) => ({
		switchAccount: (name) => dispatch(switchAccount(name)),
		removeAccount: (name) => dispatch(removeAccount(name)),
	}),
)(UserDropdown));
