import React from 'react';
import { Button } from 'semantic-ui-react';
import CustomScroll from 'react-custom-scroll';
import classnames from 'classnames';


class Wallet extends React.Component {

	render() {
		const balances = [
			{
				value: '0.000',
				key: 'ECHO',
				type: 'asset',
			},
			{
				value: '234.09',
				key: 'ZSHC',
				type: 'asset',
			},
			{
				value: '0.000392',
				key: 'EBTC',
				type: 'asset',
			},
			{
				value: '0.034',
				key: 'ETH',
				type: 'asset',
			},
			{
				value: '0.000',
				key: 'ECHO1',
				type: 'asset',
			},
			{
				value: '234.09',
				key: 'ZSHC1',
				type: 'asset',
			},
			{
				value: '0.000392',
				key: 'EBTC1',
				type: 'asset',
			},
			{
				value: '0.034',
				key: 'ETH1',
				type: 'asset',
			},

		];
		return (
			<React.Fragment>
				<div className="wallet-block">
					<h4>Assets and tokens</h4>

					<Button
						compact
						content={
							<span className="btn-text">Watch tokens</span>
						}
						className="btn-transparent"
					/>
				</div>
				<div className="page-wrap">
					<div className="page">
						<div className={classnames(
							'scroll-wrap',
							{ two: balances.length === 2 },
						)}
						>
							<CustomScroll
								flex="1"
								heightRelativeToParent="calc(100%)"
							>
								<ul className={classnames(
									'wallet-list',
									{ one: balances.length === 1 },
									{ two: balances.length === 2 },
									{ three: balances.length === 3 },
								)}
								>
									{

										balances.map((balance, i) => {
											const id = i;
											return (

												<li key={id}>
													<div className="balance-info">
														<span>{balance.value}</span>
														<span>{balance.key}</span>
													</div>
													{
														balance.type === 'token' ?
															<React.Fragment>
																<Button className="btn-icon icon-closeBig" />
																<div className="token-info">
																	<span>ERC20</span>
																	<span>TOKEN</span>
																</div>
															</React.Fragment> :
															null
													}
												</li>

											);

										})
									}
								</ul>
							</CustomScroll>
						</div>
						<div className="page-action-wrap">
							<div className="two-btn-wrap" >
								<Button
									className="btn-transparent"
									content={<span className="btn-text">Recieve</span>}
								/>
								<Button
									className="btn-in-light"
									content={<span className="btn-text">Send</span>}
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
