/* eslint-disable no-nested-ternary */

import React from 'react';
import { Accordion } from 'semantic-ui-react';
import CustomScroll from 'react-custom-scroll';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { decryptNote } from '../../actions/HistoryActions';

class Transactions extends React.Component {

	constructor() {
		super();
		this.state = {
			activeIndex: null,
		};
		this.handleClick = this.handleClick.bind(this);
	}

	componentDidMount() {
	}

	handleClick(e, titleProps) {

		const { index } = titleProps;
		const { activeIndex } = this.state;
		const newIndex = activeIndex === index ? -1 : index;

		if (index !== activeIndex) {
			this.props.decryptNote(index);
		}

		this.setState({ activeIndex: newIndex });
	}

	render() {
		const { history, historyNote } = this.props;

		if (!history) {
			return null;
		}

		const { activeIndex } = this.state;

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
									history.map((elem) =>
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
															<div className="right-block">{historyNote}</div>
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

Transactions.propTypes = {
	history: PropTypes.array,
	historyNote: PropTypes.string,
	decryptNote: PropTypes.func.isRequired,
};

Transactions.defaultProps = {
	history: null,
	historyNote: '',
};

export default withRouter(connect(
	(state) => ({
		history: state.global.get('formattedHistory'),
		historyNote: state.global.get('historyNote'),
	}),
	(dispatch) => ({
		decryptNote: (memo) => dispatch(decryptNote(memo)),
	}),
)(Transactions));
