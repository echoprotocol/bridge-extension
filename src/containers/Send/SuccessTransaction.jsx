import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';

import { closePopup, globals } from '../../actions/SignActions';
import { POPUP_WINDOW_TYPE } from '../../constants/GlobalConstants';

class SuccessTransaction extends React.PureComponent {

	onClick() {
		closePopup();

		if (globals.WINDOW_TYPE === POPUP_WINDOW_TYPE && !this.props.transaction) {
			return null;
		}

		this.props.history.goBack();

		return null;
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
	history: PropTypes.object.isRequired,
	transaction: PropTypes.any,
};

SuccessTransaction.defaultProps = {
	transaction: null,
};

export default connect((state) => ({
	transaction: state.global.getIn(['sign', 'current']),
}))(SuccessTransaction);
