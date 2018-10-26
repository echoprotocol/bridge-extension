import React from 'react';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { changeAccountIcon } from '../../actions/GlobalActions';

import UserIcon from '../../components/UserIcon';

import { ACCOUNT_COLORS } from '../../constants/GlobalConstants';

class SettingsAccount extends React.Component {

	constructor(props) {
		super(props);

		let accountIcon = 0;
		let accountColor = '';

		if (props.account) {
			accountIcon = props.account.get('icon');
			accountColor = props.account.get('iconColor');
		}

		this.state = {
			icon: accountIcon,
			iconColor: accountColor,
		};
	}

	onChangeIcon(value) {
		const { icon } = this.state;

		if (icon === value) {
			return;
		}

		this.setState({ icon: value });
	}

	onChangeColor(value) {
		const { iconColor } = this.state;

		if (iconColor === value) {
			return;
		}

		this.setState({ iconColor: value });
	}

	onSaveIcon() {
		const { icon, iconColor } = this.state;

		this.props.changeAccountIcon(icon, iconColor);
	}

	render() {
		if (!this.state) {
			return null;
		}

		const { icon, iconColor } = this.state;

		return (
			<React.Fragment>

				<div className="settings-wrap">
					<UserIcon
						color={iconColor}
						size="big"
						animationBack
						avatar={`ava${icon}`}
						onChangeIcon={() => this.props.onBack()}
					/>
					<div className="page-wrap" >
						<div className="page">
							<ul className="list-avatars">

								{
									Array(15).fill(undefined).map((elm, i) => {
										const id = i;

										return (
											<li key={id} >
												<UserIcon
													select
													tabSelect
													active={i === (icon - 1)}
													color="transparent"
													avatar={`ava${i + 1}`}
													onChangeIcon={() => this.onChangeIcon(i + 1)}
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
	onBack: PropTypes.func.isRequired,
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
