import React from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';

import BridgeBtnCopy from '../BridgeBtnCopy';

class WelcomeComponent extends React.Component {

	render() {
		const { name, wif } = this.props;

		return (
			<React.Fragment>
				<div className="icon-pageAccount-in" />

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

WelcomeComponent.defaultProps = {
	wif: '',
};

WelcomeComponent.propTypes = {
	wif: PropTypes.string,
	name: PropTypes.string.isRequired,
	proceed: PropTypes.func.isRequired,
};


export default WelcomeComponent;
