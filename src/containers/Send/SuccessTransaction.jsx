import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import query from 'query-string';
import { connect } from 'react-redux';

import { closePopup, globals } from '../../actions/SignActions';
import { POPUP_WINDOW_TYPE } from '../../constants/GlobalConstants';

import { INDEX_PATH } from '../../constants/RouterConstants';

class SuccessTransaction extends React.PureComponent {

	onClick() {
		if (globals.WINDOW_TYPE === POPUP_WINDOW_TYPE && !this.props.transaction) {
			closePopup();

			return null;
		}

		const { index } = query.parse(this.props.location.search);

		if (index) {
			this.props.history.push(INDEX_PATH);
		} else {
			this.props.history.goBack();
		}

		return null;
	}

	render() {
		const { index } = query.parse(this.props.location.search);

		return (
			<div className="transaction-status-wrap success">
				<div className="transaction-status-body">
					<div className="title">Success</div>
					<div className="description">
						Your transaction has been successfully<br /> { index ? 'sent' : 'signed' }
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
	location: PropTypes.object.isRequired,
	transaction: PropTypes.any,
};

SuccessTransaction.defaultProps = {
	transaction: null,
};

export default connect((state) => ({
	transaction: state.global.getIn(['sign', 'current']),
}))(SuccessTransaction);
