import React from 'react';
import { Button } from 'semantic-ui-react';
import BridgeInput from '../../components/BridgeInput';

class AddNetwork extends React.Component {

	renderForm() {
		return (

			<React.Fragment>

				<div className="page">
					<div className="icon-network" />

					<div className="three-input-wrap">
						<BridgeInput
							theme="input-light"
							labelText="Network name"
						/>
						<BridgeInput
							theme="input-light"
							labelText="Adress (URL or IP)"
						/>
						<BridgeInput
							// error
							theme="input-light"
							labelText="Faucet (URL or IP)"
						/>

					</div>
				</div>
				<div className="page-action-wrap">
					<div className="one-btn-wrap" >
						<Button
							className="btn-in-light"
							content={<span className="btn-text">Create</span>}
						/>
					</div>
				</div>

			</React.Fragment>
		);
	}

	renderSuccess() {
		return (
			<div className="page">
				<div className="icon-network" />
			</div>
		);
	}

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
					{
						this.renderSuccess()
						/* {this.renderForm()} */
					}
				</div>

			</React.Fragment>


		);

	}

}

export default AddNetwork;
