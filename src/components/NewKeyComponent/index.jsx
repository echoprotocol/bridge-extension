import React from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';

import UserIcon from '../UserIcon';
import ArrowDown from '../../assets/images/icons/arrow_dark_bot.svg';

class NewKeyComponent extends React.Component {

	render() {
		const {
			name, icon, iconColor,
		} = this.props;


		return (
			<div className="welcome-wrap">

				<UserIcon
					color={iconColor}
					animationChange
					size="big"
					avatar={`ava${icon}`}
					onClickIcon={() => this.props.onChangeIcon()}
				/>

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


NewKeyComponent.defaultProps = {
	onChangeIcon: null,
};

NewKeyComponent.propTypes = {
	name: PropTypes.string.isRequired,
	icon: PropTypes.number.isRequired,
	iconColor: PropTypes.string.isRequired,
	proceed: PropTypes.func.isRequired,
	onChangeIcon: PropTypes.func,
};

export default NewKeyComponent;
