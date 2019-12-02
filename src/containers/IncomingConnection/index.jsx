import React from 'react';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import connectImage from '../../assets/images/connection/connect.svg';

import { chooseProviderAccess } from '../../actions/GlobalActions';

class Access extends React.Component {

	render() {
		const { requests } = this.props;
		const provider = requests.first();

		return (
			<React.Fragment>

				<div className="incoming-connection-bg">
					<div className="page-header">New incoming connection</div>
				</div>
				<div className="incoming-connection-wrap">

					<div className="connection-block">
						<img className="connect" src={connectImage} alt="" />
					</div>

					<div className="connection-info">
						<div className="line">
							<span className="green">{provider}</span> is trying to connect to your Echo account using Bridge.
						</div>
						<div className="line">
							Would you like to approve access?
						</div>
					</div>
				</div>
				<div className="page-action-wrap">
					<div className="two-btn-wrap" >
						<Button className="btn-transparent link" onClick={() => this.props.reject(requests.keyOf(provider), provider)}>
							<span className="btn-text">Reject</span>
						</Button>
						<Button className="btn-in-light link" onClick={() => this.props.approve(requests.keyOf(provider), provider)}>
							<span className="btn-text">Approve</span>
						</Button>

					</div>
				</div>
			</React.Fragment>
		);

	}

}

Access.propTypes = {
	requests: PropTypes.object.isRequired,
	approve: PropTypes.func.isRequired,
	reject: PropTypes.func.isRequired,
};

export default connect(
	(state) => ({
		requests: state.global.get('providerRequests'),
	}),
	(dispatch) => ({
		approve: (id, origin) => dispatch(chooseProviderAccess(id, true, origin)),
		reject: (id, origin) => dispatch(chooseProviderAccess(id, false, origin)),
	}),
)(Access);
