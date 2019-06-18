import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import CustomScroll from 'react-custom-scroll';
import _ from 'lodash';

import { SIGN_MEASSAGE_ERROR } from '../../constants/ErrorsConstants';
import { chooseSignMessageResponse } from '../../actions/GlobalActions';
import { INDEX_PATH } from '../../constants/RouterConstants';

class Sign extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			accountError: '',
			accountName: '',
		};
	}

	componentDidMount() {
		this.checkAccount();
	}

	componentDidUpdate(prevProps) {
		if (_.isEqual(this.props, prevProps)) { return; }
		this.checkAccount();
	}

	checkAccount() {
		const { accounts, requests, network } = this.props;
		const signMessage = requests.first();

		if (!signMessage) {
			this.props.history.push(INDEX_PATH);
			return;
		}

		const signerIndex = accounts.get(network).findKey((i) => i.id === signMessage.signer);

		if (!accounts.get(network).size || typeof signerIndex === 'undefined') {
			this.setState({
				accountError: SIGN_MEASSAGE_ERROR,
			});
			return;
		}

		this.setState({
			accountName: accounts.getIn([network, signerIndex]).name,
		});

	}

	renderSignMessageError() {
		const { requests } = this.props;
		const { accountError } = this.state;

		const signMessage = requests.first();

		return (
			<React.Fragment>
				<div className="transaction-status-wrap error">
					<div className="transaction-status-body">
						<div className="title">Error</div>
						<div className="description">{ accountError }</div>
					</div>
					<div className="page-action-wrap">
						<div className="one-btn-wrap">
							<Button
								className="btn-inverted error"
								onClick={() => this.props.reject(requests.keyOf(signMessage))}
								content={<span className="btn-text">Close</span>}
							/>
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}

	renderSignMessage() {
		const { requests } = this.props;

		const { accountName } = this.state;
		const signMessage = requests.first();
		if (!signMessage) {
			return null;
		}
		return (
			<React.Fragment>

				<div className="incoming-connection-bg">
					<div className="page-header">Signature verification</div>
				</div>
				<div className="incoming-connection-wrap">
					<div className="sign-message-title">
						To confirm <span className="green">{ accountName }</span> ownership, please sign this data
					</div>
					<div className="sign-message-wrap">
						<div className="scroll-wrap-message">
							<CustomScroll
								flex="1"
								heightRelativeToParent="calc(100%)"
							>
								<div className="sign-message">
									{signMessage.message}
								</div>
							</CustomScroll>
						</div>
					</div>
				</div>
				<div className="page-action-wrap">
					<div className="two-btn-wrap" >
						<Button
							className="btn-transparent link"
							onClick={() => this.props.reject(requests.keyOf(signMessage))}
						>
							<span className="btn-text">No Thanks</span>
						</Button>
						<Button
							className="btn-in-light link"
							onClick={() => this.props.approve(
								requests.keyOf(signMessage),
								signMessage.message,
								signMessage.signer,
							)}
						>
							<span className="btn-text">Sign</span>
						</Button>
					</div>
				</div>
			</React.Fragment>
		);
	}

	render() {
		const { accountError } = this.state;
		return (
			<React.Fragment>
				{
					accountError ?
						this.renderSignMessageError() : this.renderSignMessage()
				}
			</React.Fragment>
		);

	}

}

Sign.propTypes = {
	approve: PropTypes.func.isRequired,
	reject: PropTypes.func.isRequired,
	requests: PropTypes.object.isRequired,
	accounts: PropTypes.object.isRequired,
	network: PropTypes.string.isRequired,
	history: PropTypes.object.isRequired,
};

export default connect(
	(state) => ({
		requests: state.global.get('signMessageRequests'),
		accounts: state.global.get('accounts'),
		network: state.global.getIn(['network', 'name']),
	}),
	(dispatch) => ({
		approve: (id, message, signer) =>
			dispatch(chooseSignMessageResponse(id, true, message, signer)),
		reject: (id) =>
			dispatch(chooseSignMessageResponse(id, false)),
	}),
)(Sign);
