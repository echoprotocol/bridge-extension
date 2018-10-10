import React from 'react';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import BridgeBtnCopy from '../../components/BridgeBtnCopy/index';

class Welcome extends React.Component {

	componentWillUnmount() {
		this.props.resetWif();
	}

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
								className="btn-noborder"
								onClick={() => this.props.resetWif()}
								content={
									<React.Fragment>
										<i className="icon-arrowDown" />
										<span className="btn-text">Proceed</span>
									</React.Fragment>
								}
							/>
						</div>
					</div>
				</div>

			</React.Fragment>
		);

	}

}

Welcome.propTypes = {
	wif: PropTypes.string,
	accountName: PropTypes.string.isRequired,
	isCreate: PropTypes.bool.isRequired,
	resetWif: PropTypes.func.isRequired,
};

Welcome.defaultProps = {
	wif: '',
};

export default connect(
	(state) => ({
		isCreate: state.welcome.get('isCreate'),
		accountName: state.global.getIn(['activeUser', 'name']),
	}),
	() => ({}),
)(Welcome);
