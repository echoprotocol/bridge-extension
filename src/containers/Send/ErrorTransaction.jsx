import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

import { closePopup } from '../../actions/SignActions';

class ErrorTransaction extends React.PureComponent {

	onClick() {
		closePopup();
		this.props.history.goBack();
	}

	render() {
		return (
			<div className="transaction-status-wrap error">
				<div className="transaction-status-body">
					<div className="title">Error</div>
					<div className="description">
                    A problem has occurred while sending <br /> your transaction
					</div>
				</div>
				<div className="page-action-wrap">
					<div className="one-btn-wrap">
						<Button
							className="btn-inverted error"
							content={<span className="btn-text">Return</span>}
							onClick={() => this.onClick()}
						/>
					</div>
				</div>
			</div>
		);
	}

}

ErrorTransaction.propTypes = {
	history: PropTypes.object.isRequired,
};

export default ErrorTransaction;
