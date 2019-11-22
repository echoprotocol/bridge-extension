/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import CustomScroll from 'react-custom-scroll';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Popup } from 'semantic-ui-react';

import { sendRedirect, removeToken } from '../../actions/BalanceActions';

import { RECEIVE_PATH, SEND_PATH, WATCH_TOKEN_PATH } from '../../constants/RouterConstants';

import FormatHelper from '../../helpers/FormatHelper';
import IconClose from '../../assets/images/icons/cross_dark_big.svg';
import { CORE_ID, CORE_SYMBOL } from '../../constants/GlobalConstants';

class Wallet extends React.Component {

	getBalances() {
		const { assets, account } = this.props;
		const { balances, tokens } = this.sortAssets();

		const resultBalances = balances.map((balance) => {
			const asset = assets.get(balance.get('asset_type'));

			if (!assets || account.get('id') !== balance.get('owner')) {
				return null;
			}

			const balanceId = balance.get('id');

			return (
				<li key={balanceId}>
					<a
						className={balanceId}
						role="button"
						onClick={() => this.sendRedirect(balanceId)}
						tabIndex={0}
						onKeyPress={() => this.sendRedirect(balanceId)}
					>
						{
							!FormatHelper.isAmountVeryBig(balance.get('balance'), asset.get('precision'), asset.get('symbol')) ?
								<div className="balance-info">
									{
										asset ?
											<React.Fragment>
												<span>
													{
														FormatHelper.convertAmount(balance.get('balance'), asset.get('precision'), asset.get('symbol'))
													}
												</span>
												<span>{asset.get('symbol')}</span>
											</React.Fragment>
											:
											<React.Fragment>
												<span>0</span>
												<span>ECHO</span>
											</React.Fragment>
									}
								</div> :
								<Popup
									trigger={
										<div className="balance-info">
											{
												asset ?
													<React.Fragment>
														<span>
															{
																FormatHelper.convertAmount(balance.get('balance'), asset.get('precision'), asset.get('symbol'))
															}
														</span>
														<span>{asset.get('symbol')}</span>
													</React.Fragment>
													:
													<React.Fragment>
														<span>0</span>
														<span>ECHO</span>
													</React.Fragment>
											}
										</div>
									}
									content={
										<span>{FormatHelper.formatAmount(balance.get('balance'), asset.get('precision'))}</span>
									}
								/>
						}
					</a>
				</li >
			);
		});

		const resultTokens = [];
		tokens.mapEntries(([accountId, tokenArr]) => {
			if (account.get('id') !== accountId) {
				return null;
			}

			tokenArr.mapEntries(([contractId, token]) => {
				resultTokens.push(<li key={contractId}>
					<a
						className={contractId}
						role="button"
						onClick={() => this.sendRedirect(contractId)}
						tabIndex={0}
						onKeyPress={() => this.sendRedirect(contractId)}
					>
						{
							!FormatHelper.isAmountVeryBig(token.get('balance'), token.get('precision'), token.get('symbol')) ?
								<div className="balance-info">
									<span>
										{
											FormatHelper.convertAmount(token.get('balance'), token.get('precision'), token.get('symbol'))
										}
									</span>
									<span>{token.get('symbol')}</span>
								</div> :
								<Popup
									trigger={
										<div className="balance-info">
											<span>
												{
													FormatHelper.convertAmount(token.get('balance'), token.get('precision'), token.get('symbol'))
												}
											</span>
											<span>{token.get('symbol')}</span>
										</div>
									}
									content={
										<span>{FormatHelper.formatAmount(token.get('balance'), token.get('precision'))}</span>
									}
								/>
						}
						<div className="token-info">
							<span>ERC20</span>
							<span>TOKEN</span>
						</div>
					</a>
					<Button
						className="btn-icon"
						onClick={() => this.props.removeToken(contractId)}
						content={
							<img src={IconClose} alt="" />
						}
					/>
				</li>);
			});

			return null;
		});


		return resultBalances.concat(resultTokens);
	}

	sortAssets() {
		const { assets, balances, tokens } = this.props;

		const sortedBalances = balances.toArray().sort((a, b) => {
			if (!a || !b) {
				return 0;
			}

			let assetA = assets.getIn([a.get('asset_type'), 'symbol']);
			let assetB = assets.getIn([b.get('asset_type'), 'symbol']);

			if (!assetA) {
				assetA = a.get('symbol');
			}
			if (!assetB) {
				assetB = b.get('symbol');
			}

			if (assetA < assetB) { return -1; }
			if (assetA > assetB) { return 1; }

			return 0;
		});

		const sortedTokens = tokens.sort((a, b) => {
			if (!a || !b) {
				return 0;
			}

			const assetA = a.get('symbol');
			const assetB = b.get('symbol');

			if (assetA < assetB) { return -1; }
			if (assetA > assetB) { return 1; }

			return 0;
		});

		return {
			balances: sortedBalances,
			tokens: sortedTokens,
		};
	}

	sendRedirect(balanceId) {
		this.props.sendRedirect(balanceId);
	}

	render() {
		const { balances, account, tokens } = this.props;

		if (!account) {
			return null;
		}

		let tokensLength = tokens.get(account.get('id'));
		tokensLength = tokensLength ? tokensLength.size : 0;

		let balancesCount = balances.filter((value) => account.get('id') === value.get('owner')).size + tokensLength;

		const balancesToShow = this.getBalances();

		if (!balances.find((v) => account.get('id') === v.get('owner') && v.get('asset_type') === CORE_ID)) {
			balancesCount += 1;

			balancesToShow.unshift(<li key={Math.random()}>
				<Link to={SEND_PATH}>
					<div className="balance-info">
						<span>0</span>
						<span>{CORE_SYMBOL}</span>
					</div>
				</Link>
			</li>);
		}

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
									{ one: balancesCount <= 1 },
									{ two: balancesCount === 2 },
									{ three: balancesCount === 3 },
								)}
								>
									{
										balancesToShow
									}
								</ul>
							</CustomScroll>
						</div>

						<div className="page-action-wrap">
							<div className="two-btn-wrap" >
								<Link className="btn-transparent link" to={RECEIVE_PATH}>
									<span className="btn-text">Receive</span>
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
	tokens: PropTypes.object.isRequired,
	account: PropTypes.object,
	removeToken: PropTypes.func.isRequired,
	sendRedirect: PropTypes.func.isRequired,
};

Wallet.defaultProps = {
	account: null,
};

export default connect(
	(state) => ({
		assets: state.balance.get('assets'),
		balances: state.balance.get('balances'),
		tokens: state.balance.get('tokens'),
		account: state.global.get('account'),
	}),
	(dispatch) => ({
		removeToken: (id) => dispatch(removeToken(id)),
		sendRedirect: (balanceId) => dispatch(sendRedirect(balanceId)),
	}),
)(Wallet);
