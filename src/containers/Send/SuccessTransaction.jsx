import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import query from 'query-string';

import { closePopup } from '../../actions/SignActions';

import { INDEX_PATH } from '../../constants/RouterConstants';

class SuccessTransaction extends React.PureComponent {

	onClick() {
		closePopup();
		const { index } = query.parse(this.props.location.search);

		if (index) {
			this.props.history.push(INDEX_PATH);
		} else {
			this.props.history.goBack();
		}
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
	location: PropTypes.object.isRequired,
};

export default SuccessTransaction;
