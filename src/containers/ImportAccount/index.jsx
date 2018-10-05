import React from 'react';
import { Button } from 'semantic-ui-react';
import BridgeInput from '../../components/BridgeInput';

class ImportAccount extends React.Component {


	render() {

		return (
			<React.Fragment>
				<div className="page-wrap">
					<div className="page">
						<div className="icon-pageAccount" />
						<div className="two-input-wrap">
							<BridgeInput
							// error
								theme="input-light"
								labelText="Account name"
								errorText="Account with such name already exists."
								hintText="Homersipmson23"
							/>
							<BridgeInput
								type="password"
								// error
								errorText="Invalid password."
								theme="input-light"
								labelText="WIF key / password"
							/>
						</div>
					</div>
					<div className="page-action-wrap">
						<div className="one-btn-wrap" >
							<Button
								disabled
								className="btn-in-dark"
								content={<span className="btn-text">Import</span>}
							/>
						</div>
					</div>
				</div>


			</React.Fragment>

		);
	}

}

export default ImportAccount;
