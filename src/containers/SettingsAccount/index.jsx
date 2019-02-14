import React from 'react';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { changeAccountIcon, storageRemoveDraft } from '../../actions/GlobalActions';

import UserIcon from '../../components/UserIcon';

import { ACCOUNT_COLORS, BASE_ICON, BASE_ICON_COLOR, ICONS_COUNT } from '../../constants/GlobalConstants';
import { WELCOME_PATH } from '../../constants/RouterConstants';

class SettingsAccount extends React.Component {


	constructor(props) {
		super(props);

		let accountIcon = BASE_ICON;
		let accountColor = BASE_ICON_COLOR;

		if (props.account) {
			accountIcon = props.account.get('icon');
			accountColor = props.account.get('iconColor');
		}

		this.state = {
			icon: accountIcon,
			iconColor: accountColor,
		};
	}
	componentWillUnmount() {

		storageRemoveDraft();

	}
	onBack() {
		this.props.history.push(WELCOME_PATH);
	}

	onChangeIcon(value) {
		const { icon } = this.state;

		if (icon === value) {
			return false;
		}

		this.setState({ icon: value });

		return true;
	}

	onChangeColor(value) {
		const { iconColor } = this.state;

		if (iconColor === value) {
			return false;
		}

		this.setState({ iconColor: value });

		return true;
	}

	async onSaveIcon() {
		const { icon, iconColor } = this.state;

		await this.props.changeAccountIcon(icon, iconColor);
		this.onBack();
	}

	render() {
		const { icon, iconColor } = this.state;

		return (
			<React.Fragment>

				<div className="settings-wrap">
					<UserIcon
						color={iconColor}
						size="big"
						animationBack
						avatar={`ava${icon}`}
						onClickIcon={() => this.onBack()}
					/>
					<div className="page-wrap" >
						<div className="page">
							<ul className="list-avatars">

								{
									Array(ICONS_COUNT).fill(undefined).map((elm, i) => {
										const id = i;

										return (
											<li key={id} >
												<UserIcon
													select
													tabSelect
													active={i === (icon - 1)}
													size="custom"
													color="transparent"
													avatar={`ava${i + 1}`}
													onClickIcon={() => this.onChangeIcon(i + 1)}
												/>
											</li>
										);
									})
								}
							</ul>
							<ul className="list-colors">
								{
									ACCOUNT_COLORS.map((elm, i) => {
										const id = i;

										return (
											<li key={id} >
												<Button
													active={elm === iconColor}
													tabIndex={elm === iconColor ? '-1' : '0'}
													className={`select-${elm}`}
													onClick={() => this.onChangeColor(elm)}
												/>
											</li>
										);
									})
								}
							</ul>
						</div>
						<div className="page-action-wrap">
							<div className="one-btn-wrap">
								<Button
									className="btn-in-light"
									onClick={() => this.onSaveIcon()}
									content={
										<span className="btn-text">Save and close</span>
									}
								/>
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>


		);

	}

}

SettingsAccount.propTypes = {
	account: PropTypes.object,
	changeAccountIcon: PropTypes.func.isRequired,
	history: PropTypes.object.isRequired,
};

SettingsAccount.defaultProps = {
	account: null,
};

export default connect(
	(state) => ({
		account: state.global.get('account'),
	}),
	(dispatch) => ({
		changeAccountIcon: (icon, color) => dispatch(changeAccountIcon(icon, color)),
	}),
)(SettingsAccount);
