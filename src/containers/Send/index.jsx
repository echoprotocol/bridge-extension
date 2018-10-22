import React from 'react';
import { Button } from 'semantic-ui-react';
import CustomScroll from 'react-custom-scroll';
import BridgeInput from '../../components/BridgeInput';
import BridgeTextArea from '../../components/BridgeTextArea';

class Send extends React.Component {

	render() {
		const codingCurrencyDropdownData = [
			{
				id: 0,
				title: 'Assets',
				list: ['ECHO', 'Echolabs', 'Myecho'],
			},
			{
				id: 1,
				title: 'Tokens',
				list: ['ECHO', 'EchoTest', 'EchoEcho', 'EchoEcho245'],
			},
		];

		return (
			<React.Fragment>
				<div className="return-block"><a href="#" className="link-return"><i className="icon-return" /><span className="link-text">Return</span></a></div>
				<div
					className="user-scroll"
					style={{ height: '440px' }}
				>
					<CustomScroll
						flex="1"
						heightRelativeToParent="calc(100%)"
					>
						<div className="wallet-send-block">
							<BridgeInput
								autoFocus
								name="From"
								theme="input-light"
								labelText="From"
								value="Jellyjeda345"
								defaultUp
								readOnly
								userIcon="image-url"
								leftLabel
							/>
							<BridgeInput
								autoFocus
								name="To"
								theme="input-light"
								labelText="To"
								defaultUp
								placeholder="Reciever's name"
								leftLabel
							/>
							<BridgeInput
								autoFocus
								name="Amount"
								theme="input-light"
								placeholder="0.000"
								defaultUp
								labelText="Amount"
								leftLabel
								innerDropdown={codingCurrencyDropdownData}
							/>
							<BridgeInput
								autoFocus
								name="Fee"
								theme="input-light"
								placeholder="0.000"
								// value=""
								defaultUp
								labelText="Fee"
								leftLabel
								innerDropdown={codingCurrencyDropdownData}
							/>
							<BridgeTextArea
								label="Note (optional)"
							/>
							<Button
								className="btn-in-light"
								content={<span className="btn-text">Send</span>}
							/>
						</div>
					</CustomScroll>
				</div>
			</React.Fragment>
		);
	}

}


export default Send;
