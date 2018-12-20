/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import CustomScroll from 'react-custom-scroll';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
// import { Dropdown, MenuItem } from 'react-bootstrap';

import { RECEIVE_PATH, SEND_PATH, WATCH_TOKEN_PATH } from '../../constants/RouterConstants';

import FormatHelper from '../../helpers/FormatHelper';

import { removeToken } from '../../actions/BalanceActions';

class Wallet extends React.Component {

	getBalances() {
		const { assets, account } = this.props;
		const { balances, tokens } = this.sortAssets();


		const resultBalances = balances.map((balance) => {
			const asset = assets.get(balance.get('asset_type'));

			if (!asset || account.get('id') !== balance.get('owner')) {
				return null;
			}

			return (

				<li key={balance.get('id')}>
					<a>
						<div className="balance-info">
							<span>{FormatHelper.formatAmount(balance.get('balance'), asset.get('precision'))}</span>
							<span>{asset.get('symbol')}</span>
						</div>
					</a>

				</li>

			);
		});

		const resultTokens = [];
		tokens.mapEntries(([contractId, token]) => {
			if (account.get('id') !== token.get('accountId')) {
				return null;
			}

			resultTokens.push(<li key={contractId}>
				<a>
					<div className="balance-info">
						<span>{FormatHelper.formatAmount(token.get('balance'), token.get('precision'))}</span>
						<span>{token.get('symbol')}</span>
					</div>
					<div className="token-info">
						<span>ERC20</span>
						<span>TOKEN</span>
					</div>
				</a>
				<Button
					className="btn-icon icon-closeBig"
					onClick={() => this.props.removeToken(contractId)}
				/>

			</li>);

			return null;
		});

		return resultBalances.concat(resultTokens);
	}

	sortAssets() {
		const { assets, balances, tokens } = this.props;

		const sortedBalalnces = balances.toArray().sort((a, b) => {
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
			balances: sortedBalalnces,
			tokens: sortedTokens,
		};
	}

	render() {
		const { balances, account } = this.props;

		if (!account) {
			return null;
		}

		const balancesCount = balances.filter((value) => account.get('id') === value.get('owner')).size;
		this.getBalances();

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
										this.getBalances()
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
	tokens: PropTypes.object.isRequired,
	account: PropTypes.object,
	removeToken: PropTypes.func.isRequired,
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
	}),
)(Wallet);
