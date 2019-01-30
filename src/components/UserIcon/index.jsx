import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Button } from 'semantic-ui-react';
import { KEY_CODE_ENTER, KEY_CODE_SPACE, BASE_ICON } from '../../constants/GlobalConstants';

import '../../assets/images/avatars/ava1.svg';
import '../../assets/images/avatars/ava2.svg';
import '../../assets/images/avatars/ava3.svg';
import '../../assets/images/avatars/ava4.svg';
import '../../assets/images/avatars/ava5.svg';
import '../../assets/images/avatars/ava6.svg';
import '../../assets/images/avatars/ava7.svg';
import '../../assets/images/avatars/ava8.svg';
import '../../assets/images/avatars/ava9.svg';
import '../../assets/images/avatars/ava10.svg';
import '../../assets/images/avatars/ava11.svg';
import '../../assets/images/avatars/ava12.svg';
import '../../assets/images/avatars/ava13.svg';
import '../../assets/images/avatars/ava14.svg';
import '../../assets/images/avatars/ava15.svg';

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

	getImgUrl(avatar) {
		if (avatar === 'avaundefined') {
			return `/images/avanpm${BASE_ICON}.svg`;
		}
		return `/images/${avatar}.svg`;
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
					<img
						src={this.getImgUrl(this.props.avatar)}
						alt={this.props.avatar}
					/>
				</div>
				{ this.props.animationChange ? this.renderAnimationChange() : null }
				{ this.props.animationBack ? this.renderAnimationBack() : null }

			</Button>

		);
	}

}

UserIcon.propTypes = {
	avatar: PropTypes.string,
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
	avatar: 'ava1',
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
