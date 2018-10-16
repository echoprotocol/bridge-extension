import React from 'react';
import { Button } from 'semantic-ui-react';

import BridgeInput from '../../components/BridgeInput';

class CreatePin extends React.Component {

	render() {
		return (
			<div className="page-wrap">
				<div className="page pin-screen">
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
				<div className="page-action-wrap pin-screen">
					<div className="one-btn-wrap" >
						<Button
							className="btn-in-light"
							content={<span className="btn-text">Create</span>}
						/>
					</div>
				</div>
			</div>
		);

	}

}

export default CreatePin;
