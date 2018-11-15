import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

import { INDEX_PATH } from '../../constants/RouterConstants';
import { successTransaction } from '../../actions/SignActions';

class SuccessTransaction extends React.PureComponent {

	onClick() {
		this.props.remove(this.props.transaction.get('id'));
		this.props.history.push(INDEX_PATH);
	}

	render() {
		return (
			<div className="transaction-status-wrap success">
				<div className="transaction-status-body">
					<div className="title">Success</div>
					<div className="description">
                        Your transaction has been successfully<br /> sent
					</div>
				</div>
				<div className="page-action-wrap">
					<div className="one-btn-wrap">
						<Button
							className="btn-inverted success"
							content={<span className="btn-text">Proceed</span>}
							onClick={() => this.onClick()}
						/>
					</div>
				</div>
			</div>
		);
	}

}

SuccessTransaction.propTypes = {
	transaction: PropTypes.any,
	history: PropTypes.object.isRequired,
	remove: PropTypes.func.isRequired,
};

SuccessTransaction.defaultProps = {
	transaction: null,
};

export default connect(
	(state) => ({
		transaction: state.global.getIn(['sign', 'current']),
	}),
	(dispatch) => ({
		remove: (transaction) => dispatch(successTransaction(transaction)),
	}),
)(SuccessTransaction);
