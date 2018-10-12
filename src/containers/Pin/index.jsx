import React from 'react';
import { Button } from 'semantic-ui-react';
import BridgeInput from '../../components/BridgeInput';
import CheckBox from '../../components/CheckBox';

class Pin extends React.Component {

	renderForm() {
		return (

			<React.Fragment>
				<div className="page-wrap">
					{/* Если экран ввода пароля --> добавлять класс enter-pin */}
					<div className="page pin-screen enter-pin">
						<div className="icon-pagePin">
							<span className="path1" />
							<span className="path2" />
							<span className="path3" />
							<span className="path4" />
							<span className="path5" />
							<span className="path6" />
						</div>

						{/* CREATE PIN _Start */}
						{/* <div className="two-input-wrap">
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
						</div> */}
						{/* CREATE PIN _End */}

						{/* Enter PIN _Start */}
						<div className="one-input-wrap">
							<BridgeInput
								theme="input-dark"
								labelText="Enter PIN"

								type="password"
								descriptionText="Enter PIN to unlock the Bridge"
							/>
						</div>
						{/* Enter PIN _End */}

					</div>
					{/* Если экран ввода пароля --> добавлять класс enter-pin */}
					<div className="page-action-wrap pin-screen enter-pin">

						{/* CREATE PIN _Start */}
						{/* <div className="one-btn-wrap" >
							<Button
								className="btn-in-light"
								content={<span className="btn-text">Create</span>}
							/>
						</div> */}
						{/* CREATE PIN _End */}

						{/* ENTER PIN _Start */}
						<div className="one-btn-wrap" >
							<Button
								className="btn-in-light disabled"
								disabled
								content={<span className="btn-text">Unlock</span>}
							/>
							<a href="" className="link gray forgot-password">Forgot PIN?</a>
						</div>
						{/* ENTER PIN _End */}

					</div>
				</div>
			</React.Fragment>
		);
	}

	renderNoRestoredPIN() {
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
				{
					this.renderForm()
					// this.renderNoRestoredPIN()
				}
			</React.Fragment>


		);

	}

}

export default Pin;
