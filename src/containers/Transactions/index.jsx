/* eslint-disable no-nested-ternary */

import React from 'react';
import { Accordion } from 'semantic-ui-react';
import CustomScroll from 'react-custom-scroll';

class Transactions extends React.Component {

	constructor() {
		super();
		this.state = { activeIndex: null };
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(e, titleProps) {

		const { index } = titleProps;
		const { activeIndex } = this.state;
		const newIndex = activeIndex === index ? -1 : index;

		this.setState({ activeIndex: newIndex });
	}

	render() {
		const { activeIndex } = this.state;

		// CODING
		const codingTransactions = [
			{
				id: 0,
				transaction: {
					type: 'Contract',
					typeName: 'Contract created',
					date: '01 Oct, 11:35',
					value: '-230.000',
					currency: 'ECHO',
				},
				content: {
					receiver: 'HomerSimpson435',
					fee: '0.000000034',
					feeCurrency: 'ECHO',
					note: "Hey, that's the second part. The next transaction is about to come",
				},
			},
			{
				id: 1,
				transaction: {
					type: 'Recieved',
					typeName: 'Recieved',
					date: '23 Oct, 11:35',
					value: '+ 0.000231234892',
					currency: 'RLY',
				},
				content: {
					receiver: 'HomerSimpson435',
					fee: '0.000000034',
					feeCurrency: 'RLY',
					note: "Hey, that's the second part. The next transaction is about to come",
				},
			},
			{
				id: 2,
				transaction: {
					type: 'Transaction',
					typeName: 'Transaction',
					date: '23 Oct, 11:35',
					value: '+ 0.000231234892',
					currency: 'ZSHC',
				},
				content: {
					receiver: 'HomerSimpson435',
					fee: '0.000000034',
					feeCurrency: 'ZSHC',
					note: "Hey, that's the second part. The next transaction is about to come",
				},
			},
			{
				id: 3,
				transaction: {
					type: 'Sent',
					typeName: 'Sent',
					date: '23 Oct, 11:35',
					value: '+ 0.000231234892',
					currency: 'RLY',
				},
				content: {
					receiver: 'HomerSimpson435',
					fee: '0.000000034',
					feeCurrency: 'RLY',
					note: "Hey, that's the second part. The next transaction is about to come",
				},
			},
			{
				id: 4,
				transaction: {
					type: 'Account',
					typeName: 'Account created',
					date: '23 Oct, 11:35',
					value: '- 0.000',
					currency: 'ECHO',
				},
				content: {
					receiver: 'HomerSimpson435',
					fee: '0.000000034',
					feeCurrency: 'ECHO',
					note: "Hey, that's the second part. The next transaction is about to come",
				},
			},
		];

		return (
			<React.Fragment>
				<div className="page-wrap transactions-page">
					<CustomScroll
						flex="1"
						heightRelativeToParent="calc(100%)"
					>
						<div className="transactions-wrapper">
							<Accordion>
								{
									codingTransactions.map((elem) =>
										(
											<React.Fragment key={elem.id}>
												<Accordion.Title
													active={activeIndex === elem.id}
													index={elem.id}
													onClick={this.handleClick}
												>
													<div className="transaction-element">
														<div className="top-block">
															<div className="transaction-type">
																<div className={`icon-Pic${elem.transaction.type}`} />
																{elem.transaction.typeName}
															</div>
															<div className="transaction-date">{elem.transaction.date}</div>
														</div>
														<div className="bottom-block">
															<div className="transaction-value">
																{elem.transaction.value}
																<span className="currency">{elem.transaction.currency}</span>
															</div>
															<div className="icon icon-dropdown" />
														</div>
													</div>
												</Accordion.Title>
												<Accordion.Content active={activeIndex === elem.id}>
													<div className="transaction-element-content">
														<div className="row">
															<div className="left-block">Receiver</div>
															<div className="right-block">{elem.content.receiver}</div>
														</div>
														<div className="row">
															<div className="left-block">Fee</div>
															<div className="right-block">{elem.content.fee}<span className="currency">{elem.content.feeCurrency}</span></div>
														</div>
														<div className="row">
															<div className="left-block">Note</div>
															<div className="right-block">{elem.content.note}</div>
														</div>
													</div>
												</Accordion.Content>
											</React.Fragment>))
								}
							</Accordion>
						</div>
					</CustomScroll>
				</div>
			</React.Fragment>
		);

	}

}

export default Transactions;
