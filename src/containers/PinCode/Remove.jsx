import React from 'react';
import { Button } from 'semantic-ui-react';

import CheckBox from '../../components/CheckBox';

class RemovePinCode extends React.Component {

	render() {
		return (
			<div className="no-restored-pin-container">
				<div className="top-section">
					<a href="" className="link link-return_icn green "><span className="icon-return" />Return</a>
					<div className="title">Your PIN number can not be restored.</div>
					<div className="description">
						<span>You can clear your account data from
							Bridge and set a new PIN. If you do, you will
							lose access to the accounts you&#39;ve logged into.
						</span>
						<span>You will need to log into them again, after you have set a new PIN.</span>
					</div>
				</div>
				<div className="confirm-container">
					<section>
						<CheckBox id="1" />
						<div className="text">I understand that Bridge does not store backups of my account keys, and i will lose access to them by clearing my account data.</div>
					</section>
					<div className="one-btn-wrap" >
						<Button
							className="btn-in-light disabled"
							disabled
							content={<span className="btn-text">Cleare Bridge data</span>}
						/>
					</div>
				</div>
			</div>
		);
	}

}

export default RemovePinCode;
