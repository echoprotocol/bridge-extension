import React from 'react';
import BridgeBtnCopy from '../../components/BridgeBtnCopy';

class Receive extends React.Component {

	render() {
		return (
			<React.Fragment>
				<div className="return-block">
					<a href="#" className="link-return">
						<i className="icon-return" />
						<span className="link-text">Return</span>
					</a>
				</div>
				<div className="page-wrap">
					<div className="page recieve-page">
						<p>Share your account name to request a transaction</p>

						<div className="wif-wrap">
							<div className="wif">Homersimpson345</div>
							<BridgeBtnCopy compact text="Homersimpson345" />
						</div>
					</div>
				</div>
			</React.Fragment>


		);

	}

}

export default Receive;
