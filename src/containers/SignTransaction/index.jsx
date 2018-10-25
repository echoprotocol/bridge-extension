import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';

import { approveTransaction, cancelTransaction } from '../../actions/SignActions';

class SignTransaction extends React.Component {

	componentDidMount() {
		if (!this.props.transaction) {
			this.props.history.goBack();
		}
	}

	onApprove() {
		this.props.approve(this.props.transaction);
	}

	onCancel() {
		this.props.cancel(this.props.transaction);
	}

	render() {
		const { transaction } = this.props;

		return (
			<div>
				{ transaction ? transaction.id : null }
				<Button type="button" onClick={(e) => this.onApprove(e)}>Approve</Button>
				<Button type="button" onClick={(e) => this.onCancel(e)}>Cancel</Button>
			</div>
		);
	}

}

SignTransaction.propTypes = {
	transaction: PropTypes.any,
	history: PropTypes.object.isRequired,
	approve: PropTypes.func.isRequired,
	cancel: PropTypes.func.isRequired,
};

SignTransaction.defaultProps = {
	transaction: null,
};

export default connect(
	(state) => ({
		transaction: state.global.getIn(['sign', 'transactions', 0]),
	}),
	(dispatch) => ({
		approve: (transaction) => dispatch(approveTransaction(transaction)),
		cancel: (transaction) => dispatch(cancelTransaction(transaction)),
	}),
)(SignTransaction);
