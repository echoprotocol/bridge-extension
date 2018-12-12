import React from 'react';
import CustomScroll from 'react-custom-scroll';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
// import { Dropdown, MenuItem } from 'react-bootstrap';

import { sendRedirect } from '../../actions/BalanceActions';

import { RECEIVE_PATH, SEND_PATH, WATCH_TOKEN_PATH } from '../../constants/RouterConstants';

import FormatHelper from '../../helpers/FormatHelper';

class Wallet extends React.Component {

	sortAssets() {
		const { assets, balances } = this.props;

		return balances.toArray().sort((a, b) => {
			if (!a || !b) {
				return 0;
			}

			const assetA = assets.getIn([a.get('asset_type'), 'symbol']);
			const assetB = assets.getIn([b.get('asset_type'), 'symbol']);

			if (assetA < assetB) { return -1; }
			if (assetA > assetB) { return 1; }

			return 0;
		});
	}

	sendRedirect(assetSymbol) {
		this.props.sendRedirect(assetSymbol);
	}


	render() {
		const { assets, balances, account } = this.props;

		if (!account) {
			return null;
		}

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
										this.sortAssets().map((balance) => {
											const asset = assets.get(balance.get('asset_type'));

											if (!asset || account.get('id') !== balance.get('owner')) {
												return null;
											}

											const assetSymbol = asset.get('symbol');

											return (

												<li key={balance.get('id')}>
													<a
														role="button"
														onClick={() => this.sendRedirect(assetSymbol)}
														tabIndex={0}
														onKeyPress={() => this.sendRedirect(assetSymbol)}
													>
														<div className="balance-info">
															<span>{FormatHelper.formatAmount(balance.get('balance'), asset.get('precision'))}</span>
															<span>{assetSymbol}</span>
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
	sendRedirect: PropTypes.func.isRequired,
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
	(dispatch) => ({
		sendRedirect: (assetSymbol) => dispatch(sendRedirect(assetSymbol)),
	}),
)(Wallet);
