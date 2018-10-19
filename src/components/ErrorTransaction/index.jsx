import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';

class ErrorTransaction extends React.PureComponent {

	render() {
		return (
			<div className="transaction-status-wrap error">
				<div className="transaction-status-body">
					<div className="title">Error</div>
					<div className="description">
                    A problem has occured while sending <br /> your transaction
					</div>
				</div>
				<div className="page-action-wrap">
					<div className="one-btn-wrap">
						<Button
							className="btn-inverted error"
							content={<span className="btn-text">Return</span>}
						/>
					</div>
				</div>
			</div>
		);
	}

}


export default connect(
	() => ({}),
	() => ({}),
)(ErrorTransaction);
