import React from 'react';
import { Button } from 'semantic-ui-react';
import CustomScroll from 'react-custom-scroll';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
// import { Dropdown, MenuItem } from 'react-bootstrap';

import { RECIEVE_PATH, SEND_PATH } from '../../constants/RouterConstants';

import FormatHelper from '../../helpers/FormatHelper';

class Wallet extends React.Component {

	render() {
		const { assets, balances, account } = this.props;
		const balancesCount = balances.filter((value) => account.get('id') === value.get('owner')).size;

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
							{ two: balancesCount === 2 },
						)}
						>
							<CustomScroll
								flex="1"
								heightRelativeToParent="calc(100%)"
							>
								<ul className={classnames(
									'wallet-list',
									{ one: balancesCount === 1 },
									{ two: balancesCount === 2 },
									{ three: balancesCount === 3 },
								)}
								>
									{
										balances.toArray().map((balance) => {
											const asset = assets.get(balance.get('asset_type'));

											if (!asset || account.get('id') !== balance.get('owner')) {
												return null;
											}

											return (

												<li key={balance.get('id')}>
													<div className="balance-info">
														<span>{FormatHelper.formatAmount(balance.get('balance'), asset.get('precision'))}</span>
														<span>{asset.get('symbol')}</span>
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
								<Link to={RECIEVE_PATH}>
									<Button
										className="btn-transparent"
										content={<span className="btn-text">Recieve</span>}
									/>
								</Link>
								<Link to={SEND_PATH}>
									<Button
										className="btn-in-light"
										content={<span className="btn-text">Send</span>}
									/>
								</Link>
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
	balances: PropTypes.object.isRequired,
	account: PropTypes.object,
};

Wallet.defaultProps = {
	account: null,
};

export default connect(
	(state) => ({
		assets: state.balance.get('assets'),
		balances: state.balance.get('balances'),
		account: state.global.get('account'),
	}),
	() => ({}),
)(Wallet);
