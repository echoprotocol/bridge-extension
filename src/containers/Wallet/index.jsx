import React from 'react';
import { Button } from 'semantic-ui-react';

class Wallet extends React.Component {

	render() {
		return (
			<React.Fragment>
				<div className="wallet-block">
					<a href="#" className="link-return">
						<i className="icon-return" />
						<span className="link-text">Return</span>
					</a>
				</div>
				<div className="page-wrap">
					<div className="page">
                    asd
						<div className="page-action-wrap">
							<div className="two-btn-wrap" >
								<Button
									className="btn-in-light"
									content={<span className="btn-text">Create</span>}
								/>
								<Button
									className="btn-in-light"
									content={<span className="btn-text">Create</span>}
								/>

							</div>
						</div>
					</div>
				</div>

			</React.Fragment>


		);

	}

}

export default Wallet;
