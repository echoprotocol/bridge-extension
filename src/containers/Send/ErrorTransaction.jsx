import React from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import query from 'query-string';

import { closePopup, globals } from '../../actions/SignActions';

import { DISCONNECT_STATUS, POPUP_WINDOW_TYPE } from '../../constants/GlobalConstants';
import { INDEX_PATH } from '../../constants/RouterConstants';

class ErrorTransaction extends React.PureComponent {

	onClick(e, network) {
		if (!this.props.isReturn) {
			closePopup(DISCONNECT_STATUS);
		}

		closePopup(network && DISCONNECT_STATUS);

		if (globals.WINDOW_TYPE === POPUP_WINDOW_TYPE) {
			this.props.history.goBack();

			return null;
		}

		this.props.history.push(INDEX_PATH);

		return null;
	}

	render() {
		const { network } = query.parse(this.props.location.search);
		const { isReturn } = this.props;

		return (
			<div className="transaction-status-wrap error">
				<div className="transaction-status-body">
					<div className="title">Error</div>
					{
						network || !isReturn ?
							<div className="description">
                                Connection was interrupted.
								<br /> Please, check transaction history to verify if transaction was sent.
							</div>
							:
							<div className="description">
                                A problem has occurred while sending <br /> your transaction
							</div>
					}
				</div>
				<div className="page-action-wrap">
					<div className="one-btn-wrap">
						<Button
							className="btn-inverted error"
							content={<span className="btn-text">Return</span>}
							onClick={(e) => this.onClick(e, network)}
						/>
					</div>
				</div>
			</div>
		);
	}

}

ErrorTransaction.propTypes = {
	isReturn: PropTypes.bool,
	history: PropTypes.object.isRequired,
	location: PropTypes.object.isRequired,
};

ErrorTransaction.defaultProps = {
	isReturn: true,
};

export default ErrorTransaction;
