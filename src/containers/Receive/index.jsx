import React from 'react';
import { Link } from 'react-router-dom';

import BridgeBtnCopy from '../../components/BridgeBtnCopy';

import { INDEX_PATH } from '../../constants/RouterConstants';

class Receive extends React.Component {

	render() {
		return (
			<React.Fragment>
				<div className="return-block">
					<Link to={INDEX_PATH} className="link-return">
						<i className="icon-return" />
						<span className="link-text">Return</span>
					</Link>
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
