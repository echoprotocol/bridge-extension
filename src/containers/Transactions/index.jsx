/* eslint-disable no-nested-ternary */

import React from 'react';
import { Accordion } from 'semantic-ui-react';
import CustomScroll from 'react-custom-scroll';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { decryptNote } from '../../actions/HistoryActions';

import downArrow from '../../assets/images/icons/arrow_dropdown_light.svg';

import '../../assets/images/icons/picAccount.svg';
import '../../assets/images/icons/picRecieved.svg';
import '../../assets/images/icons/picSent.svg';
import '../../assets/images/icons/picTransaction.svg';


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
		const { accountName } = this.props;

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
																<img src={`/images/pic${elem.getIn(['transaction', 'type'])}.svg`} alt="" />
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
															<img className="ddDown" src={downArrow} alt="" />
														</div>
													</div>
												</Accordion.Title>
												<Accordion.Content active={activeId === elem.get('id')}>
													<div className="transaction-element-content">
														{
															accountName !== elem.getIn(['content', 'sender']) ?
																<div className="row">
																	<div className="left-block">Sender</div>
																	<div className="right-block">{elem.getIn(['content', 'sender'])}</div>
																</div> : null
														}

														{
															elem.getIn(['content', 'receiver']) && accountName !== elem.getIn(['content', 'receiver']) ?
																<div className="row">
																	<div className="left-block">Receiver</div>
																	<div className="right-block">{elem.getIn(['content', 'receiver'])}</div>
																</div> : null
														}
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
	accountName: PropTypes.string.isRequired,
};

Transactions.defaultProps = {
	history: null,
};

export default withRouter(connect(
	(state) => ({
		history: state.global.get('formattedHistory'),
		accountName: state.global.getIn(['account', 'name']),
	}),
	(dispatch) => ({
		decryptNote: (memo) => dispatch(decryptNote(memo)),
	}),
)(Transactions));
