import React from 'react';
import { Button } from 'semantic-ui-react';
import BridgeInput from '../../components/BridgeInput';

class Pin extends React.Component {

	renderForm() {
		return (

			<React.Fragment>

				<div className="page">
					<div className="icon-pagePin">
						<span className="path1" />
						<span className="path2" />
						<span className="path3" />
						<span className="path4" />
						<span className="path5" />
						<span className="path6" />
					</div>

					<div className="two-input-wrap">
						<BridgeInput
							theme="input-dark"
							labelText="Create PIN"
							type="password"
						/>
						<BridgeInput
							error
							theme="input-dark"
							labelText="Repeat PIN"

							type="password"
							hintText="Repeat PIN correctly"
							descriptionText="At least 6 symbols. PIN will be used only to unlock extension"
						/>

					</div>
				</div>
				<div className="page-action-wrap">
					<div className="one-btn-wrap" >
						{/* <Button
							className="btn-in-light"
							content={<span className="btn-text">Create</span>}
                        /> */}

					</div>
				</div>

			</React.Fragment>
		);
	}

	renderSuccess() {
		return (
			<div className="page">
				<div className="icon-network" />
				<div className="success-text"> Success </div>
				<div className="success-desc">
                    Network <span>Hallelujah</span> was succesfully created
				</div>
				<div className="one-btn-wrap">
					<Button
						compact
						className="btn-transparent"
						content={<span className="btn-text">ADD ACCOUNT</span>}
					/>
				</div>
			</div>
		);
	}

	render() {
		return (
			<React.Fragment>
				<div className="page-wrap">
					{
						this.renderForm()
					}
				</div>

			</React.Fragment>


		);

	}

}

export default Pin;
