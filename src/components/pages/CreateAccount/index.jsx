import React from 'react';
import { Button } from 'semantic-ui-react';
import BridgeInput from '../../BridgeInput';
import BridgeBtnCopy from '../../BridgeBtnCopy';

class CreateAccount extends React.Component {

	renderWelcome() {
		return (
			<React.Fragment>
				<div className="page-wrap" >
					<div className="icon-person-in" />

					<div className="hi-text">
						<div>Homerushko564,</div>
						<span>welcome to Bridge!</span>
					</div>
					<div className="instruction-text">
                        Save your WIF key and don’t loose it.
                        You <br /> will need it to restore account.
					</div>
					<div className="wif-wrap">
						<div className="wif">5Kb8kLf9zgWQnogidDA76MzPL6TsZZY36hWXMssSzNydYXYB9KF</div>
						<BridgeBtnCopy compact />

					</div>
				</div>
				<div className="page-action-wrap">
					<div className="one-btn-wrap" >
						<Button
							className="btn-in-light"
							content={<span className="btn-text">Proceed</span>}
						/>
					</div>
				</div>
			</React.Fragment>
		);
	}

	renderLogin() {
		return (
			<React.Fragment>
				<div className="page-wrap">
					<div className="icon-person" />
					<div className="one-input-wrap">
						<BridgeInput
							// error
							theme="input-light"
							labelText="Account name"
							errorText="Account with such name already exists."
							hintText="Homersipmson23"
							descriptionText="Unique name will be used to make transaction"
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

	render() {
		return (
			this.renderLogin()
		);

	}

}

export default CreateAccount;
