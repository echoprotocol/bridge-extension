import React from 'react';
import { Button } from 'semantic-ui-react';
import CustomScroll from 'react-custom-scroll';
import classnames from 'classnames';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import FormatHelper from '../../helpers/FormatHelper';


class Wallet extends React.Component {

	render() {
		// const balances = [
		// 	{
		// 		value: '0.000',
		// 		key: 'ECHO',
		// 		type: 'asset',
		// 	},
		// ];
		let { assets } = this.props;
		assets = assets.toArray();

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
							{ two: assets.length === 2 },
						)}
						>
							<CustomScroll
								flex="1"
								heightRelativeToParent="calc(100%)"
							>
								<ul className={classnames(
									'wallet-list',
									{ one: assets.length === 1 },
									{ two: assets.length === 2 },
									{ three: assets.length === 3 },
								)}
								>
									{

										assets.map((asset, i) => {
											const id = i;
											return (

												<li key={id}>
													<div className="balance-info">
														<span>{FormatHelper.formatAmount(asset.balance, asset.precision)}</span>
														<span>{asset.symbol}</span>
													</div>
													{/* { */}
													{/* asset.type === 'token' ? */}
													{/* <React.Fragment> */}
													{/* <Button className="btn-icon icon-closeBig" /> */}
													{/* <div className="token-info"> */}
													{/* <span>ERC20</span> */}
													{/* <span>TOKEN</span> */}
													{/* </div> */}
													{/* </React.Fragment> : */}
													{/* null */}
													{/* } */}
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

Wallet.propTypes = {
	assets: PropTypes.object.isRequired,
};

export default connect(
	(state) => ({
		assets: state.balance.get('assets'),
	}),
	() => ({}),
)(Wallet);
