import React from 'react';
import { connect } from 'react-redux';

class SuccessTransaction extends React.PureComponent {

	render() {
		return (
			<div className="success-wrap">
				<div className="plane" />
			</div>
		);
	}

}


export default connect(
	() => ({}),
	() => ({}),
)(SuccessTransaction);
