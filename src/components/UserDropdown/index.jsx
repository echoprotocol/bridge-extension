import React from 'react';
import { Dropdown, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import FormatHelper from '../../helpers/FormatHelper';
import { initAccount, removeAccount } from '../../actions/GlobalActions';
import { IMPORT_ACCOUNT_PATH, INDEX_PATH } from '../../constants/RouterConstants';

class UserDropdown extends React.PureComponent {

	onDropdownChange(e, name) {
		const handledKey = e.key || e.type;
		const { accountName, networkName } = this.props;

		if (['click', 'Enter'].includes(handledKey)) {
			if (accountName === name) {
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
		const { preview, accountName } = this.props;

		return preview.map(({
			name, balance: { amount, precision, symbol },
		}) => {
			const content = (
				<div key={name} className="user-item-wrap">
					<div className="user-icon-wrap" />
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
				selected: accountName === name,
			});
		});
	}

	render() {
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
						<span className="user-icon-wrap" />
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
	accountName: PropTypes.string.isRequired,
	networkName: PropTypes.string.isRequired,
	preview: PropTypes.array.isRequired,
	initAccount: PropTypes.func.isRequired,
	removeAccount: PropTypes.func.isRequired,
};

export default withRouter(connect(
	(state) => ({
		preview: state.balance.get('preview').toJS(),
		accountName: state.global.getIn(['activeUser', 'name']),
		networkName: state.global.getIn(['network', 'name']),
	}),
	(dispatch) => ({
		initAccount: (name, network) => dispatch(initAccount(name, network)),
		removeAccount: (name, network) => dispatch(removeAccount(name, network)),
	}),
)(UserDropdown));

