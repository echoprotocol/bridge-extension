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
		const newId = activeId === index ? -1 : index;

		this.setState({
			noteId: index,
			activeId: newId,
		});

		const id = index;

		if (noteId !== index) {
			this.setState({ note: null });

			const note = await this.props.decryptNote(id);

			if (this.state.noteId === id) {
				this.setState({ note });
			}
		}
	}

	sortTransactions() {

	}

	render() {
		const { history } = this.props;

		if (!history) {
			return null;
		}
		const ordered = history.sort((a, b) => {
			if (!a || !b) {
				return 0;
			}

			const timeA = a.getIn(['transaction', 'data']);
			const timeB = b.getIn(['transaction', 'data']);

			if (timeA < timeB) { return -1; }
			if (timeA > timeB) { return 1; }

			return 0;
		});

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
									ordered.toArray().map((elem) =>
										(
											<React.Fragment key={elem.get('id')}>
												<Accordion.Title
													active={activeId === elem.get('id')}
													index={elem.get('id')}
													onClick={this.handleClick}
												>
													<div className="transaction-element">
														<div className="top-block">
															<div className="transaction-type">
																<div className={`icon-Pic${elem.getIn(['transaction', 'type'])}`} />
																{elem.getIn(['transaction', 'typeName'])}
															</div>
															<div className="transaction-date">{elem.getIn(['transaction', 'date'])}</div>
														</div>
														<div className="bottom-block">
															<div className="transaction-value">
																{elem.getIn(['transaction', 'value'])}
																<span className="currency">{elem.getIn(['transaction', 'currency'])}</span>
															</div>
															<div className="icon icon-dropdown" />
														</div>
													</div>
												</Accordion.Title>
												<Accordion.Content active={activeId === elem.get('id')}>
													<div className="transaction-element-content">
														<div className="row">
															<div className="left-block">Receiver</div>
															<div className="right-block">{elem.getIn(['content', 'receiver'])}</div>
														</div>
														<div className="row">
															<div className="left-block">Fee</div>
															<div className="right-block">{elem.getIn(['content', 'fee'])}<span className="currency">{elem.getIn(['content', 'feeCurrency'])}</span></div>
														</div>
														<div className="row">
															<div className="left-block">Note</div>
															{
																note &&
																<div className="right-block">
																	{note}
																</div>
															}
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
	history: PropTypes.object,
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
