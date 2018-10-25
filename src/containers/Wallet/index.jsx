import React from 'react';
import CustomScroll from 'react-custom-scroll';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
// import { Dropdown, MenuItem } from 'react-bootstrap';

import { RECEIVE_PATH, SEND_PATH, WATCH_TOKEN_PATH } from '../../constants/RouterConstants';

import FormatHelper from '../../helpers/FormatHelper';

class Wallet extends React.Component {

	render() {
		const { assets, balances, account } = this.props;
		const balancesCount = balances.filter((value) => account.get('id') === value.get('owner')).size;

		return (
			<React.Fragment>
				<div className="wallet-block">
					<h4>Assets and tokens</h4>
					<Link
						className="compact btn-transparent link"
						to={WATCH_TOKEN_PATH}
					><span className="btn-text">Watch tokens</span>
					</Link>
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
													<a href="">
														<div className="balance-info">
															<span>{FormatHelper.formatAmount(balance.get('balance'), asset.get('precision'))}</span>
															<span>{asset.get('symbol')}</span>
														</div>
													</a>
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
								<Link className="btn-transparent link" to={RECEIVE_PATH}>
									<span className="btn-text">Recieve</span>
								</Link>
								<Link className="btn-in-light link" to={SEND_PATH}>
									<span className="btn-text">Send</span>
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
