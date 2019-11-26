import React from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';

import Avatar from '../Avatar';
import ArrowDown from '../../assets/images/icons/arrow_dark_bot.svg';

class NewKeyComponent extends React.Component {

	render() {
		const {
			name,
		} = this.props;


		return (
			<div className="welcome-wrap">
				<div className="user-icon-wrap">
					{{ name }}
					<Avatar
						accountName={name}
						size="86"
					/>
				</div>

				<div className="page-wrap" >
					<div className="page">
						<div className="hi-text">
							<span>Key was successfully added to </span>
							<div>{name}</div>
						</div>
					</div>
					<div className="page-action-wrap">
						<div className="one-btn-wrap">
							<Button
								className="btn-noborder"
								onClick={(e) => this.props.proceed(e)}
							>
								<div className="btn-text">
									<img src={ArrowDown} alt="" />
									Proceed
								</div>
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

}

NewKeyComponent.propTypes = {
	name: PropTypes.string.isRequired,
	proceed: PropTypes.func.isRequired,
};

export default NewKeyComponent;
