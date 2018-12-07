/* eslint-disable no-nested-ternary */

import React from 'react';
import { Accordion } from 'semantic-ui-react';
import CustomScroll from 'react-custom-scroll';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { decryptNote } from '../../actions/HistoryActions';

class Transactions extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			activeId: null,
			note: '',
			noteId: '',
		};
		this.handleClick = this.handleClick.bind(this);
	}

	async handleClick(e, titleProps) {

		const { index } = titleProps;
		const { activeId, noteId } = this.state;
		const newIndex = activeId === index ? -1 : index;

		this.setState({
			noteId: index,
		});

		const id = index;

		if (noteId !== index) {
			const note = await this.props.decryptNote(id);

			if (this.state.noteId === id) {
				this.setState({ note });
			}
		}

		this.setState({ activeId: newIndex });
	}

	render() {
		const { history } = this.props;

		if (!history) {
			return null;
		}

		const { activeId, note } = this.state;

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
													active={activeId === elem.id}
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
												<Accordion.Content active={activeId === elem.id}>
													<div className="transaction-element-content">
														<div className="row">
															<div className="left-block">Receiver</div>
															<div className="right-block">{elem.content.receiver}</div>
														</div>
														<div className="row">
															<div className="left-block">Fee</div>
															<div className="right-block">{elem.content.fee}<span className="currency">{elem.content.feeCurrency}</span></div>
														</div>
														{
															note ?
																<div className="row">
																	<div className="left-block">Note</div>
																	<div className="right-block">
																		{note}
																	</div>
																</div> : null
														}
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
	decryptNote: PropTypes.func.isRequired,
};

Transactions.defaultProps = {
	history: null,
};

export default withRouter(connect(
	(state) => ({
		history: state.global.get('formattedHistory'),
	}),
	(dispatch) => ({
		decryptNote: (memo) => dispatch(decryptNote(memo)),
	}),
)(Transactions));
