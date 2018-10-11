import React from 'react';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router';

import { FORM_SIGN_UP } from '../../constants/FormConstants';

class SuccessAddNetwork extends React.Component {

	renderSuccess() {
		return (
			<div className="page">
				<div className="icon-network" />
				<div className="success-text"> Success </div>
				<div className="success-desc">
                    Network <span>Hallelujah</span> was succesfully created
				</div>
				<div className="one-btn-wrap">
					<Button
						compact
						className="btn-transparent"
						content={<span className="btn-text">ADD ACCOUNT</span>}
						onClick={() => this.props.history.push(FORM_SIGN_UP)}
					/>
				</div>
			</div>
		);
	}

	render() {
		return (
			<React.Fragment>
				<div className="return-block">
					<a href="#" className="link-return" onClick={() => this.props.history.goBack()}>
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
};

export default withRouter(SuccessAddNetwork);

