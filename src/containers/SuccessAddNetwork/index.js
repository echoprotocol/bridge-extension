import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router';

import { SUCCESS_ADD_NETWORK_PATH } from '../../constants/RouterConstants';

class SuccessAddNetwork extends React.Component {

	renderSuccess() {
		const { network } = this.props;
		const networkName = network.get('name');
		return (
			<div className="page">
				<div className="icon-network" />
				<div className="success-text"> Success </div>
				<div className="success-desc">
                    Network <span>{networkName}</span> was succesfully created
				</div>
				<div className="one-btn-wrap">
					<Button
						compact
						className="btn-transparent"
						content={<span className="btn-text">ADD ACCOUNT</span>}
						onClick={() => this.props.history.push(SUCCESS_ADD_NETWORK_PATH)}
					/>
				</div>
			</div>
		);
	}

	render() {
		return (
			<React.Fragment>
				<div className="return-block">
					<a href={undefined} className="link-return" onClick={() => this.props.history.goBack()}>
						<i className="icon-return" />
						<span className="link-text">Return</span>
					</a>
				</div>
				<div className="page-wrap">
					{
						this.renderSuccess()
					}
				</div>

			</React.Fragment>


		);

	}

}

SuccessAddNetwork.propTypes = {
	history: PropTypes.object.isRequired,
	network: PropTypes.object.isRequired,
};

export default withRouter(connect((state) => ({
	network: state.global.get('network'),
}))(SuccessAddNetwork));

