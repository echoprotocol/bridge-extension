import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { Button } from 'semantic-ui-react';

class UserIcon extends React.PureComponent {

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
				onClick={this.props.onChangeIcon && (() => this.props.onChangeIcon())}
			>
				<div className="content">
					<i
						aria-hidden="true"
						className={classnames(`icon-${this.props.avatar}`)}
					/>
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
	onChangeIcon: PropTypes.func,

};
UserIcon.defaultProps = {
	color: 'green',
	size: 'small',
	animationChange: false,
	animationBack: false,
	select: false,
	active: false,
	tabSelect: false,
	onChangeIcon: null,

};
export default connect(
	() => ({
	}),
	() => ({}),
)(UserIcon);

