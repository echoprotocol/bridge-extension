import React from 'react';
import UserIcon from '../../components/UserIcon';

class SettingsAccount extends React.Component {

	render() {
		return (
			<React.Fragment>

				<div className="settings-wrap">
					<UserIcon color="green" big animationChange avatar="ava1" />
					<div className="page-wrap" >
						<div className="page" >3</div>
						<div className="page-action-wrap">3</div>
					</div>
				</div>
			</React.Fragment>


		);

	}

}

export default SettingsAccount;
