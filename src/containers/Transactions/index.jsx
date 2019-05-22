import React from 'react';
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
import '../../assets/images/icons/picContract.svg';
import { NETWORKS, TRANSFER_OPERATION } from '../../constants/GlobalConstants';

class Transactions extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			activeId: null,
			note: '',
			noteId: '',
		};
	}

	async getTransactionInfo(e, index) {

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

		const { note, activeId } = this.state;
		const { accountName, network } = this.props;

		return (
			<React.Fragment>
				<div className="page-wrap transactions-page">
					<CustomScroll
						flex="1"
						heightRelativeToParent="calc(100%)"
					>
						<div className="transactions-wrap">
							<div className="accordion">
								{
									ordered.toArray().map((elem) =>
										(
											<div className="accordion-item" key={elem.get('id')}>
												<input
													onChange={(e) => { this.getTransactionInfo(e, elem.get('id')); }}
													id={elem.get('id')}
													type="checkbox"
													name="transactions"
													checked={elem.get('id') === activeId}
												/>
												<label
													className="transaction-element"
													htmlFor={elem.get('id')}
												>
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
												</label>

												<div className="content">
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
															{elem.getIn(['transaction', 'typeName']).includes(TRANSFER_OPERATION) && note &&
																<React.Fragment>
																	<div className="left-block">Note</div>
																	<div className="right-block">
																		{note}
																	</div>
																</React.Fragment>
															}
														</div>
														{NETWORKS.find((item) => item.name === network.get('name')) &&
															<div className="row">
																<a
																	target="_blank"
																	rel="noopener noreferrer"
																	href={`${network.get('explorer')}/blocks/${elem.getIn(['transaction', 'blockNumber'])}`}
																	className="link-to-block"
																>
																	<span className="text">open in explorer</span>
																	<i className="icon-link" />
																</a>
															</div>
														}
													</div>
												</div>
											</div>))
								}
							</div>
						</div>
					</CustomScroll>
				</div>
			</React.Fragment>
		);

	}

}

Transactions.propTypes = {
	network: PropTypes.object,
	history: PropTypes.object,
	decryptNote: PropTypes.func.isRequired,
	accountName: PropTypes.string.isRequired,
};

Transactions.defaultProps = {
	history: null,
	network: null,
};

export default withRouter(connect(
	(state) => ({
		history: state.global.get('formattedHistory'),
		accountName: state.global.getIn(['account', 'name']),
		network: state.global.get('network'),
	}),
	(dispatch) => ({
		decryptNote: (memo) => dispatch(decryptNote(memo)),
	}),
)(Transactions));
