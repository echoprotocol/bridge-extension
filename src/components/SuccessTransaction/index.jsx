import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';

class SuccessTransaction extends React.PureComponent {

	render() {
		return (
			<div className="success-wrap">
				<div className="page-action-wrap">
					<div className="one-btn-wrap">
						<Button
							className="btn-inverted success"
							content={<span className="btn-text">Proceed</span>}
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
)(SuccessTransaction);
