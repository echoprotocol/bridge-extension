import React from 'react';
import CustomScroll from 'react-custom-scroll';
import { Button } from 'semantic-ui-react';

import BridgeInput from '../../components/BridgeInput';

export default class WatchTokens extends React.Component {


	render() {
		return (
			<React.Fragment>
				<div className="return-block">
					<a href="/" className="link-return" onClick={(e) => this.onClick(e)}>
						<i className="icon-return" />
						<span className="link-text">Back</span>
					</a>
				</div>
				<div className="watch-scroll">
					<CustomScroll
						flex="1"
						heightRelativeToParent="calc(100%)"
					>
						<div className="page-wrap">
							<div className="page">
								<div className="one-input-wrap">
									<BridgeInput
										name="name"
										readOnly
										leftLabel
										defaultUp
										theme="input-light"
										labelText="Contract ID"
										value="375534329sasjbvhhsd324nsad"
									/>
								</div>
							</div>
						</div>
						<div className="page-action-wrap">
							<div className="one-btn-wrap" >
								<Button
									content={<span className="btn-text">Watch</span>}
									className="btn-in-light"
								/>
							</div>
						</div>
					</CustomScroll>
				</div>

			</React.Fragment>
		);

	}

}
