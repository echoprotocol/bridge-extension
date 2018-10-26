import React from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import BridgeBtnCopy from '../BridgeBtnCopy';
import UserIcon from '../UserIcon';

class WelcomeComponent extends React.Component {

	render() {
		const {
			name, wif, icon, iconColor,
		} = this.props;

		return (
			<div className="welcome-wrap">

				<UserIcon
					color={iconColor}
					animationChange
					size="big"
					avatar={`ava${icon}`}
					onChangeIcon={() => this.props.onChangeIcon()}
				/>

				<div className="page-wrap" >
					<div className="page">
						<div className="hi-text">
							<div>{name},</div>
							<span>welcome to Bridge!</span>
						</div>
						{
							wif ?
								<React.Fragment>
									<div className="instruction-text">
                                        Save your WIF key and don’t loose it.
                                        You <br /> will need it to restore account.
									</div>
									<div className="wif-wrap">
										<div className="wif">{wif}</div>
										<BridgeBtnCopy compact text={wif} />

									</div>
								</React.Fragment> : null
						}
					</div>
					<div className="page-action-wrap">
						<div className="one-btn-wrap">
							<Button
								className="btn-noborder"
								onClick={(e) => this.props.proceed(e)}
								content={
									<div className="btn-text">
										<i className="icon-arrowDown" />
											Proceed
									</div>
								}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}

}


WelcomeComponent.defaultProps = {
	wif: '',
	onChangeIcon: null,
};

WelcomeComponent.propTypes = {
	wif: PropTypes.string,
	name: PropTypes.string.isRequired,
	icon: PropTypes.number.isRequired,
	iconColor: PropTypes.string.isRequired,
	proceed: PropTypes.func.isRequired,
	onChangeIcon: PropTypes.func,
};

export default withRouter(WelcomeComponent);
