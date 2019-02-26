import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

import { changeNetwork } from '../../actions/GlobalActions';

class ConnectionError extends React.Component {


	render() {

		return (
			<div className="connection-error-page">
				<span className="connection-error-text">Can’t connect to blockchain</span>
				<div className="one-btn-wrap" >
					<Button
						content={<span className="btn-text">Try Again</span>}
						onClick={() => this.props.tryToConnect()}
						className="btn-in-light"
					/>
				</div>
			</div>
		);
	}

}

ConnectionError.propTypes = {
	tryToConnect: PropTypes.func.isRequired,
};

export default connect(
	() => ({}),
	(dispatch) => ({
		tryToConnect: () => dispatch(changeNetwork()),
	}),
)(ConnectionError);
