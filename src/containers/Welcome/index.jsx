import React from 'react';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import BridgeBtnCopy from '../../components/BridgeBtnCopy/index';

class Welcome extends React.Component {

	render() {
		const { accountName, wif, isCreate } = this.props;

		return (


			<React.Fragment>
				<div className="icon-pageAccount-in" />

				<div className="page-wrap" >
					<div className="page">
						<div className="hi-text">
							<div>{accountName},</div>
							<span>welcome to Bridge!</span>
						</div>
						{
							isCreate &&
							<React.Fragment>
								<div className="instruction-text">
                            Save your WIF key and don’t loose it.
                            You <br /> will need it to restore account.
								</div>
								<div className="wif-wrap">
									<div className="wif">{wif}</div>
									<BridgeBtnCopy compact text={wif} />

								</div>
							</React.Fragment>
						}
					</div>
					<div className="page-action-wrap">
						<div className="one-btn-wrap">
							<Button
								className="btn-in-light"
								onClick={() => this.props.history.goBack()}
								content={<span className="btn-text">Proceed</span>}
							/>
						</div>
					</div>
				</div>

			</React.Fragment>


		);

	}

}

Welcome.propTypes = {
	wif: PropTypes.string.isRequired,
	accountName: PropTypes.string.isRequired,
	isCreate: PropTypes.bool.isRequired,
	history: PropTypes.object.isRequired,
};

export default connect(
	(state) => ({
		wif: state.welcome.get('wif'),
		isCreate: state.welcome.get('isCreate'),
		accountName: state.global.getIn(['activeUser', 'name']),
	}),
	() => ({}),
)(Welcome);
