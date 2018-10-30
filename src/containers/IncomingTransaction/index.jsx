import React from 'react';
import { Button } from 'semantic-ui-react';

import UserIcon from '../../components/UserIcon';

class IncomingTransaction extends React.Component {

	render() {
		return (
			<div className="incoming-transaction-wrap">
				<div className="incoming-transaction-bg">
					<Button
						className="btn-icon"
						content={<i className="icon-closeBig" />}
					/>

					<div className="title">New unsigned transaction</div>
				</div>
				<div className="incoming-transaction-page">

					<div className="wallet-info">
                        Wallet
						<div className="incoming-transaction-user">
							<UserIcon
								color="green"
								avatar="ava1"
							/>
							<div className="name">Homersimpson435</div>
						</div>
					</div>
					<div className="transaction-info">
						<div className="line">
							<div className="key">Type</div>
							<div className="value">New contract</div>
						</div>
						<div className="line">
							<div className="key">Amount</div>
							<div className="value">None</div>
						</div>
						<div className="line">
							<div className="key">Max transaction fee</div>
							<div className="value">
								<div className="balance">0.000000030000011111111111111111111111111</div>
								<div className="currency">ECHO</div>
							</div>
						</div>
						<div className="line">
							<div className="key">Max total</div>
							<div className="value"> {'<'} 0.0000001 ECHO</div>
						</div>
					</div>
				</div>
				<div className="page-action-wrap">
					<div className="two-btn-wrap" >
						<Button
							className="btn-transparent"
							content={<span className="btn-text">Approve</span>}
						/>
						<Button
							className="btn-in-light"
							content={<span className="btn-text">Reject</span>}
						/>

					</div>
				</div>
			</div>
		);

	}

}

export default IncomingTransaction;
