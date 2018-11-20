import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import query from 'query-string';

import { closePopup } from '../../actions/SignActions';

import { DISCONNECT_STATUS } from '../../constants/GlobalConstants';

class ErrorTransaction extends React.PureComponent {

	onClick(e, network) {
		closePopup(network && DISCONNECT_STATUS);
		this.props.history.goBack();
	}

	render() {
		const { network } = query.parse(this.props.location.search);

		return (
			<div className="transaction-status-wrap error">
				<div className="transaction-status-body">
					<div className="title">Error</div>
					{
						network ?
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
	history: PropTypes.object.isRequired,
	location: PropTypes.object.isRequired,
};

export default ErrorTransaction;
