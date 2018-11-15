import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

import { INDEX_PATH } from '../../constants/RouterConstants';
import { closePopup } from '../../actions/SignActions';

class SuccessTransaction extends React.PureComponent {

	onClick() {
		closePopup();
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
	history: PropTypes.object.isRequired,
};

export default SuccessTransaction;
