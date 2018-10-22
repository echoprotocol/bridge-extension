import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';

class UserIcon extends React.PureComponent {


	render() {

		return (
			<div
				className={classnames(
					'user-icon-wrap',
					{ big: this.props.big },
					{ medium: this.props.medium },
					this.props.color,
					this.props.avatar,
				)}
			>
				<i aria-hidden="true" className={classnames(`icon-${this.props.avatar}`)} />

			</div>

		);
	}

}

UserIcon.propTypes = {
	avatar: PropTypes.string.isRequired,
	color: PropTypes.string,
	big: PropTypes.bool,
	medium: PropTypes.bool,
};
UserIcon.defaultProps = {
	color: 'green',
	big: false,
	medium: false,
};
export default connect(
	() => ({
	}),
	() => ({}),
)(UserIcon);

