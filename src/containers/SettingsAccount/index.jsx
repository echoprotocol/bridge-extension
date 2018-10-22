import React from 'react';
import { Button } from 'semantic-ui-react';

import UserIcon from '../../components/UserIcon';

class SettingsAccount extends React.Component {

	render() {
		// ЦВЕТА ИМЕННО В ТАКОМ ПОРЯДКЕ !!!
		const colors = ['green', 'sky', 'blue', 'pink', 'red', 'yellow', 'lemon'];
		return (
			<React.Fragment>

				<div className="settings-wrap">
					<UserIcon color="green" big remove avatar="ava1" />
					<div className="page-wrap" >
						<div className="page">
							<ul className="list-avatars">

								{
									Array(15).fill().map((elm, i) => {
										const id = i;
										return (
											<li key={id} >
												<UserIcon
													select
													tabSelect
													active={i === 0}
													color="transparent"
													avatar={`ava${i + 1}`}
												/>
											</li>
										);
									})
								}
							</ul>
							<ul className="list-colors">
								{
									colors.map((elm, i) => {
										const id = i;
										return (
											<li key={id} >
												<Button
													active={i === 0}
													className={`select-${elm}`}
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
									disabled
									content={
										<span className="btn-text">Save Changes</span>
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

export default SettingsAccount;
