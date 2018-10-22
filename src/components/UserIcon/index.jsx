import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';

class UserIcon extends React.PureComponent {


	renderAnimationChange() {
		return (
			<React.Fragment>
				<div className="animation-blobs">
					<div className="blob" />
					<div className="blob" />
				</div>
				<a href="" className="animation-text">
                    Change <br /> avatar
				</a>
			</React.Fragment>
		);
	}

	render() {

		return (
			<div
				className={classnames(
					'user-icon-wrap',
					{ big: this.props.big },

					{ 'change-animation': this.props.animationChange },

					{ medium: this.props.medium },

					this.props.color,
				)}
			>
				<div className="content">
					<i aria-hidden="true" className={classnames(`icon-${this.props.avatar}`)} />
				</div>
				{ this.props.animationChange ? this.renderAnimationChange() : null }

			</div>

		);
	}

}

UserIcon.propTypes = {
	avatar: PropTypes.string.isRequired,
	color: PropTypes.string,
	big: PropTypes.bool,
	animationChange: PropTypes.bool,
	medium: PropTypes.bool,
};
UserIcon.defaultProps = {
	color: 'green',
	big: false,
	animationChange: false,

	medium: false,
};
export default connect(
	() => ({
	}),
	() => ({}),
)(UserIcon);

