import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Button } from 'semantic-ui-react';

import { KEY_CODE_ENTER, KEY_CODE_SPACE } from '../../constants/GlobalConstants';

/* eslint-disable no-unused-vars */
import ava1 from '../../assets/images/avatars/ava1.svg';
import ava2 from '../../assets/images/avatars/ava2.svg';
import ava3 from '../../assets/images/avatars/ava3.svg';
import ava4 from '../../assets/images/avatars/ava4.svg';
import ava5 from '../../assets/images/avatars/ava5.svg';
import ava6 from '../../assets/images/avatars/ava6.svg';
import ava7 from '../../assets/images/avatars/ava7.svg';
import ava8 from '../../assets/images/avatars/ava8.svg';
import ava9 from '../../assets/images/avatars/ava9.svg';
import ava10 from '../../assets/images/avatars/ava10.svg';
import ava11 from '../../assets/images/avatars/ava11.svg';
import ava12 from '../../assets/images/avatars/ava12.svg';
import ava13 from '../../assets/images/avatars/ava13.svg';
import ava14 from '../../assets/images/avatars/ava14.svg';
import ava15 from '../../assets/images/avatars/ava15.svg';
/* eslint-enable no-unused-vars */

class UserIcon extends React.PureComponent {

	onClick() {
		if (this.props.onClickIcon) {
			this.props.onClickIcon();
		}
	}

	onKeyPress(e) {
		const code = e.keyCode || e.which;

		if (this.props.onClickIcon && [KEY_CODE_ENTER, KEY_CODE_SPACE].includes(code)) {
			this.props.onClickIcon();
		}
	}

	renderAnimationChange() {
		return (
			<React.Fragment>
				<div className="animation-text">
                    Change <br /> avatar
				</div>
				<Button as="div" className="animation-blobs">
					<div className="blob" />
					<div className="blob" />
				</Button>

			</React.Fragment>
		);
	}

	renderAnimationBack() {
		return (
			<Button
				as="div"
				className="animation-blobs"
			>
				<div className="blob" />
				<div className="blob" />
			</Button>
		);
	}

	render() {
		return (
			<Button
				tabIndex={this.props.tabSelect && !this.props.active ? '0' : '-1'}
				as="div"
				className={classnames(
					'user-icon-wrap',
					this.props.size,
					{ 'change-animation': this.props.animationChange },
					{ 'back-animation': this.props.animationBack },
					{ select: this.props.select },
					{ active: this.props.active },
					this.props.color,
				)}
				onClick={(e) => this.onClick(e)}
				onKeyPress={(e) => this.onKeyPress(e)}
			>
				<div className="content">
					{/* <i
						aria-hidden="true"
						className={classnames(`icon-${this.props.avatar}`)}
					/> */}

					<img src={`/images/${this.props.avatar}.svg`} alt="" />
				</div>
				{ this.props.animationChange ? this.renderAnimationChange() : null }
				{ this.props.animationBack ? this.renderAnimationBack() : null }

			</Button>

		);
	}

}

UserIcon.propTypes = {
	avatar: PropTypes.string.isRequired,
	color: PropTypes.string,
	size: PropTypes.string,
	animationChange: PropTypes.bool,
	animationBack: PropTypes.bool,
	select: PropTypes.bool,
	active: PropTypes.bool,
	tabSelect: PropTypes.bool,
	onClickIcon: PropTypes.func,

};
UserIcon.defaultProps = {
	color: 'green',
	size: 'small',
	animationChange: false,
	animationBack: false,
	select: false,
	active: false,
	tabSelect: false,
	onClickIcon: null,

};
export default UserIcon;
